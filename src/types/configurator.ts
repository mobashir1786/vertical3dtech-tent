export type DesignSection = "roof" | "front" | "left" | "right";

export interface BaseDesignElement {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export interface TextDesignElement extends BaseDesignElement {
  type: "text";
  text: string;
  fontSize: number;
  fontFamily: string;
  fill: string;
}

export interface ImageDesignElement extends BaseDesignElement {
  type: "image";
  src: string;
}

export type DesignElement = TextDesignElement | ImageDesignElement;
export type SectionDesigns = Record<DesignSection, DesignElement[]>;

export interface ProductDesign {
  activeSection: DesignSection;
  sections: SectionDesigns;
}

export interface ProductVariant {
  id: string;
  name: string;
  modelPath: string;
  description: string;
}

export interface ProductOption {
  id: string;
  name: string;
  priceAdjustment: number;
}

export interface ProductDefinition {
  id: string;
  name: string;
  description: string;
  variants: ProductVariant[];
  sideWallOptions: ProductOption[];
  halfWallOptions: ProductOption[];
}

export interface ProductColors {
  outerFabric: string;
  innerFabric: string;
  frame: string;
}

export interface ConfiguratorConfiguration {
  schemaVersion: 3;
  configurationId: string;
  productId: string;
  variantId: string;
  sideWallOptionId: string;
  halfWallOptionId: string;
  colors: ProductColors;
  design: ProductDesign;
  createdAt: string;
  updatedAt: string;
}
