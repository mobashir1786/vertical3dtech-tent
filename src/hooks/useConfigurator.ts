import { useConfiguratorStore } from "../store/configuratorStore";

export function useConfigurator() {
  const productId = useConfiguratorStore((state) => state.productId);
  const variantId = useConfiguratorStore((state) => state.variantId);
  const colors = useConfiguratorStore((state) => ({
    outerFabricColor: state.outerFabricColor,
    innerFabricColor: state.innerFabricColor,
    frameColor: state.frameColor,
  }));
  const activeSection = useConfiguratorStore((state) => state.activeSection);
  const sections = useConfiguratorStore((state) => state.sections);
  const actions = useConfiguratorStore((state) => ({
    setProductVariant: state.setProductVariant,
    setOuterFabricColor: state.setOuterFabricColor,
    setInnerFabricColor: state.setInnerFabricColor,
    setFrameColor: state.setFrameColor,
    setActiveSection: state.setActiveSection,
  }));
  return {
    productId, variantId, colors, activeSection, sections, actions,
    getConfiguration: () => useConfiguratorStore.getState().getConfiguration(),
  };
}
