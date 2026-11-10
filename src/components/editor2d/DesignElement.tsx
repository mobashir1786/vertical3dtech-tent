
import { useEffect, useRef } from "react";
import { Image as KonvaImage, Text, Transformer } from "react-konva";
import useImage from "use-image";
import Konva from "konva";

import type {
    DesignElement as DesignElementType,
    ImageDesignElement,
    TextDesignElement,
} from "../../types/configurator";

interface DesignElementProps {
    element: DesignElementType;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onChange: (
        id: string,
        updates: Partial<DesignElementType>
    ) => void;
}

function TextElement({
    element,
    isSelected,
    onSelect,
    onChange,
}: {
    element: TextDesignElement;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onChange: (
        id: string,
        updates: Partial<DesignElementType>
    ) => void;
}) {
    const shapeRef = useRef<Konva.Text>(null);
    const transformerRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
        if (isSelected && shapeRef.current && transformerRef.current) {
            transformerRef.current.nodes([shapeRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    const handleTransformEnd = () => {
        const node = shapeRef.current;

        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        onChange(element.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(40, node.width() * scaleX),
            height: Math.max(30, node.height() * scaleY),
            rotation: node.rotation(),
        });
    };

    return (
        <>
            <Text
                ref={shapeRef}
                text={element.text}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                fontSize={element.fontSize}
                fontFamily={element.fontFamily}
                fill={element.fill}
                rotation={element.rotation}
                draggable
                onClick={() => onSelect(element.id)}
                onTap={() => onSelect(element.id)}
                onDragStart={() => onSelect(element.id)}
                onDragEnd={(event) => {
                    onChange(element.id, {
                        x: event.target.x(),
                        y: event.target.y(),
                    });
                }}
                onTransformEnd={handleTransformEnd}
            />

            {isSelected && (
                <Transformer
                    ref={transformerRef}
                    rotateEnabled
                    keepRatio={false}
                    flipEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 40 || newBox.height < 30) {
                            return oldBox;
                        }

                        return newBox;
                    }}
                />
            )}
        </>
    );
}

function ImageElement({
    element,
    isSelected,
    onSelect,
    onChange,
}: {
    element: ImageDesignElement;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onChange: (
        id: string,
        updates: Partial<DesignElementType>
    ) => void;
}) {
    const [image] = useImage(element.src, "anonymous");

    const shapeRef = useRef<Konva.Image>(null);
    const transformerRef = useRef<Konva.Transformer>(null);

    useEffect(() => {
        if (isSelected && shapeRef.current && transformerRef.current) {
            transformerRef.current.nodes([shapeRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected, image]);

    const handleTransformEnd = () => {
        const node = shapeRef.current;

        if (!node) return;

        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        onChange(element.id, {
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * scaleX),
            height: Math.max(20, node.height() * scaleY),
            rotation: node.rotation(),
        });
    };

    return (
        <>
            <KonvaImage
                ref={shapeRef}
                image={image}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                rotation={element.rotation}
                draggable
                onClick={() => onSelect(element.id)}
                onTap={() => onSelect(element.id)}
                onDragStart={() => onSelect(element.id)}
                onDragEnd={(event) => {
                    onChange(element.id, {
                        x: event.target.x(),
                        y: event.target.y(),
                    });
                }}
                onTransformEnd={handleTransformEnd}
            />

            {isSelected && image && (
                <Transformer
                    ref={transformerRef}
                    rotateEnabled
                    keepRatio
                    flipEnabled={false}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 20 || newBox.height < 20) {
                            return oldBox;
                        }

                        return newBox;
                    }}
                />
            )}
        </>
    );
}

export default function DesignElement({
    element,
    isSelected,
    onSelect,
    onChange,
}: DesignElementProps) {
    if (element.type === "text") {
        return (
            <TextElement
                element={element}
                isSelected={isSelected}
                onSelect={onSelect}
                onChange={onChange}
            />
        );
    }

    return (
        <ImageElement
            element={element}
            isSelected={isSelected}
            onSelect={onSelect}
            onChange={onChange}
        />
    );
}
