import * as pdfjsLib from 'pdfjs-dist';
// needed for Vite / modern bundlers
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker?url';
import type { ContentBody } from '@brifle/brifle-sdk';
import type { FileContent } from 'src/components/ui-elements/FileDragAndDrop.vue';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000; // 32 KB chunks
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

/** the files as PDF bodies of the Brifle API */
export function toContentBodies(files: FileContent[]): ContentBody[] {
  return files.map((file) => ({ type: 'application/pdf', content: uint8ToBase64(file.content) }));
}

async function openPdf(pdfData: Uint8Array) {
  const bytesCopy = new Uint8Array(pdfData.length);
  bytesCopy.set(pdfData);
  return pdfjsLib.getDocument({ data: bytesCopy }).promise;
}

/** every page as PNG data URL (input of the document analysis) */
export async function pdfPagesToPng(pdfData: Uint8Array): Promise<string[]> {
  const pdf = await openPdf(pdfData);
  const pageImages: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 3 }); // increase for higher resolution
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    await page.render({ canvasContext: context as CanvasRenderingContext2D, viewport }).promise;
    pageImages.push(canvas.toDataURL('image/png'));
  }
  return pageImages;
}

/**
 * First page as PNG with everything but the address window (DIN 5008) cleared,
 * input of the address recognition.
 */
export async function pdfFirstPageToPNG(pdfData: Uint8Array): Promise<string> {
  const pdf = await openPdf(pdfData);
  const page = await pdf.getPage(1);
  const scale = 4; // increase for higher resolution
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  await page.render({ canvasContext: context as CanvasRenderingContext2D, viewport }).promise;

  const cmToPx = (cm: number) => cm * 28.34625 * scale; // 1 cm = 28.34625 pixels at 72 DPI
  /*
   * area for address field is top 4.5 cm, left 2.3 cm, width 9 cm, height 4.5 cm,
   * plus some tolerance on each side
   */
  const toleranceCmTop = 0.85;
  const toleranceCmRight = -0.25;
  const toleranceCmBottom = 1.5;
  const toleranceCmLeft = 1.25;

  context!.stroke();
  // cut the rectangle area and remove the rest
  context!.clearRect(0, 0, canvas.width, cmToPx(4.5 - toleranceCmTop));
  context!.clearRect(0, cmToPx(4.5 - toleranceCmTop), cmToPx(2.3 - toleranceCmLeft), canvas.height);
  context!.clearRect(cmToPx(2.3 + 9 + toleranceCmRight), cmToPx(4.5 - toleranceCmTop), canvas.width, canvas.height);
  context!.clearRect(0, cmToPx(4.5 + 4.5 + toleranceCmBottom), canvas.width, canvas.height);

  return canvas.toDataURL('image/png');
}
