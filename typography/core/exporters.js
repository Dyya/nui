// NUI core - export helpers. Attaches to window.PT for file:// compatibility.
(function(){
  function pngExport(canvas, opts){
    opts = opts || {};
    const scale = opts.scale || 2;
    const filename = opts.filename || 'nui.png';
    return new Promise(function(resolve, reject){
      const w = canvas.width, h = canvas.height;
      const out = document.createElement('canvas');
      out.width = Math.round(w * (scale / (window.devicePixelRatio || 1)));
      out.height = Math.round(h * (scale / (window.devicePixelRatio || 1)));
      const ctx = out.getContext('2d');
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(canvas, 0, 0, out.width, out.height);
      out.toBlob(function(blob){
        if(!blob){ reject(new Error('toBlob failed')); return; }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function(){ URL.revokeObjectURL(url); }, 1200);
        resolve();
      }, 'image/png');
    });
  }

  function svgDownload(svgString, filename){
    filename = filename || 'nui.svg';
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1200);
  }

  function svgWrap(content, opts){
    opts = opts || {};
    const width = opts.width, height = opts.height;
    const units = opts.units || 'px';
    const background = opts.background;
    const bg = background ? '<rect width="100%" height="100%" fill="' + background + '"/>' : '';
    return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="' + width + units + '" height="' + height + units + '" viewBox="0 0 ' + width + ' ' + height + '">' + bg + content + '</svg>';
  }

  // pdf-lib is loaded on demand. Works from file:// via dynamic <script> tag (no fetch).
  let _pdfLibPromise = null;
  function loadPdfLib(){
    if(_pdfLibPromise) return _pdfLibPromise;
    if(window.PDFLib){
      _pdfLibPromise = Promise.resolve(window.PDFLib);
      return _pdfLibPromise;
    }
    _pdfLibPromise = new Promise(function(resolve, reject){
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';
      s.onload = function(){ resolve(window.PDFLib); };
      s.onerror = function(){ reject(new Error('Failed to load pdf-lib')); };
      document.head.appendChild(s);
    });
    return _pdfLibPromise;
  }

  function rasterizeSvgToPng(svgString, width, height){
    return new Promise(function(resolve, reject){
      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = function(){
        const c = document.createElement('canvas');
        c.width = width; c.height = height;
        const ctx = c.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        URL.revokeObjectURL(url);
        c.toBlob(function(b){ b.arrayBuffer().then(resolve, reject); }, 'image/png');
      };
      img.onerror = reject;
      img.src = url;
    });
  }

  async function pdfFromSvgPages(pages, opts){
    opts = opts || {};
    const filename = opts.filename || 'nui.pdf';
    const title = opts.title || 'NUI export';
    const PDFLib = await loadPdfLib();
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.create();
    doc.setTitle(title);
    doc.setCreator('NUI');
    for(const page of pages){
      const p = doc.addPage([page.widthPt, page.heightPt]);
      const png = await rasterizeSvgToPng(page.svgString, page.widthPt * 4, page.heightPt * 4);
      const img = await doc.embedPng(png);
      p.drawImage(img, { x: 0, y: 0, width: page.widthPt, height: page.heightPt });
    }
    const bytes = await doc.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
  }

  async function pdfFromCanvasPages(pages, opts){
    opts = opts || {};
    const filename = opts.filename || 'nui.pdf';
    const title = opts.title || 'NUI export';
    const PDFLib = await loadPdfLib();
    const { PDFDocument } = PDFLib;
    const doc = await PDFDocument.create();
    doc.setTitle(title);
    doc.setCreator('NUI');
    for(const page of pages){
      const p = doc.addPage([page.widthPt, page.heightPt]);
      const blob = await new Promise(function(res, rej){
        page.canvas.toBlob(function(b){ b ? res(b) : rej(new Error('toBlob failed')); }, 'image/png');
      });
      const buf = await blob.arrayBuffer();
      const img = await doc.embedPng(buf);
      p.drawImage(img, { x: 0, y: 0, width: page.widthPt, height: page.heightPt });
    }
    const bytes = await doc.save();
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(url); }, 1500);
  }

  const PT_PER_MM = 72 / 25.4;
  const PT_PER_INCH = 72;

  window.PT = Object.assign(window.PT || {}, {
    pngExport: pngExport,
    svgDownload: svgDownload,
    svgWrap: svgWrap,
    pdfFromSvgPages: pdfFromSvgPages,
    pdfFromCanvasPages: pdfFromCanvasPages,
    PT_PER_MM: PT_PER_MM,
    PT_PER_INCH: PT_PER_INCH,
  });
})();
