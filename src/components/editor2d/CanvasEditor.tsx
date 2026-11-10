
import { useRef } from "react";
import {
    Stage,
    Layer,
    Rect,
    Group,
} from "react-konva";

import DesignElement from "./DesignElement";

import { useConfiguratorStore } from "../../store/configuratorStore";

import type { DesignSection } from "../../types/configurator";

import type Konva from "konva";

const CANVAS_WIDTH = 700;
const CANVAS_HEIGHT = 500;

const sections: {
    label: string;
    value: DesignSection;
}[] = [
        { label: "Roof", value: "roof" },
        { label: "Front", value: "front" },
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
    ];

export default function CanvasEditor() {
    const stageRef = useRef<Konva.Stage>(null);

    const {
        activeSection,
        sections: sectionDesigns,
        selectedElementId,
        setActiveSection,
        selectElement,
        updateElement,
    } = useConfiguratorStore();

    const currentElements = sectionDesigns[activeSection];

    const handleStageMouseDown = (
        event: Konva.KonvaEventObject<MouseEvent>
    ) => {
        const clickedOnEmpty =
            event.target === event.target.getStage() ||
            event.target.name() === "panel-background";

        if (clickedOnEmpty) {
            selectElement(null);
        }
    };

    return (
        <div className="canvas-editor">

            {/* Editor Header */}
            <div className="editor-header">
                <div>
                    <h3>2D Design Editor</h3>
                    <p>Customize your tent branding</p>
                </div>

                <span className="editor-status">
                    Live Editing
                </span>
            </div>

            {/* Section Selector */}
            <div className="section-selector">
                {sections.map((section) => (
                    <button
                        key={section.value}
                        type="button"
                        className={
                            activeSection === section.value
                                ? "section-button active"
                                : "section-button"
                        }
                        onClick={() => setActiveSection(section.value)}
                    >
                        {section.label}
                    </button>
                ))}
            </div>

            {/* Canvas Workspace */}
            <div className="canvas-workspace">

                <Stage
                    ref={stageRef}
                    width={CANVAS_WIDTH}
                    height={CANVAS_HEIGHT}
                    onMouseDown={handleStageMouseDown}
                    onTouchStart={(event) => {
                        const target = event.target;

                        if (
                            target === target.getStage() ||
                            target.name() === "panel-background"
                        ) {
                            selectElement(null);
                        }
                    }}
                >
                    <Layer>
                        {/* Workspace Background */}
                        <Rect
                            x={0}
                            y={0}
                            width={CANVAS_WIDTH}
                            height={CANVAS_HEIGHT}
                            fill="#e9edf2"
                        />

                        {/* Tent Design Panel */}
                        <Group>
                            <Rect
                                name="panel-background"
                                x={50}
                                y={50}
                                width={600}
                                height={400}
                                fill="#ffffff"
                                stroke="#d1d5db"
                                strokeWidth={1}
                                shadowColor="#000000"
                                shadowBlur={8}
                                shadowOpacity={0.08}
                            />

                            {/* Design Elements */}
                            {currentElements.map((element) => (
                                <DesignElement
                                    key={element.id}
                                    element={element}
                                    isSelected={
                                        selectedElementId === element.id
                                    }
                                    onSelect={selectElement}
                                    onChange={updateElement}
                                />
                            ))}
                        </Group>
                    </Layer>
                </Stage>

            </div>

            {/* Editor Footer */}
            <div className="editor-footer">
                <span>
                    Section: {activeSection.toUpperCase()}
                </span>

                <span>
                    {currentElements.length} design elements
                </span>
            </div>

        </div>
    );
}
