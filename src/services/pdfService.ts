import { jsPDF } from "jspdf";
import type { ConfiguratorConfiguration, DesignElement, DesignSection, SectionDesigns } from "../types/configurator";
import type { PricingBreakdown } from "./pricingService";
import { defaultProduct } from "../config/products";

const SECTIONS: DesignSection[] = ["roof", "front", "left", "right"];
const PANEL_WIDTH = 600;
const PANEL_HEIGHT = 400;
const PREVIEW_SCALE = 2;
const MARGIN = 16;
const COLORS = {
  green: "#315c49",
  greenLight: "#edf4ef",
  ink: "#25352b",
  muted: "#748178",
  line: "#e1e8e2",
  paper: "#f7f9f7",
  white: "#ffffff",
  warning: "#896a31",
  warningLight: "#fbf6e8",
};

function setFill(pdf: jsPDF, color: string): void {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);
  if (!match) throw new Error(`Invalid color in configuration: ${color}`);
  pdf.setFillColor(
    Number.parseInt(match[1], 16),
    Number.parseInt(match[2], 16),
    Number.parseInt(match[3], 16),
  );
}

function setStroke(pdf: jsPDF, color: string): void {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color);
  if (!match) throw new Error(`Invalid color in configuration: ${color}`);
  pdf.setDrawColor(
    Number.parseInt(match[1], 16),
    Number.parseInt(match[2], 16),
    Number.parseInt(match[3], 16),
  );
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
}

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
  canvas.width = PANEL_WIDTH * PREVIEW_SCALE;
  canvas.height = PANEL_HEIGHT * PREVIEW_SCALE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create the artwork preview for the PDF.");

  context.fillStyle = fabricColor;
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = "#d1d9d3";
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
      const fontSize = element.fontSize * PREVIEW_SCALE;
      context.fillStyle = element.fill;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.font = `${fontSize}px "${element.fontFamily}"`;
      context.fillText(element.text, 0, 0, width);
    } else {
      const image = await loadImage(element.src);
      context.drawImage(image, -width / 2, -height / 2, width, height);
    }
    context.restore();
  }

  return canvas.toDataURL("image/jpeg", 0.9);
}

function get3DPreview(): string | undefined {
  const canvas = document.querySelector<HTMLCanvasElement>(".preview-canvas canvas");
  if (!canvas) return undefined;
  try {
    return canvas.toDataURL("image/jpeg", 0.9);
  } catch (error) {
    throw new Error("Unable to capture the 3D preview. Please wait for the tent to finish loading and try again.", {
      cause: error,
    });
  }
}

function addBrandHeader(pdf: jsPDF, label: string, title: string, subtitle: string): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  setFill(pdf, COLORS.green);
  pdf.roundedRect(MARGIN, 12, 9, 9, 2, 2, "F");
  pdf.setTextColor(COLORS.white);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text("V", MARGIN + 4.5, 18.2, { align: "center" });
  pdf.setTextColor(COLORS.ink);
  pdf.setFontSize(9);
  pdf.text("VERTICAL3DTECH STUDIO", MARGIN + 13, 16);
  pdf.setTextColor(COLORS.muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.text(label.toUpperCase(), pageWidth - MARGIN, 16, { align: "right" });
  setStroke(pdf, COLORS.line);
  pdf.setLineWidth(0.35);
  pdf.line(MARGIN, 25, pageWidth - MARGIN, 25);

  pdf.setTextColor(COLORS.green);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text(label.toUpperCase(), MARGIN, 34);
  pdf.setTextColor(COLORS.ink);
  pdf.setFontSize(20);
  pdf.text(title, MARGIN, 43);
  pdf.setTextColor(COLORS.muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  pdf.text(subtitle, MARGIN, 50);
  return 56;
}

function addCard(pdf: jsPDF, x: number, y: number, width: number, height: number): void {
  setFill(pdf, COLORS.white);
  setStroke(pdf, COLORS.line);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(x, y, width, height, 2.5, 2.5, "FD");
}

function addFooter(pdf: jsPDF, configurationId: string): void {
  const pageCount = pdf.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    setStroke(pdf, COLORS.line);
    pdf.setLineWidth(0.35);
    pdf.line(MARGIN, pageHeight - 14, pageWidth - MARGIN, pageHeight - 14);
    pdf.setTextColor(COLORS.muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text(`CONFIGURATION ${configurationId}`, MARGIN, pageHeight - 8);
    pdf.text(`PAGE ${page} OF ${pageCount}`, pageWidth - MARGIN, pageHeight - 8, { align: "right" });
  }
}

function addColorSwatch(pdf: jsPDF, x: number, y: number, label: string, color: string): void {
  setFill(pdf, color);
  setStroke(pdf, COLORS.line);
  pdf.roundedRect(x, y, 7, 7, 1, 1, "FD");
  pdf.setTextColor(COLORS.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text(label, x + 10, y + 3);
  pdf.setTextColor(COLORS.muted);
  pdf.setFont("helvetica", "normal");
  pdf.text(color.toUpperCase(), x + 10, y + 7);
}

function addOptionsCard(
  pdf: jsPDF,
  configuration: ConfiguratorConfiguration,
  sections: SectionDesigns,
): number {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const cardY = 58;
  const cardHeight = 48;
  const cardWidth = pageWidth - MARGIN * 2;
  addCard(pdf, MARGIN, cardY, cardWidth, cardHeight);

  const variantName = defaultProduct.variants.find((variant) => variant.id === configuration.variantId)?.name
    ?? configuration.variantId;
  const sideWallName = defaultProduct.sideWallOptions.find((option) => option.id === configuration.sideWallOptionId)?.name
    ?? configuration.sideWallOptionId;
  const halfWallName = defaultProduct.halfWallOptions.find((option) => option.id === configuration.halfWallOptionId)?.name
    ?? configuration.halfWallOptionId;

  const columnGap = 9;
  const columnWidth = (cardWidth - 16 - columnGap) / 2;
  const leftX = MARGIN + 8;
  const rightX = leftX + columnWidth + columnGap;
  const labelY = cardY + 10;

  const addOption = (x: number, y: number, label: string, value: string) => {
    pdf.setTextColor(COLORS.muted);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.5);
    pdf.text(label.toUpperCase(), x, y);
    pdf.setTextColor(COLORS.ink);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    const lines = pdf.splitTextToSize(value, columnWidth) as string[];
    pdf.text(lines.slice(0, 2), x, y + 5);
  };

  addOption(leftX, labelY, "TENT MODEL", variantName);
  addOption(leftX, cardY + 27, "SIDE WALLS", sideWallName);
  addOption(rightX, labelY, "HALF WALLS", halfWallName);

  const elementCount = Object.values(sections).reduce((total, items) => total + items.length, 0);
  const logoCount = Object.values(sections).reduce(
    (total, items) => total + items.filter((element) => element.type === "image").length,
    0,
  );
  addOption(rightX, cardY + 27, "DESIGN ELEMENTS", `${elementCount} total${logoCount ? ` · ${logoCount} image${logoCount === 1 ? "" : "s"}` : ""}`);

  const swatchY = cardY + 38;
  addColorSwatch(pdf, leftX, swatchY, "Outer", configuration.colors.outerFabric);
  addColorSwatch(pdf, leftX + 40, swatchY, "Inner", configuration.colors.innerFabric);
  addColorSwatch(pdf, leftX + 80, swatchY, "Frame", configuration.colors.frame);
  return cardY + cardHeight;
}

function addPriceCard(pdf: jsPDF, pricing: PricingBreakdown, y: number): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const cardWidth = pageWidth - MARGIN * 2;
  const cardHeight = 77;
  addCard(pdf, MARGIN, y, cardWidth, cardHeight);

  pdf.setTextColor(COLORS.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("Price breakdown", MARGIN + 8, y + 11);
  pdf.setTextColor(COLORS.muted);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(7);
  pdf.text("ESTIMATED · DEMO PRICING", pageWidth - MARGIN - 8, y + 11, { align: "right" });

  const rows: Array<[string, number]> = [
    ["Base price", pricing.basePrice],
    ["Model adjustment", pricing.variantAdjustment],
    ["Side walls", pricing.sideWallAdjustment],
    ["Half walls", pricing.halfWallAdjustment],
    ["Artwork customization", pricing.customization],
    ["Logo fee", pricing.logoFee],
  ];
  rows.forEach(([label, amount], index) => {
    const rowY = y + 22 + index * 6.7;
    pdf.setTextColor(COLORS.muted);
    pdf.setFontSize(8);
    pdf.text(label, MARGIN + 8, rowY);
    pdf.setTextColor(COLORS.ink);
    pdf.text(formatCurrency(amount, pricing.currency), pageWidth - MARGIN - 8, rowY, { align: "right" });
  });

  const totalY = y + 68;
  setStroke(pdf, COLORS.line);
  pdf.line(MARGIN + 8, totalY - 5, pageWidth - MARGIN - 8, totalY - 5);
  pdf.setTextColor(COLORS.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("ESTIMATED TOTAL", MARGIN + 8, totalY + 1);
  pdf.setTextColor(COLORS.green);
  pdf.setFontSize(13);
  pdf.text(formatCurrency(pricing.total, pricing.currency), pageWidth - MARGIN - 8, totalY + 1, { align: "right" });
}

function addSummaryPage(
  pdf: jsPDF,
  configuration: ConfiguratorConfiguration,
  sections: SectionDesigns,
  pricing: PricingBreakdown,
  preview?: string,
): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  addBrandHeader(
    pdf,
    "CUSTOM CANOPY",
    "Configuration summary",
    `Prepared ${new Date(configuration.updatedAt).toLocaleDateString("en-US")} · Ref ${configuration.configurationId}`,
  );

  const optionsBottom = addOptionsCard(pdf, configuration, sections);
  const previewY = optionsBottom + 7;
  const previewHeight = 74;
  addCard(pdf, MARGIN, previewY, pageWidth - MARGIN * 2, previewHeight);
  pdf.setTextColor(COLORS.ink);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.text("3D product preview", MARGIN + 7, previewY + 10);
  if (preview) {
    const image = pdf.getImageProperties(preview);
    const box = { x: MARGIN + 7, y: previewY + 14, width: pageWidth - MARGIN * 2 - 14, height: 54 };
    const scale = Math.min(box.width / image.width, box.height / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    const format = preview.startsWith("data:image/jpeg") ? "JPEG" : "PNG";
    pdf.addImage(
      preview,
      format,
      box.x + (box.width - width) / 2,
      box.y + (box.height - height) / 2,
      width,
      height,
      undefined,
      "FAST",
    );
  } else {
    pdf.setTextColor(COLORS.muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.text("The 3D preview was unavailable when this summary was created.", MARGIN + 8, previewY + 31);
  }

  addPriceCard(pdf, pricing, previewY + previewHeight + 7);
}

async function addPanelPreviewPage(
  pdf: jsPDF,
  configuration: ConfiguratorConfiguration,
): Promise<void> {
  const pageWidth = pdf.internal.pageSize.getWidth();
  addBrandHeader(
    pdf,
    "ARTWORK PREVIEWS",
    "Your panel artwork",
    "Each panel is designed independently. Previews are scaled to fit this page.",
  );

  const previews = await Promise.all(SECTIONS.map(async (section) => ({
    section,
    elements: configuration.design.sections[section],
    data: await renderSectionPreview(
      configuration.design.sections[section],
      configuration.colors.outerFabric,
    ),
  })));

  const gap = 8;
  const cardWidth = (pageWidth - MARGIN * 2 - gap) / 2;
  const cardHeight = 91;
  const previewBoxWidth = cardWidth - 14;
  const previewBoxHeight = 67;
  const previewAspectRatio = PANEL_WIDTH / PANEL_HEIGHT;
  const previewWidth = Math.min(previewBoxWidth, previewBoxHeight * previewAspectRatio);
  const previewHeight = previewWidth / previewAspectRatio;

  previews.forEach(({ section, elements, data }, index) => {
    const x = MARGIN + (index % 2) * (cardWidth + gap);
    const y = 59 + Math.floor(index / 2) * (cardHeight + gap);
    addCard(pdf, x, y, cardWidth, cardHeight);
    pdf.setTextColor(COLORS.ink);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.text(`${section.toUpperCase()} PANEL`, x + 7, y + 10);
    pdf.setTextColor(COLORS.muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    pdf.text(`${elements.length} element${elements.length === 1 ? "" : "s"}`, x + cardWidth - 7, y + 10, { align: "right" });
    pdf.addImage(
      data,
      "JPEG",
      x + 7 + (previewBoxWidth - previewWidth) / 2,
      y + 16 + (previewBoxHeight - previewHeight) / 2,
      previewWidth,
      previewHeight,
      undefined,
      "FAST",
    );
  });

  const noteY = 59 + 2 * cardHeight + gap + 3;
  setFill(pdf, COLORS.warningLight);
  pdf.roundedRect(MARGIN, noteY, pageWidth - MARGIN * 2, 17, 2, 2, "F");
  pdf.setTextColor(COLORS.warning);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.text("PRODUCTION NOTE", MARGIN + 6, noteY + 7);
  pdf.setFont("helvetica", "normal");
  pdf.text("Visual preview only. Verify against an approved production dieline before printing.", MARGIN + 6, noteY + 12);
}

function addDetailsHeader(pdf: jsPDF, configurationId: string, continued: boolean): number {
  return addBrandHeader(
    pdf,
    "ARTWORK SPECIFICATION",
    continued ? "Artwork details (continued)" : "Artwork details",
    `Configuration ${configurationId} · Element positions and styling for review.`,
  );
}

function addArtworkDetails(pdf: jsPDF, configuration: ConfiguratorConfiguration): void {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const contentWidth = pageWidth - MARGIN * 2;
  let y = addDetailsHeader(pdf, configuration.configurationId, false);

  const addSectionHeading = (section: DesignSection, continued = false) => {
    setFill(pdf, COLORS.greenLight);
    pdf.roundedRect(MARGIN, y, contentWidth, 10, 1.5, 1.5, "F");
    pdf.setTextColor(COLORS.green);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text(section.toUpperCase(), MARGIN + 5, y + 6.5);
    pdf.setTextColor(COLORS.muted);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7);
    const count = configuration.design.sections[section].length;
    pdf.text(
      continued ? "continued" : `${count} element${count === 1 ? "" : "s"}`,
      pageWidth - MARGIN - 5,
      y + 6.5,
      { align: "right" },
    );
    y += 13;
  };

  const ensureSpace = (height: number, continuedSection?: DesignSection) => {
    if (y + height > pdf.internal.pageSize.getHeight() - 20) {
      pdf.addPage();
      y = addDetailsHeader(pdf, configuration.configurationId, true);
      if (continuedSection) addSectionHeading(continuedSection, true);
    }
  };

  for (const section of SECTIONS) {
    const elements = configuration.design.sections[section];
    ensureSpace(elements.length === 0 ? 24 : 14);
    addSectionHeading(section);

    if (elements.length === 0) {
      pdf.setTextColor(COLORS.muted);
      pdf.setFont("helvetica", "italic");
      pdf.setFontSize(8);
      pdf.text("No artwork on this panel.", MARGIN + 5, y + 4);
      y += 10;
      continue;
    }

    for (const [index, element] of elements.entries()) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      const description = element.type === "text"
        ? `"${element.text}" · ${element.fontFamily} ${element.fontSize}px · ${element.fill.toUpperCase()}`
        : "Uploaded image / logo";
      const descriptionLines = pdf.splitTextToSize(description, contentWidth - 18) as string[];
      const cardHeight = 19 + descriptionLines.length * 4.3;
      ensureSpace(cardHeight + 3, section);
      addCard(pdf, MARGIN, y, contentWidth, cardHeight);

      pdf.setTextColor(COLORS.green);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      pdf.text(`ELEMENT ${index + 1} · ${element.type.toUpperCase()}`, MARGIN + 6, y + 6);
      pdf.setTextColor(COLORS.ink);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.text(descriptionLines, MARGIN + 6, y + 11);

      const metaY = y + 15 + descriptionLines.length * 4.3;
      pdf.setTextColor(COLORS.muted);
      pdf.setFontSize(6.5);
      pdf.text(
        `Position ${Math.round(element.x)}, ${Math.round(element.y)}  ·  Size ${Math.round(element.width)} x ${Math.round(element.height)}  ·  Rotation ${Math.round(element.rotation)} deg`,
        MARGIN + 6,
        metaY,
      );
      y += cardHeight + 3;
    }
    y += 2;
  }
}

export async function buildConfigurationPdf(
  configuration: ConfiguratorConfiguration,
  pricing: PricingBreakdown,
  preview3D?: string,
): Promise<Blob> {
  const pdf = new jsPDF();
  const preview = preview3D ?? get3DPreview();
  addSummaryPage(pdf, configuration, configuration.design.sections, pricing, preview);
  pdf.addPage();
  await addPanelPreviewPage(pdf, configuration);
  pdf.addPage();
  addArtworkDetails(pdf, configuration);
  addFooter(pdf, configuration.configurationId);
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
