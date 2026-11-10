import { defaultProduct } from "../../config/products";
import { useConfiguratorStore } from "../../store/configuratorStore";

export default function ProductOptions() {
  const variantId = useConfiguratorStore((state) => state.variantId);
  const setProductVariant = useConfiguratorStore((state) => state.setProductVariant);
  const sideWallOptionId = useConfiguratorStore((state) => state.sideWallOptionId);
  const halfWallOptionId = useConfiguratorStore((state) => state.halfWallOptionId);
  const setSideWallOption = useConfiguratorStore((state) => state.setSideWallOption);
  const setHalfWallOption = useConfiguratorStore((state) => state.setHalfWallOption);

  return (
    <div className="product-options">
      <label htmlFor="tent-variant">Tent model</label>
      <select id="tent-variant" value={variantId} onChange={(event) => setProductVariant(event.target.value)}>
        {defaultProduct.variants.map((variant) => <option key={variant.id} value={variant.id}>{variant.name}</option>)}
      </select>
      <label htmlFor="side-wall-option">Side walls</label>
      <select id="side-wall-option" value={sideWallOptionId} onChange={(event) => setSideWallOption(event.target.value)}>
        {defaultProduct.sideWallOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
      <label htmlFor="half-wall-option">Half walls (set of 2)</label>
      <select id="half-wall-option" value={halfWallOptionId} onChange={(event) => setHalfWallOption(event.target.value)}>
        {defaultProduct.halfWallOptions.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
      </select>
      <p>Demo options and adjustments; connect a production catalog for live prices.</p>
    </div>
  );
}
