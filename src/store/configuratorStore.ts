import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  ConfiguratorConfiguration, DesignElement, DesignSection,
  ProductColors, SectionDesigns, TextDesignElement,
} from "../types/configurator";
import { defaultProduct, defaultVariant } from "../config/products";
import { configurationStorage } from "../utils/configurationStorage";

interface ConfiguratorState {
  configurationId: string;
  productId: string;
  variantId: string;
  setProductVariant: (variantId: string) => void;
  sideWallOptionId: string;
  halfWallOptionId: string;
  setSideWallOption: (optionId: string) => void;
  setHalfWallOption: (optionId: string) => void;
  outerFabricColor: string;
  innerFabricColor: string;
  frameColor: string;
  setOuterFabricColor: (color: string) => void;
  setInnerFabricColor: (color: string) => void;
  setFrameColor: (color: string) => void;
  activeSection: DesignSection;
  sections: SectionDesigns;
  selectedElementId: string | null;
  setActiveSection: (section: DesignSection) => void;
  addElement: (element: DesignElement) => void;
  updateElement: (id: string, updates: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  addText: () => void;
  getColors: () => ProductColors;
  getConfiguration: () => ConfiguratorConfiguration;
}

interface PersistedConfiguratorState {
  configurationId: string;
  productId: string;
  variantId: string;
  sideWallOptionId: string;
  halfWallOptionId: string;
  outerFabricColor: string;
  innerFabricColor: string;
  frameColor: string;
  activeSection: DesignSection;
  sections: SectionDesigns;
}

const createInitialSections = (): SectionDesigns => ({
  roof: [], front: [], left: [], right: [],
});

export const useConfiguratorStore = create<ConfiguratorState>()(persist((set, get) => ({
  configurationId: crypto.randomUUID(),
  productId: defaultProduct.id,
  variantId: defaultVariant.id,
  setProductVariant: (variantId) => {
    if (defaultProduct.variants.some((variant) => variant.id === variantId)) {
      set({ variantId });
    }
  },
  sideWallOptionId: "none",
  halfWallOptionId: "none",
  setSideWallOption: (sideWallOptionId) => {
    if (defaultProduct.sideWallOptions.some((option) => option.id === sideWallOptionId)) {
      set({ sideWallOptionId });
    }
  },
  setHalfWallOption: (halfWallOptionId) => {
    if (defaultProduct.halfWallOptions.some((option) => option.id === halfWallOptionId)) {
      set({ halfWallOptionId });
    }
  },
  outerFabricColor: "#ffffff",
  innerFabricColor: "#e5e7eb",
  frameColor: "#b8bec7",
  setOuterFabricColor: (color) => set({ outerFabricColor: color }),
  setInnerFabricColor: (color) => set({ innerFabricColor: color }),
  setFrameColor: (color) => set({ frameColor: color }),
  activeSection: "front",
  sections: createInitialSections(),
  selectedElementId: null,
  setActiveSection: (section) => set({ activeSection: section, selectedElementId: null }),
  addElement: (element) => set((state) => ({
    sections: {
      ...state.sections,
      [state.activeSection]: [...state.sections[state.activeSection], element],
    },
    selectedElementId: element.id,
  })),
  updateElement: (id, updates) => set((state) => ({
    sections: {
      ...state.sections,
      [state.activeSection]: state.sections[state.activeSection].map((element) =>
        element.id === id ? ({ ...element, ...updates } as DesignElement) : element
      ),
    },
  })),
  removeElement: (id) => set((state) => ({
    sections: {
      ...state.sections,
      [state.activeSection]: state.sections[state.activeSection].filter((element) => element.id !== id),
    },
    selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
  })),
  selectElement: (id) => set({ selectedElementId: id }),
  addText: () => set((state) => {
    const element: TextDesignElement = {
      id: crypto.randomUUID(), type: "text", text: "Your Brand",
      x: 200, y: 200, width: 300, height: 70, rotation: 0,
      fontSize: 48, fontFamily: "Arial", fill: "#111827",
    };
    return {
      sections: { ...state.sections, [state.activeSection]: [...state.sections[state.activeSection], element] },
      selectedElementId: element.id,
    };
  }),
  getColors: () => {
    const state = get();
    return {
      outerFabric: state.outerFabricColor,
      innerFabric: state.innerFabricColor,
      frame: state.frameColor,
    };
  },
  getConfiguration: () => {
    const state = get();
    const now = new Date().toISOString();
    return {
      schemaVersion: 3,
      configurationId: state.configurationId,
      productId: state.productId,
      variantId: state.variantId,
      sideWallOptionId: state.sideWallOptionId,
      halfWallOptionId: state.halfWallOptionId,
      colors: {
        outerFabric: state.outerFabricColor,
        innerFabric: state.innerFabricColor,
        frame: state.frameColor,
      },
      design: { activeSection: state.activeSection, sections: state.sections },
      createdAt: now,
      updatedAt: now,
    };
  },
}), {
  name: "canopy-studio-configuration",
  version: 3,
  storage: createJSONStorage(() => configurationStorage),
  partialize: (state): PersistedConfiguratorState => ({
    configurationId: state.configurationId,
    productId: state.productId,
    variantId: state.variantId,
    sideWallOptionId: state.sideWallOptionId,
    halfWallOptionId: state.halfWallOptionId,
    outerFabricColor: state.outerFabricColor,
    innerFabricColor: state.innerFabricColor,
    frameColor: state.frameColor,
    activeSection: state.activeSection,
    sections: state.sections,
  }),
  migrate: (persistedState) => {
    const saved = persistedState as Partial<PersistedConfiguratorState>;
    return {
      configurationId: crypto.randomUUID(),
      productId: defaultProduct.id,
      variantId: defaultVariant.id,
      sideWallOptionId: "none",
      halfWallOptionId: "none",
      outerFabricColor: "#ffffff",
      innerFabricColor: "#e5e7eb",
      frameColor: "#b8bec7",
      activeSection: "front" as const,
      sections: createInitialSections(),
      ...saved,
    };
  },
  onRehydrateStorage: () => (_state, error) => {
    if (error) console.error("Unable to restore the saved tent configuration.", error);
  },
}));
