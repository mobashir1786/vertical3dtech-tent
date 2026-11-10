import * as THREE from "three";

type TextureImage = CanvasImageSource & {
  width?: number;
  height?: number;
  naturalWidth?: number;
  naturalHeight?: number;
};

export function createGrayscaleTexture(source: THREE.Texture): THREE.CanvasTexture {
  const image = source.image as TextureImage | null;
  if (!image) throw new Error("Source texture image is not available");

  const width = image.width || image.naturalWidth || 0;
  const height = image.height || image.naturalHeight || 0;
  if (!width || !height) throw new Error("Invalid texture dimensions");

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("Canvas context unavailable");

  context.drawImage(image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    const gray = Math.min(
      255,
      Math.pow(
        (0.2126 * pixels[i] + 0.7152 * pixels[i + 1] + 0.0722 * pixels[i + 2]) / 255,
        0.85
      ) * 255
    );
    pixels[i] = gray;
    pixels[i + 1] = gray;
    pixels[i + 2] = gray;
  }

  context.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.channel = source.channel;
  texture.mapping = source.mapping;
  texture.wrapS = source.wrapS;
  texture.wrapT = source.wrapT;
  texture.magFilter = source.magFilter;
  texture.minFilter = source.minFilter;
  texture.anisotropy = source.anisotropy;
  texture.format = source.format;
  texture.type = source.type;
  texture.colorSpace = source.colorSpace;
  texture.flipY = source.flipY;
  texture.premultiplyAlpha = source.premultiplyAlpha;
  texture.unpackAlignment = source.unpackAlignment;
  texture.generateMipmaps = source.generateMipmaps;
  texture.offset.copy(source.offset);
  texture.repeat.copy(source.repeat);
  texture.center.copy(source.center);
  texture.rotation = source.rotation;
  texture.matrixAutoUpdate = source.matrixAutoUpdate;
  if (source.matrixAutoUpdate) texture.updateMatrix();
  else texture.matrix.copy(source.matrix);
  texture.needsUpdate = true;
  return texture;
}
