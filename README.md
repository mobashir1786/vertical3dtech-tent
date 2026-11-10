# Canopy Studio — Interactive Product Configurator

React, TypeScript, Three.js and React Three Fiber configurator for the supplied canopy GLB models.

## Run locally

Requirements: Node.js 20.19+ (or 22.12+) and npm.

```bash
npm install
npm run verify:assets
npm run dev
```

Validate changes with:

```bash
npm run build
npm run lint
npm run verify:assets
```

## Features

- Switch between the three supplied GLB model files; customize outer/inner fabric and frame colors.
- Choose side-wall and half-wall options independently.
- Design roof, front, left and right panels with text and PNG/JPEG/WebP artwork; move, resize and rotate elements.
- See design texture and color changes in the 3D model.
- Automatically save the current configuration, including uploaded image data, in browser IndexedDB.
- Calculate demo pricing through a replaceable service boundary; wall options, model variants, design elements and logo uploads affect the total.
- Export a production-summary PDF with a 3D snapshot, four 2D panel previews, artwork transforms and price breakdown.
- Send structured configuration and price to the mock Shopify cart adapter.
- Use the responsive app as a hosted iframe.

## Architecture

- `src/config/` defines products, model variants and wall options.
- `src/store/` holds reusable configurator state and persistence.
- `src/components/editor2d/` and `src/components/preview3d/` implement the synchronized editors.
- `src/hooks/` and `src/utils/` generate the 3D artwork texture and handle persistence.
- `src/services/` separates pricing, Shopify cart and PDF integrations.

Pricing and Shopify are mock services. Replace these service boundaries with server-side endpoints, real Shopify product variant IDs, validated pricing, and order-file storage before accepting purchases.

## Model and artwork limitations

The supplied GLBs contain UVs and named fabric/frame materials. The four editor panels are packed into a model-specific artwork atlas and applied to the fabric mesh. Roof artwork is shown once on the front-facing roof facet, and front artwork is shown on the front valance; left/right artwork follows the corresponding side panels. The source files do not include a verified production dieline, so the preview remains an approximation: verify alignment against an approved model template before manufacturing. Wall selections and their demo prices are stored in the cart payload; the supplied models do not include wall geometry.

The PDF is a review/production summary, not a print-ready dieline. The displayed prices and adjustments are examples, not a vendor quote.

## Embedding

After deploying the built app to a public HTTPS host, embed it in a storefront:

```html
<iframe
  src="https://YOUR-CONFIGURATOR-HOST/"
  title="Custom canopy configurator"
  loading="lazy"
  style="width: 100%; min-height: 1000px; border: 0"
></iframe>
```

Configure host permissions and any required cross-origin policies on deployment.
