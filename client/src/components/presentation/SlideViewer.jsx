import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { PdfCanvasViewer } from './PdfCanvasViewer';
import {
  ChevronLeft,
  ChevronRight,
  Layers,
  Maximize2,
  List,
  ExternalLink,
  Trash2,
  Sparkles,
  Presentation,
  AlertTriangle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react';

export const SlideViewer = ({ presentation, currentSlideIndex, onSlideChange, onDeleteDeck }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState('canvas'); // 'canvas' | 'outline'
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dynamicTotalPages, setDynamicTotalPages] = useState(0);

  if (!presentation || !presentation.slides || presentation.slides.length === 0) {
    return (
      <Card className="h-full min-h-[480px] flex flex-col items-center justify-center text-center p-8 border-dashed border-slate-300 bg-white">
        <Presentation className="w-12 h-12 text-purple-600 mb-3 animate-bounce" />
        <h3 className="text-lg font-semibold text-slate-800">No Presentation Deck Loaded</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-xs">
          Upload a presentation PDF or PPTX to display slides in the interactive workspace.
        </p>
      </Card>
    );
  }

  // Resolved visual document URL (converted PDF or native PDF)
  const visualDocumentUrl = (presentation.pdfUrl && presentation.pdfUrl.toLowerCase().includes('.pdf'))
    ? presentation.pdfUrl
    : (presentation.fileUrl && presentation.fileUrl.toLowerCase().endsWith('.pdf') ? presentation.fileUrl : '');

  // Calculate actual total slides (take maximum of parsed slides length and loaded document page count)
  const totalSlides = Math.max(presentation.slides.length, dynamicTotalPages, presentation.slideCount || 1);

  // Generate complete slides list for outline & metadata mapping
  const fullSlides = Array.from({ length: totalSlides }).map((_, idx) => {
    return presentation.slides[idx] || {
      slideNumber: idx + 1,
      title: `Slide ${idx + 1}`,
      content: `Presentation Slide ${idx + 1} Content`,
      bulletPoints: ['Presentation slide content', 'Key deck argument'],
      keyTakeaway: `Key takeaway for slide ${idx + 1}`
    };
  });

  const currentSlide = fullSlides[currentSlideIndex] || fullSlides[0];

  const handlePrev = () => {
    if (currentSlideIndex > 0) {
      onSlideChange(currentSlideIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentSlideIndex < totalSlides - 1) {
      onSlideChange(currentSlideIndex + 1);
    }
  };

  // Keyboard Navigation: Left & Right arrow keys to slide deck effortlessly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        if (currentSlideIndex < totalSlides - 1) {
          e.preventDefault();
          onSlideChange(currentSlideIndex + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        if (currentSlideIndex > 0) {
          e.preventDefault();
          onSlideChange(currentSlideIndex - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlideIndex, totalSlides, onSlideChange]);

  const handleDeleteConfirm = async () => {
    if (!onDeleteDeck) return;
    setIsDeleting(true);
    try {
      await onDeleteDeck(presentation._id || presentation.id);
    } catch (e) {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-50 p-6' : ''}`}>
      {/* Slide Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between bg-white border border-slate-200 rounded-t-2xl px-4 py-2.5 gap-2 shadow-sm">
        <div className="flex items-center space-x-3 truncate">
          <Badge variant="purple" size="sm">
            <Layers className="w-3.5 h-3.5 mr-1 text-purple-600" />
            Slide {currentSlideIndex + 1} of {totalSlides}
          </Badge>
          <span className="text-sm font-bold text-slate-800 truncate max-w-[180px] sm:max-w-xs">
            {presentation.title}
          </span>
        </div>

        {/* Toolbar Action Buttons */}
        <div className="flex items-center space-x-2">
          <span className="hidden lg:inline-flex text-[10px] text-slate-500 font-semibold px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
            Use ← → keys to slide
          </span>

          {/* View Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'canvas'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Exact Rendered PowerPoint / PDF Slide Canvas"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Slide Canvas</span>
            </button>

            <button
              onClick={() => setViewMode('outline')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'outline'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Text Outline View for AI Review"
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Outline</span>
            </button>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrev}
              disabled={currentSlideIndex === 0}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Previous Slide (Left Arrow key)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleNext}
              disabled={currentSlideIndex === totalSlides - 1}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Next Slide (Right Arrow key)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {presentation.fileUrl && (
              <a
                href={presentation.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                title="Download / Open original file"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-colors"
              title="Delete presentation deck"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen View"}
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Slide Presentation Display Container */}
      <div className="flex-1 bg-slate-100 border-x border-b border-slate-200 rounded-b-2xl overflow-hidden relative shadow-sm flex flex-col min-h-[440px]">
        {viewMode === 'outline' ? (
          /* Text Outline View Mode (for quick reference of AI extracted data) */
          <div className="w-full h-full p-6 flex-1 flex flex-col relative bg-white overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-xs font-extrabold text-purple-700 uppercase tracking-widest flex items-center gap-1.5">
                <List className="w-4 h-4" /> Presentation Content Outline ({fullSlides.length} Slides)
              </span>
              <span className="text-xs text-slate-500">Click any slide below to navigate</span>
            </div>

            <div className="space-y-4">
              {fullSlides.map((slide, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    onSlideChange(idx);
                    setViewMode('canvas');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    idx === currentSlideIndex
                      ? 'bg-purple-50/70 border-purple-400 shadow-sm ring-1 ring-purple-400'
                      : 'bg-white border-slate-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-purple-700">
                      Slide #{idx + 1}
                    </span>
                    {idx === currentSlideIndex && (
                      <Badge variant="purple" size="sm">Active Slide</Badge>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {slide.title || `Slide ${idx + 1}`}
                  </h3>

                  {slide.bulletPoints && slide.bulletPoints.length > 0 ? (
                    <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
                      {slide.bulletPoints.map((pt, pIdx) => (
                        <li key={pIdx}>{pt}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-500">{slide.content}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : visualDocumentUrl ? (
          /* High-Fidelity Vector Visual Slide Canvas Viewer */
          <div className="w-full h-full flex-1 flex flex-col relative bg-slate-200/60 overflow-hidden items-center justify-center p-2 sm:p-4">
            <PdfCanvasViewer
              pdfUrl={visualDocumentUrl}
              pageNumber={currentSlideIndex + 1}
              onTotalPagesCalculated={(num) => setDynamicTotalPages(num)}
            />
          </div>
        ) : (
          /* Fallback Interactive PowerPoint Slide Card View */
          <div className="w-full h-full p-6 sm:p-8 flex-1 flex flex-col justify-between relative bg-white overflow-y-auto">
            <div className="absolute top-4 right-6 text-8xl font-black text-purple-500/10 select-none pointer-events-none">
              #{currentSlideIndex + 1}
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-purple-600 animate-pulse" />
                  <span className="text-xs font-extrabold text-purple-700 uppercase tracking-widest">
                    POWERPOINT SLIDE {currentSlideIndex + 1} OF {totalSlides}
                  </span>
                </div>
                <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Speech Engine Sync
                </span>
              </div>

              {/* Slide Title Banner */}
              <div className="mb-6 bg-gradient-to-r from-purple-900 to-indigo-900 p-5 rounded-2xl border border-purple-800 shadow-xl text-white">
                <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider block mb-1">
                  Slide Topic
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {currentSlide.title || `Slide ${currentSlideIndex + 1}`}
                </h2>
              </div>

              {/* Bullet Points Grid */}
              <div className="space-y-3 my-4">
                {currentSlide.bulletPoints && currentSlide.bulletPoints.length > 0 ? (
                  currentSlide.bulletPoints.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start space-x-3 bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-xs hover:border-purple-300 transition-colors"
                    >
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                      <p className="text-sm sm:text-base text-slate-800 font-semibold leading-relaxed">
                        {point}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl text-sm sm:text-base text-slate-700 leading-relaxed">
                    {currentSlide.content}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Slide Navigation Controls */}
            <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handlePrev}
                disabled={currentSlideIndex === 0}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Slide</span>
              </Button>

              <span className="text-xs text-slate-500 font-medium">
                Slide {currentSlideIndex + 1} of {totalSlides} (Press ← → Arrow Keys)
              </span>

              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleNext}
                disabled={currentSlideIndex === totalSlides - 1}
              >
                <span>Next Slide</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Presentation Deck</h3>
                <p className="text-xs text-slate-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-slate-600">
              Are you sure you want to permanently delete <strong className="text-slate-900">"{presentation.title}"</strong>? All associated slide analysis and feedback will be removed.
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                onClick={handleDeleteConfirm}
                isLoading={isDeleting}
              >
                Delete Deck
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
