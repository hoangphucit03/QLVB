/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS build lifecycle script. */
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'public', 'ocr-assets');
function copy(from, to) {
  fs.mkdirSync(path.dirname(path.join(output, to)), { recursive: true });
  fs.cpSync(path.join(root, 'node_modules', from), path.join(output, to), { recursive: true });
}
copy('pdfjs-dist/build/pdf.worker.min.mjs', 'pdf/pdf.worker.min.mjs');
for (const name of ['cmaps', 'standard_fonts', 'wasm']) copy('pdfjs-dist/' + name, 'pdf/' + name);
copy('tesseract.js/dist/worker.min.js', 'tesseract/worker.min.js');
for (const name of fs.readdirSync(path.join(root, 'node_modules/tesseract.js-core'))) {
  if (name.endsWith('.wasm') || name.endsWith('.wasm.js')) copy('tesseract.js-core/' + name, 'core/' + name);
}
for (const language of ['vie', 'eng']) copy(`@tesseract.js-data/${language}/4.0.0_best_int/${language}.traineddata.gz`, `lang/${language}.traineddata.gz`);
console.log('Prepared same-origin PDF/OCR workers, fonts and Vietnamese/English models.');
