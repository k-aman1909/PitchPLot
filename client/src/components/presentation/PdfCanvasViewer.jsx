import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Global cache for loaded PDF documents to avoid re-fetching on slide change
const pdfDocumentCache = new Map();

export const PdfCanvasViewer = ({
  fileUrl,
  pdfUrl,
  pageNumber = 1,
  onDocumentLoad,
  onTotalPagesCalculated,
  className = ''
}) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);

  const renderTaskRef = useRef(null);
  const currentRenderPageRef = useRef(null);

  const documentUrl = pdfUrl || fileUrl || '';

  // Resolve absolute URL
  const resolvedUrl = documentUrl
    ? (documentUrl.startsWith('http') ? documentUrl : `${window.location.origin}${documentUrl}`)
    : '';

  // 1. Load PDF Document (cached)
  useEffect(() => {
    if (!resolvedUrl) {
      setError('No document URL provided');
      setLoading(false);
      return;
    }

    let isMounted = true;
    setError(null);

    async function loadDocument() {
      try {
        let docPromise = pdfDocumentCache.get(resolvedUrl);
        if (!docPromise) {
          docPromise = pdfjsLib.getDocument(resolvedUrl).promise;
          pdfDocumentCache.set(resolvedUrl, docPromise);
        }

        const doc = await docPromise;
        if (!isMounted) return;

        setPdfDoc(doc);
        setTotalPages(doc.numPages);

        if (onDocumentLoad) {
          onDocumentLoad({ pageCount: doc.numPages });
        }
        if (onTotalPagesCalculated) {
          onTotalPagesCalculated(doc.numPages);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Failed to load presentation PDF:', err);
        setError(err.message || 'Failed to load PDF document');
        setLoading(false);
      }
    }

    loadDocument();

    return () => {
      isMounted = false;
    };
  }, [resolvedUrl]);

  // 2. Render Page on Canvas
  const renderCurrentPage = useCallback(async () => {
    if (!pdfDoc || !canvasRef.current || !containerRef.current) return;

    const validPageNum = Math.min(Math.max(1, pageNumber), pdfDoc.numPages);
    currentRenderPageRef.current = validPageNum;

    try {
      // Cancel previous render task if active
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
        renderTaskRef.current = null;
      }

      const page = await pdfDoc.getPage(validPageNum);
      if (currentRenderPageRef.current !== validPageNum) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      // Available container space
      const padding = 24;
      const availWidth = Math.max(container.clientWidth - padding, 320);
      const availHeight = Math.max(container.clientHeight - padding, 240);

      // Base unscaled viewport
      const unscaledViewport = page.getViewport({ scale: 1.0 });
      const aspect = unscaledViewport.width / unscaledViewport.height;

      // Fit within container maintaining original aspect ratio without distortion
      let displayWidth = availWidth;
      let displayHeight = displayWidth / aspect;

      if (displayHeight > availHeight) {
        displayHeight = availHeight;
        displayWidth = displayHeight * aspect;
      }

      // High-DPI support (Retina / crisp text)
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const scale = (displayWidth / unscaledViewport.width) * dpr;
      const viewport = page.getViewport({ scale });

      // Internal canvas buffer resolution
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // CSS display size
      canvas.style.width = `${Math.round(displayWidth)}px`;
      canvas.style.height = `${Math.round(displayHeight)}px`;

      const context = canvas.getContext('2d', { alpha: false });
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      const renderContext = {
        canvasContext: context,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      renderTaskRef.current = null;

      setLoading(false);

      // Background preload next page for instant navigation
      if (validPageNum < pdfDoc.numPages) {
        pdfDoc.getPage(validPageNum + 1).catch(() => {});
      }
    } catch (err) {
      if (err?.name !== 'RenderingCancelledException') {
        console.warn('PDF render notice:', err.message);
        setError(err.message);
        setLoading(false);
      }
    }
  }, [pdfDoc, pageNumber]);

  // Trigger render when pdfDoc or pageNumber changes
  useEffect(() => {
    if (pdfDoc) {
      renderCurrentPage();
    }
  }, [pdfDoc, pageNumber, renderCurrentPage]);

  // Responsive resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    let resizeTimer = null;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (pdfDoc) {
          renderCurrentPage();
        }
      }, 100);
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      clearTimeout(resizeTimer);
    };
  }, [pdfDoc, renderCurrentPage]);

  // Clean up render task on unmount
  useEffect(() => {
    return () => {
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {}
      }
    };
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-gray-400 bg-[#070913]">
        <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-2xl mb-3">
          <svg className="w-8 h-8 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-200">Unable to preview exact slide visual</p>
        <p className="text-xs text-gray-500 mt-1 max-w-sm">{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center relative overflow-hidden bg-[#070913] select-none ${className}`}
    >
      {loading && (
        <div className="absolute inset-0 bg-[#070913]/70 backdrop-blur-xs flex items-center justify-center z-10">
          <div className="flex items-center space-x-3 text-purple-400 font-medium text-xs px-4 py-2 rounded-full bg-[#121020] border border-purple-500/30 shadow-xl">
            <svg className="animate-spin h-4 w-4 text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Rendering High-Fidelity Slide...</span>
          </div>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="rounded-xl shadow-2xl transition-all duration-150 ease-out border border-[#231F3D]"
      />
    </div>
  );
};
