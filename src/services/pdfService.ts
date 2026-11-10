import { jsPDF } from "jspdf";
import type { DesignElement, DesignSection, SectionDesigns } from "../types/configurator";
import type { ConfiguratorConfiguration } from "../types/configurator";
import type { PricingBreakdown } from "./pricingService";
import { defaultProduct } from "../config/products";

const SECTIONS: DesignSection[] = ["roof", "front", "left", "right"];
const PREVIEW_SCALE = 2;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("An uploaded artwork image could not be included in the PDF."));
    image.src = src;
  });
}

async function renderSectionPreview(
  elements: DesignElement[],
  fabricColor: string,
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = 600 * PREVIEW_SCALE;
  canvas.height = 400 * PREVIEW_SCALE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create the artwork preview for the PDF.");

  context.fillStyle = fabricColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#d1d5db";
  context.lineWidth = 2;
  context.strokeRect(1, 1, canvas.width - 2, canvas.height - 2);

  for (const element of elements) {
    const x = (element.x - 50) * PREVIEW_SCALE;
    const y = (element.y - 50) * PREVIEW_SCALE;
    const width = element.width * PREVIEW_SCALE;
    const height = element.height * PREVIEW_SCALE;
    context.save();
    context.translate(x + width / 2, y + height / 2);
    context.rotate((element.rotation * Math.PI) / 180);
    if (element.type === "text") {
      context.fillStyle = element.fill;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `${element.fontSize * PREVIEW_SCALE}px "${element.fontFamily}"`;
      context.fillText(element.text, 0, 0, width);
    } else {
      const image = await loadImage(element.src);
      context.drawImage(image, -width / 2, -height / 2, width, height);
    }
    context.restore();
  }

  return canvas.toDataURL("image/jpeg", 0.88);
}

function get3DPreview(): string | undefined {
  const canvas = document.querySelector<HTMLCanvasElement>(".preview-canvas canvas");
  if (!canvas) return undefined;
  try {
    return canvas.toDataURL("image/jpeg", 0.88);
  } catch (error) {
    throw new Error("Unable to capture the 3D preview. Please wait for the tent to finish loading and try again.", {
      cause: error,
    });
  }
}

function addArtworkDetails(pdf: jsPDF, sections: SectionDesigns): void {
  pdf.addPage();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("Artwork production details", 18, 20);
  let y = 33;

  for (const section of SECTIONS) {
    const elements = sections[section];
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.text(`${section.toUpperCase()} panel (${elements.length})`, 18, y);
    y += 7;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);

    for (const element of elements) {
      const description = element.type === "text"
        ? `Text: "${element.text}" | ${element.fontFamily} ${element.fontSize}px | ${element.fill}`
        : "Uploaded image/logo";
      const transform = `Position ${Math.round(element.x)}, ${Math.round(element.y)} | Size ${Math.round(element.width)} x ${Math.round(element.height)} | Rotation ${Math.round(element.rotation)} deg`;
      for (const line of pdf.splitTextToSize(`${description}\n${transform}`, 174) as string[]) {
        if (y > 275) {
          pdf.addPage();
          y = 20;
        }
        pdf.text(line, 22, y);
        y += 5;
      }
      y += 2;
    }
    y += 4;
  }
}

export async function buildConfigurationPdf(
  configuration: ConfiguratorConfiguration,
  pricing: PricingBreakdown,
  preview3D?: string,
): Promise<Blob> {
  const pdf = new jsPDF();
  const preview = preview3D ?? get3DPreview();
  const variantName = defaultProduct.variants.find((variant) => variant.id === configuration.variantId)?.name
    ?? configuration.variantId;
  const sideWallName = defaultProduct.sideWallOptions.find((option) => option.id === configuration.sideWallOptionId)?.name
    ?? configuration.sideWallOptionId;
  const halfWallName = defaultProduct.halfWallOptions.find((option) => option.id === configuration.halfWallOptionId)?.name
    ?? configuration.halfWallOptionId;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text("Custom Canopy Production Summary", 18, 20);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  pdf.text(`Configuration: ${configuration.configurationId}`, 18, 31);
  pdf.text(`Model: ${variantName}`, 18, 39);
  pdf.text(`Side walls: ${sideWallName}`, 18, 47);
  pdf.text(`Half walls: ${halfWallName}`, 18, 55);
  pdf.text(`Outer fabric: ${configuration.colors.outerFabric}`, 18, 65);
  pdf.text(`Inner fabric: ${configuration.colors.innerFabric}`, 18, 72);
  pdf.text(`Frame: ${configuration.colors.frame}`, 18, 79);

  pdf.setFont("helvetica", "bold");
  pdf.text("3D product preview", 18, 94);
  if (preview) {
    const format = preview.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
    pdf.addImage(preview, format, 18, 99, 174, 108, undefined, "FAST");
  } else {
    pdf.setFont("helvetica", "normal");
    pdf.text("3D preview is unavailable; see the 2D artwork previews.", 18, 103);
  }

  const priceY = preview ? 222 : 120;
  pdf.setFont("helvetica", "bold");
  pdf.text("Price summary (demo pricing)", 18, priceY);
  pdf.setFont("helvetica", "normal");
  const priceLines = [
    ["Base price", pricing.basePrice],
    ["Model adjustment", pricing.variantAdjustment],
    ["Side walls", pricing.sideWallAdjustment],
    ["Half walls", pricing.halfWallAdjustment],
    ["Artwork customization", pricing.customization],
    ["Logo fee", pricing.logoFee],
  ] as const;
  priceLines.forEach(([label, amount], index) => {
    pdf.text(`${label}: $${amount.toFixed(2)}`, 18, priceY + 8 + index * 6);
  });
  pdf.setFont("helvetica", "bold");
  pdf.text(`TOTAL: $${pricing.total.toFixed(2)} ${pricing.currency}`, 18, priceY + 48);

  pdf.addPage();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18);
  pdf.text("2D artwork previews", 18, 20);
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  pdf.text("Preview only; verify panel alignment against the model dieline before production.", 18, 27);

  const previews = await Promise.all(SECTIONS.map(async (section) => ({
    section,
    data: await renderSectionPreview(
      configuration.design.sections[section],
      configuration.colors.outerFabric,
    ),
  })));
  previews.forEach(({ section, data }, index) => {
    const column = index % 2;
    const row = Math.floor(index / 2);
    const x = 14 + column * 98;
    const y = 40 + row * 116;
    pdf.setFont("helvetica", "bold");
    pdf.text(`${section.toUpperCase()} panel`, x, y);
    pdf.addImage(data, "JPEG", x, y + 5, 88, 59, undefined, "FAST");
  });

  addArtworkDetails(pdf, configuration.design.sections);
  return pdf.output("blob");
}

export async function downloadConfigurationPdf(
  configuration: ConfiguratorConfiguration,
  pricing: PricingBreakdown,
): Promise<void> {
  const blob = await buildConfigurationPdf(configuration, pricing);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "canopy-configuration.pdf";
  try {
    document.body.append(link);
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
