import type { ConfiguratorConfiguration } from "../types/configurator";
import type { PricingBreakdown } from "./pricingService";

export interface MockCartResult {
  success: boolean;
  cartItem: {
    productId: string;
    variantId: string;
    quantity: number;
    price: number;
    properties: Record<string, string>;
  };
}

// Demonstration adapter. A real Shopify Storefront API call belongs here.
export async function addConfigurationToCart(
  configuration: ConfiguratorConfiguration,
  pricing: PricingBreakdown
): Promise<MockCartResult> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return {
    success: true,
    cartItem: {
      productId: configuration.productId,
      variantId: configuration.variantId,
      quantity: 1,
      price: pricing.total,
      properties: {
        configurationId: configuration.configurationId,
        configuration: JSON.stringify(configuration),
        outerFabric: configuration.colors.outerFabric,
        innerFabric: configuration.colors.innerFabric,
        frame: configuration.colors.frame,
        sideWalls: configuration.sideWallOptionId,
        halfWalls: configuration.halfWallOptionId,
        configurationVersion: String(configuration.schemaVersion),
      },
    },
  };
}
