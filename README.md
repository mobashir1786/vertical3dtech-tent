# vertical3dtech Studio — Canopy Configurator

vertical3dtech Studio is a browser-based product configurator for customizing supplied canopy tent models. Choose a model, set fabric and frame colors, create artwork for individual tent panels, and review the design in a synchronized 2D editor and interactive 3D preview.

**Stack:** React, TypeScript, Vite, Three.js, React Three Fiber, React Konva, and Zustand.

## Features

- **Product options:** Choose one of three supplied GLB tent models, side-wall options, and half-wall options.
- **Color customization:** Set outer fabric, inner fabric, and frame colors.
- **Panel artwork:** Design the roof, front, left, and right panels independently. Add and edit text or upload a logo/image; select elements on the canvas to move, resize, or rotate them.
- **Live 3D preview:** Rotate and zoom the tent to review the selected model, colors, and artwork.
- **Local persistence:** The current configuration, including uploaded image data, is saved in this browser using IndexedDB.
- **Price summary:** Calculate an example price with an asynchronous mock pricing service.
- **PDF summary:** Export a review PDF with the selected options, price breakdown, 3D snapshot, panel previews, and artwork element details.
- **Cart adapter:** Pass the configuration and price to a mock Shopify cart adapter, ready to be replaced by a real integration.
- **Responsive embed:** The app can be hosted and embedded in another site using an iframe.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A modern browser with WebGL enabled for the 3D preview

## Run locally

```bash
npm install
npm run verify:assets
npm run dev
```

Open the local URL printed by Vite. In the app, choose a tent model and options, adjust colors, then select a panel in the 2D editor to add artwork. Rotate or zoom the 3D preview to inspect the result.

## Project scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Run the TypeScript project build and create the production bundle in `dist/`. |
| `npm run preview` | Serve the production bundle locally after building. |
| `npm run lint` | Run ESLint. |
| `npm run verify:assets` | Check that the supplied GLB model assets are present and valid for the project. |

Before submitting changes, run:

```bash
npm run build
npm run lint
npm run verify:assets
```

## Project structure

```text
public/models/                 Supplied GLB tent models
src/
  components/
    customization/             Product options and color controls
    editor2d/                  Panel artwork editor and element controls
    preview3d/                 Three.js / React Three Fiber preview
    summary/                   Price summary and configuration actions
  config/                      Product, model, and option definitions
  hooks/                       Configurator and texture-generation hooks
  services/                    Pricing, PDF, and Shopify adapter boundaries
  store/                       Shared configurator state
  types/                       Configuration and artwork types
  utils/                       Artwork texture, storage, and pricing utilities
scripts/                       Asset verification script
```

## Configuration and integrations

Product models and selectable options are defined in `src/config/products.ts`. The Zustand store in `src/store/` manages the current design and browser persistence.

The integrations in `src/services/` are demonstration implementations:

- **Pricing:** `pricingService.ts` calculates sample USD prices in the browser. It is not a live API, quote, or production price.
- **Shopify:** `shopifyService.ts` returns a mock cart result. Connect this adapter to your Shopify Storefront API and real product variants before accepting orders.
- **PDF:** `pdfService.ts` generates a customer/review summary. It is not a print-ready production file.

For production, implement pricing and cart operations on trusted server-side endpoints, validate configuration data, and define how customer artwork is securely stored and passed to manufacturing.

## 3D artwork and model limitations

Artwork is rendered into a model-specific texture atlas and applied to the supplied model's fabric mesh. The roof artwork targets one front-facing roof facet; front artwork targets the front valance; left and right artwork target their corresponding mapped regions.

The reference product is a 10×10 canopy, but the supplied model files are the 5.5, 6.5, and 8.8 variants listed in the configurator. No 10×10 GLB or verified production dielines were supplied, and the side-wall options do not add wall geometry to the 3D models. As a result, the available models and panel placement are a visual approximation of the reference product, not a manufacturing guarantee. Verify artwork against approved production templates and model UVs before printing.

## Build and deploy

Create and locally inspect a production build:

```bash
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static host configured to serve the app's `index.html` for the application route. The model assets are served from `public/models/` and included in the build.

To embed a deployed instance:

```html
<iframe
  src="https://YOUR-CONFIGURATOR-HOST/"
  title="Custom canopy configurator"
  loading="lazy"
  style="width: 100%; min-height: 1000px; border: 0"
></iframe>
```

Configure the host's iframe/security policies and any required cross-origin settings for your storefront.
