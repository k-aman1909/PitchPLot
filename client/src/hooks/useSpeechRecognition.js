import { useState, useEffect, useRef, useCallback } from 'react';
import { detectFillerWords } from '../utils/fillerWords';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [wpm, setWpm] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fillerStats, setFillerStats] = useState({ count: 0, breakdown: {} });
  const [error, setError] = useState(null);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentFinal = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            currentFinal += result[0].transcript + ' ';
          } else {
            currentInterim += result[0].transcript;
          }
        }

        if (currentFinal) {
          setTranscript(prev => {
            const newText = prev + currentFinal;
            setFillerStats(detectFillerWords(newText));
            return newText;
          });
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition notice:', event.error);
        if (event.error !== 'no-speech') {
          setError(event.error);
        }
      };

      recognition.onend = () => {
        if (isListening) {
          try {
            recognition.start();
          } catch (e) {
            // Already started or busy
          }
        }
      };

      recognitionRef.current = recognition;
    } else {
      setError('Browser Speech Recognition not natively supported. Fallback text practice ready.');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Update timer & WPM calculation
  useEffect(() => {
    if (isListening) {
      startTimeRef.current = Date.now() - duration * 1000;
      timerRef.current = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsedSeconds);

        const words = (transcript + ' ' + interimTranscript).trim().split(/\s+/).filter(Boolean).length;
        const minutes = Math.max(elapsedSeconds / 60, 0.05);
        setWpm(Math.round(words / minutes));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isListening, transcript, interimTranscript]);

  const startListening = useCallback(() => {
    setError(null);
    setIsListening(true);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn('Recognition start exception:', e.message);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setDuration(0);
    setWpm(0);
    setFillerStats({ count: 0, breakdown: {} });
  }, []);

  const appendManualText = useCallback((text) => {
    setTranscript(prev => {
      const updated = prev ? `${prev} ${text}` : text;
      setFillerStats(detectFillerWords(updated));
      return updated;
    });
  }, []);

  return {
    isListening,
    transcript,
    interimTranscript,
    fullTranscript: (transcript + ' ' + interimTranscript).trim(),
    wpm,
    duration,
    fillerStats,
    error,
    startListening,
    stopListening,
    resetTranscript,
    appendManualText,
    setTranscript
  };
};
