import { useEffect, useMemo, useState } from "react";
import { FileDown, ShoppingCart } from "lucide-react";
import { useConfiguratorStore } from "../../store/configuratorStore";
import { getProductPrice, type PricingBreakdown } from "../../services/pricingService";
import { addConfigurationToCart } from "../../services/shopifyService";

export default function PriceSummary() {
  const variantId = useConfiguratorStore((s) => s.variantId);
  const sideWallOptionId = useConfiguratorStore((s) => s.sideWallOptionId);
  const halfWallOptionId = useConfiguratorStore((s) => s.halfWallOptionId);
  const sections = useConfiguratorStore((s) => s.sections);
  const getConfiguration = useConfiguratorStore((s) => s.getConfiguration);
  const [pricedResult, setPricedResult] = useState<{ key: string; price: PricingBreakdown } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ key: string; text: string; error: boolean } | null>(null);
  const [priceError, setPriceError] = useState<{ key: string; text: string } | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const customizationCount = useMemo(
    () => Object.values(sections).reduce((sum, items) => sum + items.length, 0),
    [sections]
  );
  const hasLogo = Object.values(sections).some((items) => items.some((item) => item.type === "image"));
  const pricingRequest = useMemo(() => ({
    variantId,
    sideWallOptionId,
    halfWallOptionId,
    customizationCount,
    hasLogo,
  }), [variantId, sideWallOptionId, halfWallOptionId, customizationCount, hasLogo]);
  const pricingKey = JSON.stringify(pricingRequest);
  const price = pricedResult?.key === pricingKey ? pricedResult.price : null;
  const currentPriceError = priceError?.key === pricingKey ? priceError : null;
  const priceLoading = price === null && currentPriceError === null;
  const currentMessage = message?.key === pricingKey ? message : null;

  useEffect(() => {
    let active = true;
    void getProductPrice(pricingRequest).then((result) => {
      if (active) {
        setPricedResult({ key: pricingKey, price: result });
        setPriceError(null);
      }
    }).catch((error: unknown) => {
      console.error("Unable to calculate the configuration price.", error);
      if (active) setPriceError({
        key: pricingKey,
        text: error instanceof Error ? error.message : "Unable to calculate price.",
      });
    });
    return () => { active = false; };
  }, [pricingRequest, pricingKey, retryCount]);

  const handleCart = async () => {
    if (!price) return;
    setBusy(true);
    try {
      const result = await addConfigurationToCart(getConfiguration(), price);
      setMessage({
        key: pricingKey,
        text: result.success ? "Configuration added to mock cart." : "Unable to add configuration.",
        error: !result.success,
      });
    } catch (error: unknown) {
      console.error("Unable to add the configuration to the mock cart.", error);
      setMessage({ key: pricingKey, text: "Cart request failed. Please try again.", error: true });
    } finally {
      setBusy(false);
    }
  };

  const handlePdf = async () => {
    if (!price) return;
    setBusy(true);
    try {
      const { downloadConfigurationPdf } = await import("../../services/pdfService");
      await downloadConfigurationPdf(getConfiguration(), price);
      setMessage({ key: pricingKey, text: "Configuration PDF downloaded.", error: false });
    } catch (error: unknown) {
      console.error("Unable to export the configuration PDF.", error);
      setMessage({
        key: pricingKey,
        text: error instanceof Error ? error.message : "PDF export failed. Please try again.",
        error: true,
      });
    } finally {
      setBusy(false);
    }
  };

  const formatPrice = (amount: number) => new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: price?.currency ?? "USD",
  }).format(amount);

  return (
    <section className="price-summary">
      <div className="price-summary-heading">
        <div><span className="summary-eyebrow">YOUR CONFIGURATION</span><h2>Price summary</h2></div>
        <strong>{price ? formatPrice(price.total) : priceLoading ? "Calculating…" : "—"}</strong>
      </div>
      <div className="price-line"><span>Base price</span><span>{price ? formatPrice(price.basePrice) : "—"}</span></div>
      <div className="price-line"><span>Model adjustment</span><span>{price ? formatPrice(price.variantAdjustment) : "—"}</span></div>
      <div className="price-line"><span>Side walls</span><span>{price ? formatPrice(price.sideWallAdjustment) : "—"}</span></div>
      <div className="price-line"><span>Half walls</span><span>{price ? formatPrice(price.halfWallAdjustment) : "—"}</span></div>
      <div className="price-line"><span>Design elements ({customizationCount})</span><span>{price ? formatPrice(price.customization) : "—"}</span></div>
      <div className="price-line"><span>Logo fee</span><span>{price ? formatPrice(price.logoFee) : "—"}</span></div>
      <div className="price-total"><span>Estimated total</span><strong>{price ? formatPrice(price.total) : "—"}</strong></div>
      <div className="summary-actions">
        <button type="button" onClick={handlePdf} disabled={busy || !price}>
          <FileDown size={16}/> Export PDF
        </button>
        <button type="button" className="cart-button" onClick={handleCart} disabled={busy || !price}>
          <ShoppingCart size={16}/> {busy ? "Working..." : priceLoading ? "Calculating..." : currentPriceError ? "Price unavailable" : "Add to cart"}
        </button>
      </div>
      {currentPriceError && (
        <p className="cart-message" role="alert" data-error="true">
          {currentPriceError.text}{" "}
          <button type="button" onClick={() => setRetryCount((count) => count + 1)}>Retry</button>
        </p>
      )}
      {currentMessage && <p className="cart-message" role="status" aria-live="polite" data-error={currentMessage.error}>{currentMessage.text}</p>}
      <p className="pricing-note">Demo pricing only · Mock Shopify integration</p>
    </section>
  );
}
