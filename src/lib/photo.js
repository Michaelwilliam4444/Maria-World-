// Turns a parent-selected photo into a soft, cartoon-style circular avatar — entirely on the
// device (canvas). The original file is never stored, uploaded or given a URL.
export function cartoonizePhoto(file, size = 240) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) return reject(new Error('not-image'));
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('read-failed'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('decode-failed'));
      img.onload = () => {
        try {
          const c = document.createElement('canvas');
          c.width = c.height = size;
          const ctx = c.getContext('2d');
          // centre-crop to a square, biased slightly upward where faces usually are
          const s = Math.min(img.width, img.height);
          const sx = (img.width - s) / 2;
          const sy = Math.max(0, (img.height - s) / 2 - s * 0.08);
          try { ctx.filter = 'blur(1.2px) saturate(1.25) brightness(1.05)'; } catch { /* unsupported */ }
          ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
          ctx.filter = 'none';
          // posterise into soft colour bands (the "cartoon" look)
          const data = ctx.getImageData(0, 0, size, size);
          const d = data.data; const step = 256 / 6;
          for (let i = 0; i < d.length; i += 4) {
            for (let k = 0; k < 3; k++) d[i + k] = Math.min(255, Math.round(Math.floor(d[i + k] / step) * step + step / 2));
          }
          ctx.putImageData(data, 0, 0);
          resolve(c.toDataURL('image/jpeg', 0.82));
        } catch (e) { reject(e); }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
