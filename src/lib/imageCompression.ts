/**
 * Client-Side Image Compression Utility
 * Resizes large photos (e.g. 5MB-10MB phone camera shots) to lightweight, high-quality WebP images (~200KB-400KB).
 * Preserves PDFs without modification.
 */
export interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

export async function compressImage(
  file: File,
  options: CompressOptions = { maxWidth: 1600, maxHeight: 1600, quality: 0.82 }
): Promise<File> {
  // If PDF, pass through untouched
  if (file.type === 'application/pdf') {
    return file;
  }

  // If not an image, pass through untouched
  if (!file.type.startsWith('image/')) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        const maxW = options.maxWidth || 1600;
        const maxH = options.maxHeight || 1600;

        // Calculate proportional dimensions
        if (width > maxW || height > maxH) {
          if (width > height) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          } else {
            width = Math.round((width * maxH) / height);
            height = maxH;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        // Draw image smoothly on canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format with high visual fidelity
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              // If compressed blob isn't smaller, keep original file
              resolve(file);
              return;
            }

            const cleanBaseName = file.name.replace(/\.[^/.]+$/, '');
            const compressedFile = new File([blob], `${cleanBaseName}.webp`, {
              type: 'image/webp',
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          'image/webp',
          options.quality || 0.82
        );
      };

      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };

    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}
