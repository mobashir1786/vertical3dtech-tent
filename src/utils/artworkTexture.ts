import * as THREE from "three";
import type { DesignElement, SectionDesigns } from "../types/configurator";

const ATLAS_WIDTH = 3072;
const ATLAS_HEIGHT = 2048;
const PANEL_WIDTH = 600;
const PANEL_HEIGHT = 400;
const renderVersions = new WeakMap<THREE.CanvasTexture, number>();

interface UvArea {
  bounds: [number, number, number, number];
  clip?: Array<[number, number]>;
}

interface ArtworkLayout {
  roof: UvArea;
  front: UvArea;
  left: UvArea;
  right: UvArea;
}

const ARTWORK_LAYOUTS: Record<string, ArtworkLayout> = {
  "tent-5-5": {
    roof: {
      bounds: [0.31, 0.62, 0.69, 0.87],
      clip: [[0.255, 0.872], [0.745, 0.872], [0.5, 0.535]],
    },
    front: { bounds: [0.256, 0.881, 0.741, 0.966] },
    left: { bounds: [0.02, 0.257, 0.108, 0.741] },
    right: { bounds: [0.877, 0.243, 0.961, 0.732] },
  },
  "tent-6-5": {
    roof: {
      bounds: [0.33, 0.62, 0.67, 0.88],
      clip: [[0.272, 0.882], [0.727, 0.882], [0.5, 0.519]],
    },
    front: { bounds: [0.269, 0.889, 0.729, 0.996] },
    left: { bounds: [0.006, 0.274, 0.111, 0.735] },
    right: { bounds: [0.89, 0.269, 0.987, 0.73] },
  },
  "tent-8-8": {
    roof: {
      bounds: [0.31, 0.62, 0.69, 0.89],
      clip: [[0.21, 0.892], [0.784, 0.892], [0.497, 0.536]],
    },
    front: { bounds: [0.212, 0.9, 0.784, 0.975] },
    left: { bounds: [0.013, 0.225, 0.089, 0.798] },
    right: { bounds: [0.896, 0.227, 0.972, 0.8] },
  },
};

function createPanelCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = PANEL_WIDTH;
  canvas.height = PANEL_HEIGHT;
  return canvas;
}

async function renderPanel(elements: DesignElement[]): Promise<HTMLCanvasElement> {
  const canvas = createPanelCanvas();
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create the 2D artwork panel.");

  for (const element of elements) {
    context.save();
    context.translate(
      element.x - 50 + element.width / 2,
      element.y - 50 + element.height / 2,
    );
    context.rotate((element.rotation * Math.PI) / 180);

    if (element.type === "text") {
      context.fillStyle = element.fill;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `${element.fontSize}px "${element.fontFamily}"`;
      context.fillText(element.text, 0, 0, element.width);
      context.restore();
      continue;
    }

    await new Promise<void>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        context.drawImage(image, -element.width / 2, -element.height / 2, element.width, element.height);
        context.restore();
        resolve();
      };
      image.onerror = () => {
        context.restore();
        reject(new Error("An uploaded artwork image could not be rendered in the 3D preview."));
      };
      image.src = element.src;
    });
  }

  return canvas;
}

function uvPoint([u, v]: [number, number]): [number, number] {
  return [u * ATLAS_WIDTH, (1 - v) * ATLAS_HEIGHT];
}

function drawPanel(
  context: CanvasRenderingContext2D,
  panel: HTMLCanvasElement,
  area: UvArea,
  orientation: "roof" | "front" | "left" | "right",
): void {
  const [u0, v0, u1, v1] = area.bounds;
  const x = u0 * ATLAS_WIDTH;
  const y = (1 - v1) * ATLAS_HEIGHT;
  const width = (u1 - u0) * ATLAS_WIDTH;
  const height = (v1 - v0) * ATLAS_HEIGHT;

  context.save();
  if (area.clip) {
    context.beginPath();
    area.clip.forEach((point, index) => {
      const [px, py] = uvPoint(point);
      if (index === 0) context.moveTo(px, py);
      else context.lineTo(px, py);
    });
    context.closePath();
    context.clip();
  }
  context.translate(x + width / 2, y + height / 2);

  if (orientation === "roof" || orientation === "front") {
    context.scale(1, -1);
    context.drawImage(panel, -width / 2, -height / 2, width, height);
  } else {
    context.scale(1, -1);
    context.rotate(orientation === "left" ? Math.PI / 2 : -Math.PI / 2);
    context.drawImage(panel, -height / 2, -width / 2, height, width);
  }

  context.restore();
}

export function drawArtworkTexture(
  texture: THREE.CanvasTexture,
  sections: SectionDesigns,
  variantId: string,
): () => void {
  const version = (renderVersions.get(texture) ?? 0) + 1;
  renderVersions.set(texture, version);
  const canvas = texture.image as HTMLCanvasElement;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create the 3D artwork texture.");

  context.clearRect(0, 0, ATLAS_WIDTH, ATLAS_HEIGHT);
  const layout = ARTWORK_LAYOUTS[variantId] ?? ARTWORK_LAYOUTS["tent-5-5"];
  const renderSection = (
    elements: DesignElement[],
    area: UvArea,
    orientation: "roof" | "front" | "left" | "right",
  ) => renderPanel(elements).then((panel) => {
    if (renderVersions.get(texture) === version) {
      drawPanel(context, panel, area, orientation);
    }
  });
  const pending = [
    sections.roof.length > 0
      ? renderSection(sections.roof, layout.roof, "roof")
      : Promise.resolve(),
    sections.front.length > 0
      ? renderSection(sections.front, layout.front, "front")
      : Promise.resolve(),
    sections.left.length > 0
      ? renderSection(sections.left, layout.left, "left")
      : Promise.resolve(),
    sections.right.length > 0
      ? renderSection(sections.right, layout.right, "right")
      : Promise.resolve(),
  ];

  const invalidate = () => {
    if (renderVersions.get(texture) === version) renderVersions.set(texture, version + 1);
  };
  void Promise.all(pending).then(() => {
    if (renderVersions.get(texture) === version) texture.needsUpdate = true;
  }).catch((error: unknown) => {
    if (renderVersions.get(texture) === version) {
      console.error("Unable to finish drawing tent artwork.", error);
    }
  });
  texture.needsUpdate = true;
  return invalidate;
}
