import { GlobalWorkerOptions as AppPdfJs } from 'pdfjs-dist';
import { GlobalWorkerOptions as EmbedPdfJs } from 'vue-pdf-embed/dist/index.essential.mjs';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

/**
 * pdf.js worker served as a file from the app bundle, for both copies of pdf.js
 * in the renderer: the app's own (OCR/page rendering in the send flow) and the
 * one bundled in vue-pdf-embed's essential build (previews). The default
 * vue-pdf-embed build embeds the worker as a data: URL, which the
 * Content-Security-Policy in index.html does not allow.
 */
AppPdfJs.workerSrc = workerUrl;
EmbedPdfJs.workerSrc = workerUrl;
