import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Presentation from '../models/Presentation.js';
import Report from '../models/Report.js';
import InterviewSession from '../models/InterviewSession.js';
import { runAIInterviewEngineV2 } from '../services/interviewEngine/index.js';
import { cleanQuestionText } from '../services/interviewEngine/cleanQuestionText.js';
import { evaluateQnAResponse } from '../services/geminiService.js';
import { inMemoryStore } from '../config/inMemoryStore.js';
import mongoose from 'mongoose';

export const generateQuestionsForPresentation = async (req, res) => {
  try {
    const { presentationId, reportId, spokenTranscript, count, existingQuestions, roundNumber, userWeaknesses } = req.body;
    const userId = req.user.id;

    if (!presentationId) {
      return res.status(400).json({ message: 'presentationId is required' });
    }

    let presentation = null;
    if (presentationId && presentationId !== 'demo_presentation_id') {
      if (mongoose.connection.readyState === 1) {
        presentation = await Presentation.findById(presentationId);
      } else {
        presentation = inMemoryStore.findById('presentations', presentationId);
      }
    }

    // Fallback: If presentation is null or ID was demo_presentation_id, fetch user's latest uploaded presentation
    if (!presentation) {
      if (mongoose.connection.readyState === 1) {
        presentation = await Presentation.findOne({ userId }).sort({ createdAt: -1 });
        if (!presentation) {
          presentation = await Presentation.findOne().sort({ createdAt: -1 });
        }
      } else {
        const userPresList = inMemoryStore.find('presentations', { userId });
        if (userPresList && userPresList.length > 0) {
          userPresList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          presentation = userPresList[0];
        } else {
          const allPres = inMemoryStore.getCollection('presentations') || [];
          if (allPres.length > 0) {
            presentation = allPres[allPres.length - 1];
          }
        }
      }
    }

    let slideText = '';
    if (presentation) {
      if (presentation.slides && Array.isArray(presentation.slides) && presentation.slides.length > 0) {
        slideText = presentation.slides.map(s => `SLIDE ${s.slideNumber}: ${s.title || ''}\n${s.content || ''}`).join('\n\n');
      }
      if (!slideText || slideText.trim().length < 50) {
        slideText = presentation.fullText || JSON.stringify(presentation.slides);
      }
    } else {
      slideText = 'Uploaded presentation deck arguments.';
    }

    const presentationTitle = presentation ? presentation.title : 'Presentation Q&A Viva';
    const activePresId = presentation?._id?.toString() || presentationId;

    let finalTranscript = spokenTranscript || '';

    // If spokenTranscript was not provided in request body, resolve transcript from stored Report
    if (!finalTranscript || finalTranscript.trim().length < 5) {
      let reportDoc = null;
      if (reportId) {
        if (mongoose.connection.readyState === 1) {
          reportDoc = await Report.findById(reportId);
        } else {
          reportDoc = inMemoryStore.findById('reports', reportId);
        }
      }
      if (!reportDoc) {
        if (mongoose.connection.readyState === 1) {
          reportDoc = await Report.findOne({ userId, presentationId: activePresId }).sort({ createdAt: -1 });
        } else {
          const userReports = inMemoryStore.find('reports', { userId, presentationId: activePresId });
          if (userReports && userReports.length > 0) {
            userReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            reportDoc = userReports[0];
          }
        }
      }
      if (reportDoc && reportDoc.transcript) {
        finalTranscript = reportDoc.transcript;
      }
    }

    let existingSession = null;
    if (mongoose.connection.readyState === 1) {
      existingSession = await InterviewSession.findOne({ userId, presentationId: activePresId });
    } else {
      existingSession = inMemoryStore.findOne('interviewSessions', { userId, presentationId: activePresId });
    }

    // Run AI Interview Engine V2 (Per-Concept Iterative Generation + Coverage Table + Memory Engine + Quality Ranking)
    const pipelineResult = await runAIInterviewEngineV2({
      presentationTitle,
      slides: presentation?.slides || [],
      slideText,
      spokenTranscript: finalTranscript,
      existingSession,
      askedQuestions: existingQuestions || [],
      roundNumber: roundNumber || 1,
      count: count || 20
    });

    const concepts = pipelineResult.concepts || [];
    const conceptDetails = pipelineResult.conceptDetails || [];
    const coverageTable = pipelineResult.coverageTable || [];
    const askedMemory = pipelineResult.askedMemory || [];
    const questionsRaw = pipelineResult.questions || [];

    const stage1AnalysisJson = pipelineResult.stage1AnalysisJson || null;

    // STEP 3 & STEP 7: Store/Update InterviewSession in Database
    let interviewSession = null;

    if (mongoose.connection.readyState === 1) {
      interviewSession = await InterviewSession.findOne({ userId, presentationId: activePresId });
      if (!interviewSession) {
        interviewSession = await InterviewSession.create({
          userId,
          presentationId: activePresId,
          stage1AnalysisJson,
          concepts,
          conceptDetails,
          coverageTable,
          askedMemory,
          askedQuestions: questionsRaw.map(q => q.questionText),
          coveredConcepts: questionsRaw.map(q => q.conceptTopic || q.conceptTitle).filter(Boolean),
          uncoveredConcepts: concepts.filter(c => !questionsRaw.some(q => (q.conceptTopic || q.conceptTitle) === c)),
          roundNumber: roundNumber || 1
        });
      } else {
        const updatedAsked = Array.from(new Set([...(interviewSession.askedQuestions || []), ...questionsRaw.map(q => q.questionText)]));
        const updatedCovered = Array.from(new Set([...(interviewSession.coveredConcepts || []), ...questionsRaw.map(q => q.conceptTopic || q.conceptTitle).filter(Boolean)]));
        const updatedUncovered = concepts.filter(c => !updatedCovered.includes(c));

        interviewSession.stage1AnalysisJson = stage1AnalysisJson || interviewSession.stage1AnalysisJson;
        interviewSession.concepts = concepts;
        interviewSession.conceptDetails = conceptDetails;
        interviewSession.coverageTable = coverageTable;
        interviewSession.askedMemory = askedMemory;
        interviewSession.askedQuestions = updatedAsked;
        interviewSession.coveredConcepts = updatedCovered;
        interviewSession.uncoveredConcepts = updatedUncovered;
        interviewSession.roundNumber = roundNumber || 1;
        await interviewSession.save();
      }
    } else {
      interviewSession = inMemoryStore.findOne('interviewSessions', { userId, presentationId: activePresId });
      if (!interviewSession) {
        interviewSession = inMemoryStore.insert('interviewSessions', {
          userId,
          presentationId: activePresId,
          stage1AnalysisJson,
          concepts,
          conceptDetails,
          coverageTable,
          askedMemory,
          askedQuestions: questionsRaw.map(q => q.questionText),
          coveredConcepts: questionsRaw.map(q => q.conceptTopic || q.conceptTitle).filter(Boolean),
          uncoveredConcepts: concepts.filter(c => !questionsRaw.some(q => (q.conceptTopic || q.conceptTitle) === c)),
          roundNumber: roundNumber || 1
        });
      } else {
        const updatedAsked = Array.from(new Set([...(interviewSession.askedQuestions || []), ...questionsRaw.map(q => q.questionText)]));
        const updatedCovered = Array.from(new Set([...(interviewSession.coveredConcepts || []), ...questionsRaw.map(q => q.conceptTopic || q.conceptTitle).filter(Boolean)]));
        const updatedUncovered = concepts.filter(c => !updatedCovered.includes(c));

        inMemoryStore.update('interviewSessions', { _id: interviewSession._id }, {
          stage1AnalysisJson: stage1AnalysisJson || interviewSession.stage1AnalysisJson,
          concepts,
          conceptDetails,
          coverageTable,
          askedMemory,
          askedQuestions: updatedAsked,
          coveredConcepts: updatedCovered,
          uncoveredConcepts: updatedUncovered,
          roundNumber: roundNumber || 1
        });
      }
    }

    const savedQuestions = [];
    for (const q of questionsRaw) {
      const cleanTitle = (q.conceptTitle || q.conceptTopic || 'General Topic').replace(/^slide\s*\d+\s*[:\-]\s*/i, '').trim();
      const cleanText = cleanQuestionText(q.questionText, cleanTitle, q.slideNumber || 1);

      const qData = {
        userId,
        presentationId: activePresId,
        reportId: reportId || '',
        questionId: q.questionId || `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        conceptId: q.conceptId || `c_node_${Date.now()}`,
        conceptTitle: cleanTitle,
        questionType: q.questionType || 'why',
        priorityReason: q.priorityReason || 'weak',
        questionText: cleanText,
        roundNumber: q.roundNumber || roundNumber || 1,
        category: q.category || cleanTitle || 'General',
        difficulty: q.difficulty || 'Medium',
        slideNumber: q.slideNumber || 1,
        interviewerPersona: q.interviewerPersona || 'Presentation Judge',
        idealAnswerHint: q.idealAnswerHint || '',
        expectedKeyPoints: q.expectedKeyPoints || []
      };

      if (mongoose.connection.readyState === 1) {
        const created = await Question.create(qData);
        savedQuestions.push(created);
      } else {
        const created = inMemoryStore.insert('questions', qData);
        savedQuestions.push(created);
      }
    }

    const totalConcepts = concepts.length;
    const coveredConceptsCount = coverageTable.filter(c => c.coveragePercent > 0).length;
    const overallCoveragePercent = totalConcepts > 0 ? Math.round(coverageTable.reduce((acc, c) => acc + (c.coveragePercent || 0), 0) / totalConcepts) : 0;
    const remainingConceptsCount = totalConcepts - coveredConceptsCount;

    res.status(201).json({
      message: 'AI Audience questions generated from stored Knowledge Map concepts',
      interviewSession: {
        sessionId: interviewSession?._id,
        concepts,
        askedCount: interviewSession?.askedQuestions?.length || savedQuestions.length,
        uncoveredCount: interviewSession?.uncoveredConcepts?.length || 0,
        coverageTable,
        askedMemory
      },
      debugStats: {
        totalConcepts,
        coveredConcepts: coveredConceptsCount,
        overallCoveragePercent,
        questionsGenerated: askedMemory.length || savedQuestions.length,
        duplicatesIntercepted: Math.max(0, (concepts.length * 2) - askedMemory.length),
        remainingConcepts: remainingConceptsCount
      },
      questions: savedQuestions
    });
  } catch (err) {
    console.error('Generate Q&A error:', err);
    res.status(500).json({ message: 'Failed to generate questions', error: err.message });
  }
};

export const getInterviewSessionDebug = async (req, res) => {
  try {
    const { presentationId } = req.params;
    const userId = req.user?.id || 'demo_user_id';

    let interviewSession = null;
    if (mongoose.connection.readyState === 1) {
      interviewSession = await InterviewSession.findOne({ presentationId });
    } else {
      interviewSession = inMemoryStore.findOne('interviewSessions', { presentationId });
    }

    if (!interviewSession) {
      return res.status(200).json({
        hasSession: false,
        message: 'No active AI Interview Session found for this presentation yet.'
      });
    }

    const concepts = interviewSession.concepts || [];
    const coverageTable = interviewSession.coverageTable || [];
    const askedMemory = interviewSession.askedMemory || [];

    const totalConcepts = concepts.length;
    const coveredConceptsCount = coverageTable.filter(c => c.coveragePercent > 0).length;
    const overallCoveragePercent = totalConcepts > 0 ? Math.round(coverageTable.reduce((acc, c) => acc + (c.coveragePercent || 0), 0) / totalConcepts) : 0;
    const remainingConceptsCount = totalConcepts - coveredConceptsCount;

    res.status(200).json({
      hasSession: true,
      debugStats: {
        totalConcepts,
        coveredConcepts: coveredConceptsCount,
        overallCoveragePercent,
        questionsGenerated: askedMemory.length || interviewSession.askedQuestions?.length || 0,
        duplicatesIntercepted: Math.max(0, (totalConcepts * 2) - askedMemory.length),
        remainingConcepts: remainingConceptsCount
      },
      coverageTable,
      askedMemory,
      concepts,
      conceptDetails: interviewSession.conceptDetails || []
    });
  } catch (err) {
    console.error('Fetch session debug error:', err);
    res.status(500).json({ message: 'Failed to fetch session debug stats', error: err.message });
  }
};

export const getQuestionsByPresentation = async (req, res) => {
  try {
    const { presentationId } = req.params;
    const userId = req.user?.id || 'demo_user_id';
    let questions = [];

    if (mongoose.connection.readyState === 1) {
      questions = await Question.find({ presentationId });
    } else {
      questions = inMemoryStore.find('questions', { presentationId });
    }

    // Filter out old generic template questions that might be cached from earlier tests
    questions = (questions || []).filter(q => 
      q.questionText &&
      !q.questionText.includes('competitive differentiator') &&
      !q.questionText.includes('Presentation Q&A Session') &&
      !q.questionText.includes('HTML Tutorial') &&
      !q.questionText.includes('Analyzing Slide') &&
      !q.questionText.includes('How Operational Mechanics') &&
      !q.questionText.includes('under high volume traffic')
    ).map(q => ({
      ...q,
      questionText: cleanQuestionText(q.questionText, q.conceptTitle || q.conceptTopic, q.slideNumber || 1)
    }));

    // If fetched questions is less than 15 or empty, generate 20 fresh concept map questions
    if (!questions || questions.length < 15) {
      let presentation = null;
      if (presentationId && presentationId !== 'demo_presentation_id') {
        if (mongoose.connection.readyState === 1) {
          presentation = await Presentation.findById(presentationId);
        } else {
          presentation = inMemoryStore.findById('presentations', presentationId);
        }
      }

      if (!presentation) {
        if (mongoose.connection.readyState === 1) {
          presentation = await Presentation.findOne({ userId }).sort({ createdAt: -1 });
        } else {
          const userPresList = inMemoryStore.find('presentations', { userId });
          if (userPresList && userPresList.length > 0) {
            userPresList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            presentation = userPresList[0];
          }
        }
      }

      let slideText = '';
      if (presentation) {
        if (presentation.slides && Array.isArray(presentation.slides) && presentation.slides.length > 0) {
          slideText = presentation.slides.map(s => `SLIDE ${s.slideNumber}: ${s.title || ''}\n${s.content || ''}`).join('\n\n');
        }
        if (!slideText || slideText.trim().length < 50) {
          slideText = presentation.fullText || JSON.stringify(presentation.slides);
        }
      } else {
        slideText = 'Uploaded presentation deck arguments.';
      }

      const presentationTitle = presentation ? presentation.title : 'Presentation Q&A Viva';

      // Look up transcript from Report
      let reportTranscript = '';
      let reportDoc = null;
      if (mongoose.connection.readyState === 1) {
        reportDoc = await Report.findOne({ presentationId }).sort({ createdAt: -1 });
      } else {
        const userReports = inMemoryStore.find('reports', { presentationId });
        if (userReports && userReports.length > 0) {
          userReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          reportDoc = userReports[0];
        }
      }
      if (reportDoc && reportDoc.transcript) {
        reportTranscript = reportDoc.transcript;
      }

      // Look up existing session
      let existingSession = null;
      if (mongoose.connection.readyState === 1) {
        existingSession = await InterviewSession.findOne({ presentationId });
      } else {
        existingSession = inMemoryStore.findOne('interviewSessions', { presentationId });
      }

      const pipelineResult = await runAIInterviewEngineV2({
        presentationTitle,
        slides: presentation?.slides || [],
        slideText,
        spokenTranscript: reportTranscript,
        existingSession,
        count: 20,
        askedQuestions: [],
        roundNumber: 1
      });

      const questionsRaw = pipelineResult.questions || [];

      const savedQuestions = [];
      for (const q of questionsRaw) {
        const cleanTitle = (q.conceptTitle || q.conceptTopic || 'General Topic').replace(/^slide\s*\d+\s*[:\-]\s*/i, '').trim();
        const cleanText = cleanQuestionText(q.questionText, cleanTitle, q.slideNumber || 1);

        const qData = {
          userId,
          presentationId,
          reportId: reportDoc?._id || '',
          questionId: q.questionId || `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          conceptId: q.conceptId || `c_node_${Date.now()}`,
          conceptTitle: cleanTitle,
          questionType: q.questionType || 'why',
          priorityReason: q.priorityReason || 'weak',
          questionText: cleanText,
          roundNumber: q.roundNumber || 1,
          category: q.category || cleanTitle || 'General',
          difficulty: q.difficulty || 'Medium',
          slideNumber: q.slideNumber || 1,
          interviewerPersona: q.interviewerPersona || 'Presentation Judge',
          idealAnswerHint: q.idealAnswerHint || '',
          expectedKeyPoints: q.expectedKeyPoints || []
        };

        if (mongoose.connection.readyState === 1) {
          const created = await Question.create(qData);
          savedQuestions.push(created);
        } else {
          const created = inMemoryStore.insert('questions', qData);
          savedQuestions.push(created);
        }
      }

      questions = savedQuestions;
    }

    res.json(questions);
  } catch (err) {
    console.error('Fetch questions error:', err);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { questionId, userTranscript, audioUrl } = req.body;
    const userId = req.user.id;

    if (!questionId || !userTranscript) {
      return res.status(400).json({ message: 'questionId and userTranscript are required' });
    }

    let question = null;
    if (mongoose.connection.readyState === 1) {
      question = await Question.findById(questionId);
    } else {
      question = inMemoryStore.findById('questions', questionId);
    }

    const questionText = question ? question.questionText : 'Audience Question';
    const expectedKeyPoints = question ? (question.expectedKeyPoints || []) : [];

    // Evaluate answer with Gemini AI
    const evaluation = await evaluateQnAResponse({
      questionText,
      expectedKeyPoints,
      userTranscript
    });

    const answerData = {
      userId,
      questionId,
      presentationId: question ? question.presentationId : '',
      userTranscript,
      audioUrl: audioUrl || '',
      score: evaluation.score,
      feedback: evaluation.feedback,
      keyPointsCovered: evaluation.keyPointsCovered,
      missingPoints: evaluation.missingPoints,
      improvementTips: evaluation.improvementTips,
      modelAnswer: evaluation.modelAnswer
    };

    let createdAnswer = null;
    if (mongoose.connection.readyState === 1) {
      createdAnswer = await Answer.create(answerData);
    } else {
      createdAnswer = inMemoryStore.insert('answers', answerData);
    }

    // STEP 7: Adaptive Interviewing - Update InterviewSession weaknesses & covered concepts in Database
    if (question && question.presentationId) {
      const presId = question.presentationId;
      const topic = question.category || question.questionText;

      if (mongoose.connection.readyState === 1) {
        const session = await InterviewSession.findOne({ userId, presentationId: presId });
        if (session) {
          if (evaluation.score < 60) {
            if (!session.conceptWeaknesses.includes(topic)) {
              session.conceptWeaknesses.push(topic);
            }
          } else {
            session.conceptWeaknesses = session.conceptWeaknesses.filter(w => w !== topic);
            if (!session.coveredConcepts.includes(topic)) {
              session.coveredConcepts.push(topic);
            }
          }
          await session.save();
        }
      } else {
        const session = inMemoryStore.findOne('interviewSessions', { userId, presentationId: presId });
        if (session) {
          let weaknesses = session.conceptWeaknesses || [];
          let covered = session.coveredConcepts || [];
          if (evaluation.score < 60) {
            if (!weaknesses.includes(topic)) weaknesses.push(topic);
          } else {
            weaknesses = weaknesses.filter(w => w !== topic);
            if (!covered.includes(topic)) covered.push(topic);
          }
          inMemoryStore.update('interviewSessions', { _id: session._id }, {
            conceptWeaknesses: weaknesses,
            coveredConcepts: covered
          });
        }
      }
    }

    res.status(201).json({
      message: 'Answer evaluated successfully',
      answer: createdAnswer
    });
  } catch (err) {
    console.error('Submit answer error:', err);
    res.status(500).json({ message: 'Failed to evaluate answer', error: err.message });
  }
};

export const getUserAnswers = async (req, res) => {
  try {
    const userId = req.user.id;
    let list = [];

    if (mongoose.connection.readyState === 1) {
      list = await Answer.find({ userId }).sort({ createdAt: -1 });
    } else {
      list = inMemoryStore.find('answers', { userId });
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch answer history' });
  }
};
