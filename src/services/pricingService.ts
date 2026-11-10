export interface PricingRequest {
  variantId: string;
  sideWallOptionId: string;
  halfWallOptionId: string;
  customizationCount: number;
  hasLogo: boolean;
}

export interface PricingBreakdown {
  basePrice: number;
  variantAdjustment: number;
  sideWallAdjustment: number;
  halfWallAdjustment: number;
  customization: number;
  logoFee: number;
  total: number;
  currency: "USD";
}

// Mock API boundary: replace this function body with fetch("/api/pricing") later.
export async function getProductPrice(input: PricingRequest): Promise<PricingBreakdown> {
  await new Promise((resolve) => setTimeout(resolve, 180));
  const variantAdjustment: Record<string, number> = {
    "tent-5-5": 0,
    "tent-6-5": 80,
    "tent-8-8": 160,
  };
  const sideWallAdjustment: Record<string, number> = {
    none: 0,
    "one-single": 120,
    "three-single": 300,
    "one-double": 170,
    "three-double": 450,
  };
  const halfWallAdjustment: Record<string, number> = {
    none: 0,
    single: 160,
    double: 220,
  };
  const basePrice = 499;
  const adjustment = variantAdjustment[input.variantId] ?? 0;
  const sideWalls = sideWallAdjustment[input.sideWallOptionId] ?? 0;
  const halfWalls = halfWallAdjustment[input.halfWallOptionId] ?? 0;
  const customization = input.customizationCount * 12;
  const logoFee = input.hasLogo ? 25 : 0;
  return {
    basePrice,
    variantAdjustment: adjustment,
    sideWallAdjustment: sideWalls,
    halfWallAdjustment: halfWalls,
    customization,
    logoFee,
    total: basePrice + adjustment + sideWalls + halfWalls + customization + logoFee,
    currency: "USD",
  };
}
