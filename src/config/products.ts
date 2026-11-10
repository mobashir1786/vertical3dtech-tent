import type { ProductDefinition } from "../types/configurator";

export const products: ProductDefinition[] = [{
  id: "custom-canopy-tent",
  name: "Custom Canopy Tent",
  description: "Customize your canopy tent with colors, text and branding.",
  variants: [
    { id: "tent-5-5", name: "Tent Model 5.5", modelPath: "/models/Tent_5_5.glb", description: "Supplied model file: Tent_5_5.glb" },
    { id: "tent-6-5", name: "Tent Model 6.5", modelPath: "/models/Tent 6.5_6.5.glb", description: "Supplied model file: Tent 6.5_6.5.glb" },
    { id: "tent-8-8", name: "Tent Model 8.8", modelPath: "/models/Tent_8_8.glb", description: "Supplied model file: Tent_8_8.glb" },
  ],
  sideWallOptions: [
    { id: "none", name: "None", priceAdjustment: 0 },
    { id: "one-single", name: "(1) 10ft Side Wall: Single Sided Print", priceAdjustment: 120 },
    { id: "three-single", name: "(3) 10ft Side Walls: Single Sided Print", priceAdjustment: 300 },
    { id: "one-double", name: "(1) 10ft Side Wall: Double Sided Print", priceAdjustment: 170 },
    { id: "three-double", name: "(3) 10ft Side Walls: Double Sided Print", priceAdjustment: 450 },
  ],
  halfWallOptions: [
    { id: "none", name: "None", priceAdjustment: 0 },
    { id: "single", name: "Half Walls (Set of 2): Single Sided Print", priceAdjustment: 160 },
    { id: "double", name: "Half Walls (Set of 2): Double Sided Print", priceAdjustment: 220 },
  ],
}];

export const defaultProduct = products[0];
export const defaultVariant = defaultProduct.variants[0];
