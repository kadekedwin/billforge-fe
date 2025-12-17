export async function imageUrlToBitmap(url: string, maxWidth: number = 384): Promise<{ bitmap: number[], width: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();

        const isExternalUrl = url.startsWith('http://') || url.startsWith('https://');
        const imageUrl = isExternalUrl ? `/api/image-proxy?url=${encodeURIComponent(url)}` : url;

        if (isExternalUrl) {
            img.crossOrigin = 'anonymous';
        }

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                reject(new Error('Could not get canvas context'));
                return;
            }

            const aspectRatio = img.height / img.width;
            const width = Math.min(img.width, maxWidth);
            const height = Math.floor(width * aspectRatio);

            canvas.width = width;
            canvas.height = height;

            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height);
            const bitmap = convertToBitmap(imageData, width, height);

            resolve({ bitmap, width });
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        img.src = imageUrl;
    });
}

function convertToBitmap(imageData: ImageData, width: number, height: number): number[] {
    const data = imageData.data;
    const bytesPerLine = Math.ceil(width / 8);
    const bitmap: number[] = [];

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < bytesPerLine; x++) {
            let byte = 0;
            for (let bit = 0; bit < 8; bit++) {
                const pixelX = x * 8 + bit;
                if (pixelX < width) {
                    const i = (y * width + pixelX) * 4;
                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];
                    const brightness = (r + g + b) / 3;

                    if (brightness < 128) {
                        byte |= (1 << (7 - bit));
                    }
                }
            }
            bitmap.push(byte);
        }
    }

    return bitmap;
}
