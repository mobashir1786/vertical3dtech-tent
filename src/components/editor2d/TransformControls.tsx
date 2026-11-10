
import { useConfiguratorStore } from "../../store/configuratorStore";
import type { DesignElement } from "../../types/configurator";

export default function TransformControls() {
    const activeSection = useConfiguratorStore(
        (state) => state.activeSection
    );

    const sections = useConfiguratorStore(
        (state) => state.sections
    );

    const selectedElementId = useConfiguratorStore(
        (state) => state.selectedElementId
    );

    const updateElement = useConfiguratorStore(
        (state) => state.updateElement
    );

    const removeElement = useConfiguratorStore(
        (state) => state.removeElement
    );

    const selectElement = useConfiguratorStore(
        (state) => state.selectElement
    );

    const selectedElement = sections[activeSection].find(
        (element) => element.id === selectedElementId
    );

    if (!selectedElement) {
        return (
            <div className="transform-controls">
                <p>Select an element on the canvas to edit it.</p>
            </div>
        );
    }

    const rotateElement = (angle: number) => {
        updateElement(selectedElement.id, {
            rotation: selectedElement.rotation + angle,
        } as Partial<DesignElement>);
    };

    const handleDelete = () => {
        removeElement(selectedElement.id);
        selectElement(null);
    };

    return (
        <div className="transform-controls">
            <h3>Transform</h3>

            <div className="transform-actions">
                <button
                    type="button"
                    onClick={() => rotateElement(-15)}
                >
                    Rotate -15°
                </button>

                <button
                    type="button"
                    onClick={() => rotateElement(15)}
                >
                    Rotate +15°
                </button>

                <button
                    type="button"
                    className="delete-element-button"
                    onClick={handleDelete}
                >
                    Delete
                </button>
            </div>

            <p>
                Current rotation: {Math.round(selectedElement.rotation)}°
            </p>
        </div>
    );
}
