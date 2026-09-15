// PDF.js ES module loader for /canva-for-pitch
(async function() {
  const basePath = '/canva-for-pitch';
  try {
    const pdfjsLib = await import(`${basePath}/pdf.min.mjs`);
    pdfjsLib.GlobalWorkerOptions.workerSrc = `${basePath}/pdf.worker.min.mjs`;
    window.pdfjsLib = pdfjsLib;
    window.dispatchEvent(new CustomEvent('pdfjsLoaded', { detail: pdfjsLib }));
  } catch (error) {
    console.error('Failed to load PDF.js:', error);
    window.dispatchEvent(new CustomEvent('pdfjsLoadError', { detail: error }));
  }
})();
