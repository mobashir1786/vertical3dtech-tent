
import { useConfiguratorStore } from "../../store/configuratorStore";

const presetColors = [
    "#ffffff",
    "#ef4444",
    "#2563eb",
    "#16a34a",
    "#facc15",
    "#111827",
    "#f97316",
    "#9333ea",
];

export default function ColorPicker() {
    const {
        outerFabricColor,
        innerFabricColor,
        frameColor,
        setOuterFabricColor,
        setInnerFabricColor,
        setFrameColor,
    } = useConfiguratorStore();

    const renderColorControl = (
        label: string,
        color: string,
        onChange: (color: string) => void
    ) => (
        <div className="color-control">
            <label>{label}</label>

            <div className="color-options">
                {presetColors.map((preset) => (
                    <button
                        key={preset}
                        type="button"
                        className={`color-swatch ${color === preset ? "active" : ""
                            }`}
                        style={{ backgroundColor: preset }}
                        onClick={() => onChange(preset)}
                        aria-label={`Select ${preset}`}
                    />
                ))}

                <input
                    type="color"
                    value={color}
                    onChange={(event) => onChange(event.target.value)}
                    title={`Choose ${label}`}
                />
            </div>

            <span className="color-value">{color}</span>
        </div>
    );

    return (
        <section className="color-picker">
            <h3>Customize Colors</h3>

            {renderColorControl(
                "Outer Fabric",
                outerFabricColor,
                setOuterFabricColor
            )}

            {renderColorControl(
                "Inner Fabric",
                innerFabricColor,
                setInnerFabricColor
            )}

            {renderColorControl(
                "Frame",
                frameColor,
                setFrameColor
            )}
        </section>
    );
}
