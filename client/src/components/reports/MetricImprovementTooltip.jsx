import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Lightbulb, Info } from 'lucide-react';

/**
 * Computes dynamic interpretation and 1-3 practical improvement tips based on metric key and actual value.
 */
export const getMetricInsight = (metricKey, rawValue, displayValue) => {
  const key = (metricKey || '').toLowerCase();
  const numVal = typeof rawValue === 'number' ? rawValue : parseFloat(rawValue) || 0;

  let metricName = (metricKey || 'METRIC').toUpperCase();
  let interpretation = '';
  let tips = [];

  if (key.includes('pacing') || key === 'wpm' || key.includes('speed')) {
    metricName = 'PACING';
    if (numVal === 0 || numVal < 60) {
      interpretation = 'Your speaking pace could not be reliably measured / the recorded speech contains insufficient spoken words.';
      tips = [
        'Make sure your microphone is capturing your speech.',
        'Speak continuously during the presentation.',
        'Avoid long silent pauses.'
      ];
    } else if (numVal >= 60 && numVal < 110) {
      interpretation = `Your speaking pace is quite slow (${numVal} WPM). A slow pace can cause audience attention to drift during technical explanations.`;
      tips = [
        'Slightly increase your delivery momentum on transition slides.',
        'Reduce extended silent pauses between thought groups.',
        'Practice speaking with energetic, forward pitch projection.'
      ];
    } else if (numVal >= 110 && numVal <= 160) {
      interpretation = `Optimal speaking pace (${numVal} WPM)! Your cadence allows for clear listener comprehension and natural engagement.`;
      tips = [
        'Maintain this balanced, steady pace across all slide sections.',
        'Use brief 1-second intentional pauses after key takeaways for emphasis.',
        'Vary your voice pitch slightly to highlight critical numbers or metrics.'
      ];
    } else {
      interpretation = `Your speaking pace is very fast (${numVal} WPM). High speed makes it difficult for listeners to absorb key arguments.`;
      tips = [
        'Slow down your speech and take deliberate deep breaths between sentences.',
        'Insert a full 2-second pause when transitioning to a new slide.',
        'Focus on enunciating key technical terms and data numbers clearly.'
      ];
    }
  } else if (key.includes('filler') || key.includes('fillers')) {
    metricName = 'FILLERS';
    if (numVal === 0) {
      interpretation = 'Outstanding! Zero filler words were detected during your presentation speech. Your delivery sounds authoritative and confident.';
      tips = [
        'Maintain your strong vocal discipline in future live pitch sessions.',
        'Continue using brief silent pauses when organizing thoughts.',
        'Keep sentence structures concise and direct.'
      ];
    } else if (numVal <= 3) {
      interpretation = `Low filler word count (${numVal} word${numVal > 1 ? 's' : ''}). Your delivery is clean and easy to follow.`;
      tips = [
        'Continue replacing minor filler sounds with silent 1-second pauses.',
        'Stay conscious of filler words during slide transition moments.',
        'Keep sentences short to prevent filler word creep.'
      ];
    } else if (numVal <= 7) {
      interpretation = `Moderate filler words detected (${numVal} occurrences). Frequent filler words can undermine authority during technical Q&A defense.`;
      tips = [
        'Pause silently for 1 second instead of saying "um", "ah", or "like".',
        'Rehearse slide transition sentences until they are muscle memory.',
        'Slow down overall speaking speed to give yourself time to formulate thoughts.'
      ];
    } else {
      interpretation = `High filler word frequency (${numVal} occurrences detected). This significantly detracts from presentation clarity and confidence.`;
      tips = [
        'Practice the "Pause & Breath" technique: stop speaking completely when thinking.',
        'Record and listen back to a 2-minute mock run focused solely on zero fillers.',
        'Memorize key opening lines for each slide so you start sentences with conviction.'
      ];
    }
  } else if (key.includes('duration') || key.includes('time')) {
    metricName = 'DURATION';
    interpretation = `Total presentation duration was ${displayValue || numVal + 's'}. Keeping slide timing balanced maintains strong audience engagement.`;
    tips = [
      'Aim for 1 to 2 minutes per slide on core problem/solution topics.',
      'Avoid spending more than 3 minutes on a single slide unless taking Q&A.',
      'Pace transition slides cleanly to avoid rushing at the end.'
    ];
  } else {
    metricName = (metricKey || 'METRIC').toUpperCase();
    interpretation = `Measured performance value: ${displayValue || numVal}. Regular practice builds consistent delivery and strong viva scores.`;
    tips = [
      'Review slide key points before speaking.',
      'Practice answering AI interview questions out loud.',
      'Focus on clear, quantitative slide arguments.'
    ];
  }

  return {
    metricName,
    interpretation,
    tips
  };
};

export const MetricImprovementTooltip = ({
  metricKey,
  rawValue,
  displayValue,
  children,
  interpretation: customInterpretation,
  tips: customTips,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pos, setPos] = useState({ vertical: 'top', horizontal: 'center' });
  const wrapperRef = useRef(null);
  const hoverTimeoutRef = useRef(null);

  const insight = getMetricInsight(metricKey, rawValue, displayValue);
  const finalMetricName = insight.metricName;
  const finalDisplayValue = displayValue || String(rawValue ?? '');
  const finalInterpretation = customInterpretation || insight.interpretation;
  const finalTips = customTips && customTips.length > 0 ? customTips : insight.tips;

  const calculatePosition = () => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let vertical = 'top';
    if (rect.top < 220) {
      vertical = 'bottom';
    }

    let horizontal = 'center';
    if (rect.left < 160) {
      horizontal = 'left';
    } else if (windowWidth - rect.right < 160) {
      horizontal = 'right';
    }

    setPos({ vertical, horizontal });
  };

  const handleMouseEnter = () => {
    calculatePosition();
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const handleClick = (e) => {
    e.stopPropagation();
    calculatePosition();
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  const posClass =
    pos.vertical === 'top'
      ? pos.horizontal === 'left'
        ? 'bottom-full mb-2.5 left-0'
        : pos.horizontal === 'right'
        ? 'bottom-full mb-2.5 right-0'
        : 'bottom-full mb-2.5 left-1/2 -translate-x-1/2'
      : pos.horizontal === 'left'
      ? 'top-full mt-2.5 left-0'
      : pos.horizontal === 'right'
      ? 'top-full mt-2.5 right-0'
      : 'top-full mt-2.5 left-1/2 -translate-x-1/2';

  return (
    <div
      ref={wrapperRef}
      className={`relative inline-block w-full ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}

      {/* Dark AI Polished Tooltip / Popover Modal */}
      <div
        className={`absolute z-50 w-72 sm:w-80 p-4 rounded-2xl bg-[#0B1120]/95 backdrop-blur-xl border border-purple-500/40 shadow-2xl text-left transition-all duration-200 ease-out transform ${posClass} ${
          isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
        style={{
          boxShadow: '0 20px 40px -15px rgba(139, 92, 246, 0.4)'
        }}
      >
        {/* Metric Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-2.5">
          <div>
            <span className="text-[11px] font-extrabold text-purple-400 tracking-wider uppercase block">
              {finalMetricName}
            </span>
            <span className="text-base font-extrabold text-white">
              {finalDisplayValue}
            </span>
          </div>
          <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Interpretation Section */}
        <div className="mb-3 space-y-1">
          <span className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-cyan-400" /> Interpretation:
          </span>
          <p className="text-xs text-slate-200 leading-relaxed font-medium pl-1">
            {finalInterpretation}
          </p>
        </div>

        {/* How to Improve Section */}
        <div className="space-y-1.5 pt-2 border-t border-white/10">
          <span className="text-[11px] font-extrabold text-amber-300 uppercase tracking-wider flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> How to improve:
          </span>
          <ul className="space-y-1.5 pl-1">
            {finalTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-300 leading-normal">
                <span className="text-purple-400 font-bold shrink-0 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
