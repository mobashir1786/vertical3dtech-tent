
import { lazy, Suspense } from "react";
import {
  Save,
  Eye,
  Tent,
  Box,
  Layers3,
  WandSparkles,
  RotateCcw,
} from "lucide-react";

import ColorPicker from "./components/customization/ColorPicker";
import ImageUploader from "./components/editor2d/ImageUploader";
import TextEditor from "./components/editor2d/TextEditor";
import TransformControls from "./components/editor2d/TransformControls";
import ProductOptions from "./components/customization/ProductOptions";
import PriceSummary from "./components/summary/PriceSummary";

import "./App.css";

const Scene = lazy(() => import("./components/preview3d/Scene"));
const CanvasEditor = lazy(() => import("./components/editor2d/CanvasEditor"));

function App() {
  return (
    <main className="app-container">

      {/* Top Navigation */}
      <header className="app-header">
        <div className="brand">
          <div className="brand-icon">
            <Tent size={21} />
          </div>

          <div>
            <h2>vertical3dtech<span>STUDIO</span></h2>
            <small>PRODUCT CONFIGURATOR</small>
          </div>
        </div>

        <div className="header-actions">
          <span className="save-indicator">
            <Save size={14} />
            Changes save on this device
          </span>
        </div>
      </header>

      {/* Main Configurator */}
      <div className="configurator-layout mt-4">

        {/* Left Sidebar */}
        <aside className="sidebar">

          <div className="sidebar-heading">
            <div className="sidebar-heading-icon">
              <WandSparkles size={18} />
            </div>

            <div>
              <h2>Design Controls</h2>
              <p>Personalize your product</p>
            </div>
          </div>

          <section className="control-section">
            <div className="section-title">
              <span>00</span>
              <h3>Product & Size</h3>
            </div>
            <ProductOptions />
          </section>

          {/* Colors */}
          <section className="control-section">
            <div className="section-title">
              <span>01</span>
              <h3>Fabric & Frame</h3>
            </div>

            <ColorPicker />
          </section>

          {/* Branding */}
          <section className="control-section">
            <div className="section-title">
              <span>02</span>
              <h3>Branding</h3>
            </div>

            <div className="branding-label">
              Company Logo
            </div>

            <ImageUploader />

            <div className="subsection-divider" />

            <TextEditor />
          </section>

          {/* Transform */}
          <section className="control-section">
            <div className="section-title">
              <span>03</span>
              <h3>Element Controls</h3>
            </div>

            <TransformControls />
          </section>

          <div className="sidebar-tip">
            <WandSparkles size={16} />

            <p>
              <strong>Design tip</strong>
              Select any text or logo on the canvas to
              move, resize or rotate it.
            </p>
          </div>

        </aside>

        {/* Right Workspace */}
        <section className="workspace">

          {/* 3D Preview */}
          <section className="preview-panel">

            <div className="panel-header">
              <div className="panel-title">
                <div className="panel-icon">
                  <Box size={18} />
                </div>

                <div>
                  <h2>3D Product Preview</h2>
                  <p>Explore your customized canopy</p>
                </div>
              </div>

              <span className="live-badge">
                <span className="status-dot" />
                LIVE PREVIEW
              </span>
            </div>

            <div className="preview-canvas">
              <Suspense fallback={<div className="preview-loading" role="status">Loading 3D preview…</div>}>
                <Scene />
              </Suspense>

              <div className="preview-instructions">
                <RotateCcw size={13} />
                Drag to rotate
                <span>·</span>
                Scroll to zoom
              </div>
            </div>

          </section>

          {/* 2D Editor */}
          <section className="editor-panel">

            <div className="panel-header">
              <div className="panel-title">
                <div className="panel-icon">
                  <Layers3 size={18} />
                </div>

                <div>
                  <h2>2D Artwork Editor</h2>
                  <p>Customize branding on individual tent panels</p>
                </div>
              </div>

              <span className="editor-badge">
                DESIGN CANVAS
              </span>
            </div>

            <Suspense fallback={<div className="canvas-loading" role="status">Loading 2D editor…</div>}>
              <CanvasEditor />
            </Suspense>

          </section>

          <PriceSummary />

        </section>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <span>VERTICAL3DTECH · CUSTOM CONFIGURATION</span>
        <span>
          <Eye size={13} />
          Your design workspace
        </span>
      </footer>

    </main>
  );
}

export default App;
