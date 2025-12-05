export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.toLowerCase();
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(path);
  } catch {
    return false;
  }
}

export function getFileSizeBytes(file: File): number {
  return file.size;
}

