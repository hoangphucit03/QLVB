import type { Worker as OcrWorker } from 'tesseract.js';

export type DocumentLine = { text: string; x: number; y: number; width: number; height: number; fontSize: number };
export type ConvertedPage = { width: number; height: number; text: string; lines: DocumentLine[]; preview: Blob; source: 'PDF' | 'OCR' };
export const MAX_FILE_BYTES = 20 * 1024 * 1024;
export const MAX_PAGES = 30;
const MAX_PIXELS = 8_000_000;

export class BrowserConverter {
  private stopped = false;
  private abort = new AbortController();
  private worker?: OcrWorker;
  private pdfTask?: { destroy: () => Promise<void> };
  private ocrPage = 0;
  private ocrTotal = 1;
  constructor(private progress: (message: string, percent: number) => void) {}
  async cancel() {
    this.stopped = true;
    this.abort.abort();
    await Promise.allSettled([this.worker?.terminate(), this.pdfTask?.destroy()]);
  }
  private check() { if (this.stopped) throw new DOMException('Đã hủy xử lý', 'AbortError'); }
  private interruptible<T>(task: Promise<T>): Promise<T> {
    this.check();
    return new Promise((resolve, reject) => {
      const stop = () => reject(new DOMException('Đã hủy xử lý', 'AbortError'));
      this.abort.signal.addEventListener('abort', stop, { once: true });
      task.then(resolve, reject).finally(() => this.abort.signal.removeEventListener('abort', stop));
    });
  }
  private async recognize(canvas: HTMLCanvasElement, index: number, total: number) {
    this.check();
    this.ocrPage = index; this.ocrTotal = total;
    if (!this.worker) {
      this.progress('Đang tải bộ nhận dạng tiếng Việt / Anh từ website…', 0);
      const { createWorker, OEM } = await import('tesseract.js');
      this.check();
      const loading = createWorker(['vie', 'eng'], OEM.LSTM_ONLY, {
        workerPath: '/ocr-assets/tesseract/worker.min.js', corePath: '/ocr-assets/core',
        langPath: '/ocr-assets/lang', workerBlobURL: false,
        logger: message => { if (!this.stopped) this.progress(`Trang ${this.ocrPage + 1}/${this.ocrTotal}: ${message.status}`, Math.round((this.ocrPage + (message.progress || 0)) / this.ocrTotal * 100)); },
      }).then(async worker => {
        if (this.stopped) { await worker.terminate(); this.check(); }
        return worker;
      });
      const worker = await this.interruptible(loading);
      if (this.stopped) { await worker.terminate(); this.check(); }
      this.worker = worker;
    }
    const { data } = await this.interruptible(this.worker.recognize(canvas, {}, { text: true, blocks: true }));
    this.check();
    const scale = 72 / 144;
    const lines = (data.blocks || []).flatMap(block => block.paragraphs.flatMap(paragraph => paragraph.lines)).map(line => ({
      text: line.text.trim(), x: line.bbox.x0 * scale, y: line.bbox.y0 * scale,
      width: (line.bbox.x1 - line.bbox.x0) * scale, height: (line.bbox.y1 - line.bbox.y0) * scale,
      fontSize: Math.max(7, Math.min(36, (line.bbox.y1 - line.bbox.y0) * scale * 0.9)),
    }));
    return { text: data.text.trim(), lines };
  }
  async convert(file: File, forceOcr: boolean, onPage: (page: ConvertedPage) => void) {
    if (file.size === 0 || file.size > MAX_FILE_BYTES) throw new Error('Chọn file không rỗng, tối đa 20 MB.');
    const signature = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const isPdf = new TextDecoder().decode(signature).startsWith('%PDF-');
    const isPng = signature[0] === 137 && signature[1] === 80 && signature[2] === 78 && signature[3] === 71;
    const isJpeg = signature[0] === 255 && signature[1] === 216 && signature[2] === 255;
    if (!isPdf && !isPng && !isJpeg) throw new Error('Chỉ hỗ trợ PDF, PNG hoặc JPG hợp lệ.');
    try {
      if (isPdf) {
        const pdfjs = await import('pdfjs-dist');
        this.check();
        pdfjs.GlobalWorkerOptions.workerSrc = '/ocr-assets/pdf/pdf.worker.min.mjs';
        const task = pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), cMapUrl: '/ocr-assets/pdf/cmaps/', cMapPacked: true, standardFontDataUrl: '/ocr-assets/pdf/standard_fonts/', wasmUrl: '/ocr-assets/pdf/wasm/' });
        this.pdfTask = task;
        const pdf = await task.promise;
        if (pdf.numPages > MAX_PAGES) throw new Error('Bản này hỗ trợ tối đa 30 trang mỗi lần. Hãy tách PDF rồi thử lại.');
        for (let index = 0; index < pdf.numPages; index++) {
          this.check(); this.progress(`Đang đọc trang ${index + 1}/${pdf.numPages}…`, Math.round(index / pdf.numPages * 100));
          const page = await pdf.getPage(index + 1);
          const original = page.getViewport({ scale: 1 });
          const scale = Math.min(2, Math.sqrt(MAX_PIXELS / (original.width * original.height)));
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width); canvas.height = Math.ceil(viewport.height);
          const context = canvas.getContext('2d');
          if (!context) throw new Error('Trình duyệt không hỗ trợ Canvas.');
          await page.render({ canvasContext: context, canvas, viewport }).promise;
          this.check();
          const content = await page.getTextContent();
          const lines: DocumentLine[] = [];
          for (const item of content.items) {
            if (!('str' in item) || !item.str.trim()) continue;
            const [, , , , x, y] = pdfjs.Util.transform(original.transform, item.transform);
            const height = Math.hypot(item.transform[2], item.transform[3]) || item.height || 12;
            lines.push({ text: item.str, x, y: y - height, width: item.width, height, fontSize: height });
          }
          const extractedText = content.items.map(item => 'str' in item ? item.str + (item.hasEOL ? '\n' : ' ') : '').join('').replace(/[ \t]+\n/g, '\n').trim();
          let result = { text: extractedText, lines };
          const ocr = forceOcr || result.text.replace(/\s/g, '').length < 12;
          if (ocr) {
            result = await this.recognize(canvas, index, pdf.numPages);
            // OCR coordinates initially use a 144 dpi reference.
            result.lines = result.lines.map(line => ({ ...line, x: line.x * 2 / scale, y: line.y * 2 / scale, width: line.width * 2 / scale, height: line.height * 2 / scale, fontSize: line.fontSize * 2 / scale }));
          }
          const preview = await canvasBlob(canvas); this.check();
          onPage({ width: original.width, height: original.height, ...result, preview, source: ocr ? 'OCR' : 'PDF' });
          canvas.width = 0; canvas.height = 0; page.cleanup();
        }
      } else {
        this.check();
        const image = await createImageBitmap(file);
        if (image.width * image.height > 40_000_000) { image.close(); throw new Error('Ảnh quá lớn. Hãy giảm xuống dưới 40 megapixel.'); }
        const scale = Math.min(1, Math.sqrt(MAX_PIXELS / (image.width * image.height)));
        const canvas = document.createElement('canvas'); canvas.width = Math.round(image.width * scale); canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext('2d'); if (!context) throw new Error('Không tạo được Canvas.');
        context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height); context.drawImage(image, 0, 0, canvas.width, canvas.height); image.close();
        const result = await this.recognize(canvas, 0, 1);
        const preview = await canvasBlob(canvas); this.check();
        onPage({ width: canvas.width / 2, height: canvas.height / 2, ...result, preview, source: 'OCR' }); canvas.width = 0; canvas.height = 0;
      }
      this.progress('Đã xử lý xong. Hãy kiểm tra nội dung trước khi xuất.', 100);
    } finally {
      await Promise.allSettled([this.worker?.terminate(), this.pdfTask?.destroy()]);
      this.worker = undefined; this.pdfTask = undefined;
    }
  }
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Không tạo được ảnh xem trước.')), 'image/jpeg', 0.8));
}

export async function buildWord(pages: ConvertedPage[], layout: boolean): Promise<Blob> {
  const { Document, Packer, Paragraph, TextRun, FrameAnchorType, HeightRule } = await import('docx');
  const document = new Document({ sections: pages.map(page => ({
    properties: { page: { size: { width: Math.max(2880, Math.round(page.width * 20)), height: Math.max(2880, Math.round(page.height * 20)) }, margin: { top: 0, bottom: 0, left: 0, right: 0 } } },
    children: layout && page.lines.length ? page.lines.map(line => new Paragraph({
      frame: { type: 'absolute', position: { x: Math.max(0, Math.round(line.x * 20)), y: Math.max(0, Math.round(line.y * 20)) }, width: Math.max(100, Math.round(line.width * 20 + 120)), height: Math.max(100, Math.round(line.height * 20 + 80)), anchor: { horizontal: FrameAnchorType.PAGE, vertical: FrameAnchorType.PAGE }, rule: HeightRule.ATLEAST },
      spacing: { before: 0, after: 0 }, children: [new TextRun({ text: line.text, font: 'Times New Roman', size: Math.max(12, Math.min(96, Math.round(line.fontSize * 2))) })],
    })) : page.text.split('\n').map(text => new Paragraph({ indent: { left: 720, right: 720 }, children: [new TextRun({ text, font: 'Times New Roman', size: 26 })] })),
  })) });
  return Packer.toBlob(document);
}
