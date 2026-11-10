
import { useConfiguratorStore } from "../../store/configuratorStore";
import type { DesignElement } from "../../types/configurator";

export default function TextEditor() {
    const activeSection = useConfiguratorStore(
        (state) => state.activeSection
    );

    const sections = useConfiguratorStore(
        (state) => state.sections
    );

    const selectedElementId = useConfiguratorStore(
        (state) => state.selectedElementId
    );

    const addText = useConfiguratorStore(
        (state) => state.addText
    );

    const updateElement = useConfiguratorStore(
        (state) => state.updateElement
    );

    const selectedElement = sections[activeSection].find(
        (element) => element.id === selectedElementId
    );

    const selectedText =
        selectedElement?.type === "text" ? selectedElement : null;

    const updateSelectedText = (
        updates: Partial<DesignElement>
    ) => {
        if (!selectedText) return;

        updateElement(selectedText.id, updates);
    };

    return (
        <div className="text-editor">
            <div className="text-editor-header">
                <h3>Text Customization</h3>
                <p>Add and customize your brand text.</p>
            </div>

            <button
                type="button"
                className="add-text-button"
                onClick={addText}
            >
                + Add Text
            </button>

            <div className="text-editor-fields">
                <label>
                    Text Content
                    <input
                        type="text"
                        value={selectedText?.text ?? ""}
                        placeholder="Select a text element"
                        disabled={!selectedText}
                        onChange={(event) =>
                            updateSelectedText({ text: event.target.value } as Partial<DesignElement>)
                        }
                    />
                </label>

                <label>
                    Font Size
                    <input
                        type="number"
                        min="8"
                        max="120"
                        value={selectedText?.fontSize ?? 48}
                        disabled={!selectedText}
                        onChange={(event) =>
                            updateSelectedText({
                                fontSize: Number(event.target.value),
                            } as Partial<DesignElement>)
                        }
                    />
                </label>

                <label>
                    Font Family
                    <select
                        value={selectedText?.fontFamily ?? "Arial"}
                        disabled={!selectedText}
                        onChange={(event) =>
                            updateSelectedText({
                                fontFamily: event.target.value,
                            } as Partial<DesignElement>)
                        }
                    >
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Impact">Impact</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Courier New">Courier New</option>
                    </select>
                </label>

                <label>
                    Text Color
                    <input
                        type="color"
                        value={selectedText?.fill ?? "#111827"}
                        disabled={!selectedText}
                        onChange={(event) =>
                            updateSelectedText({
                                fill: event.target.value,
                            } as Partial<DesignElement>)
                        }
                    />
                </label>
            </div>

            {!selectedText && (
                <p className="text-editor-hint">
                    Add a text element and select it on the canvas to edit it.
                </p>
            )}
        </div>
    );
}
