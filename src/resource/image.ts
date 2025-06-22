const imageCache = new Map<string, Promise<string>>();

export const loadImage = (src: string) => {
  if (!imageCache.has(src)) {
    const promise = new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(src);
      img.onerror = reject;
    });
    imageCache.set(src, promise);
  }
  return imageCache.get(src)!;
};

export const loadLocalImage = (path: string) => {
  if (!imageCache.has(path)) {
    const promise = import(`../assets/${path}`).then((mod) => mod.default);
    imageCache.set(path, promise);
  }
  return imageCache.get(path)!;
};
