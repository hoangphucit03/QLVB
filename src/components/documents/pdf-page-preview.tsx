'use client';
import { useEffect, useRef } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
export function PdfPagePreview({ document, index, rotation, width }: { document: PDFDocumentProxy; index: number; rotation: number; width: number }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const element = canvas.current; if (!element) return;
    let disposed = false; let task: { cancel: () => void } | undefined;
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      void (async () => {
        try {
          const page = await document.getPage(index + 1); if (disposed) return;
          const original = page.getViewport({ scale: 1, rotation: (page.rotate + rotation) % 360 });
          const viewport = page.getViewport({ scale: Math.min(width / original.width, Math.sqrt(3_000_000 / (original.width * original.height))), rotation: (page.rotate + rotation) % 360 });
          element.width = Math.ceil(viewport.width); element.height = Math.ceil(viewport.height);
          const context = element.getContext('2d'); if (!context) return;
          const render = page.render({ canvas: element, canvasContext: context, viewport }); task = render; await render.promise;
        } catch { /* Export/read failures are reported by the editor. */ }
      })();
    }, { rootMargin: '150px' });
    observer.observe(element);
    return () => { disposed = true; observer.disconnect(); task?.cancel(); };
  }, [document, index, rotation, width]);
  return <canvas ref={canvas} aria-label={`Xem trang nguồn ${index + 1}`} className="mx-auto h-auto max-w-full bg-white shadow-sm" style={{ minHeight: 80 }} />;
}
