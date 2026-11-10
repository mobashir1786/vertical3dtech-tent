import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import type { SectionDesigns } from "../types/configurator";
import { drawArtworkTexture } from "../utils/artworkTexture";

const WIDTH = 3072;
const HEIGHT = 2048;

export function useTextureGenerator(sections: SectionDesigns, variantId: string): THREE.CanvasTexture {
  const lifecycle = useRef(0);
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const next = new THREE.CanvasTexture(canvas);
    next.colorSpace = THREE.SRGBColorSpace;
    return next;
  }, []);

  useEffect(() => {
    return drawArtworkTexture(texture, sections, variantId);
  }, [sections, texture, variantId]);

  useEffect(() => {
    lifecycle.current += 1;
    return () => {
      const cleanupVersion = ++lifecycle.current;
      queueMicrotask(() => {
        if (lifecycle.current === cleanupVersion) texture.dispose();
      });
    };
  }, [texture]);
  return texture;
}
