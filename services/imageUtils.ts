export const resizeImage = (file: File, maxWidth: number = 800): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const elem = document.createElement('canvas');
        const scaleFactor = maxWidth / img.width;
        
        if (scaleFactor >= 1) {
            resolve(img.src);
            return;
        }

        elem.width = maxWidth;
        elem.height = img.height * scaleFactor;
        const ctx = elem.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, elem.width, elem.height);
          resolve(ctx.canvas.toDataURL('image/jpeg', 0.7)); // Compress to JPEG 70%
        } else {
          reject(new Error('Canvas context not available'));
        }
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const base64ToBlob = (base64: string): Blob => {
  const arr = base64.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};