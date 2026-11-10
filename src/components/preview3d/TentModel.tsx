
import { useEffect, useMemo, useRef } from "react";
import { useGLTF, Center } from "@react-three/drei";
import * as THREE from "three";

import { useConfiguratorStore } from "../../store/configuratorStore";

import { createGrayscaleTexture } from "../../utils/textureUtils";
import { defaultProduct } from "../../config/products";
import { useTextureGenerator } from "../../hooks/useTextureGenerator";

interface TentModelProps {
    modelPath?: string;
}

export default function TentModel({
    modelPath,
}: TentModelProps) {
    const variantId = useConfiguratorStore((state) => state.variantId);
    const selectedVariant = defaultProduct.variants.find((variant) => variant.id === variantId);
    const resolvedModelPath = modelPath ?? selectedVariant?.modelPath ?? "/models/Tent_5_5.glb";
    const { scene } = useGLTF(resolvedModelPath);

    const outerFabricColor = useConfiguratorStore(
        (state) => state.outerFabricColor
    );

    const innerFabricColor = useConfiguratorStore(
        (state) => state.innerFabricColor
    );

    const frameColor = useConfiguratorStore(
        (state) => state.frameColor
    );
    const sections = useConfiguratorStore((state) => state.sections);
    const artworkTexture = useTextureGenerator(sections, variantId);
    const modelLifecycle = useRef<{ model: THREE.Group | null; mounted: boolean }>({
        model: null,
        mounted: false,
    });

    // Clone model and create independent materials.
    const { model, artworkMaterials } = useMemo(() => {
        const clonedScene = scene.clone(true);
        const ownedArtworkMaterials = new Set<THREE.Material>();

        clonedScene.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;

            const originalMaterials = Array.isArray(object.material)
                ? object.material
                : [object.material];

            const updatedMaterials = originalMaterials.map(
                (originalMaterial) => {
                    const material = originalMaterial.clone();

                    if (
                        material instanceof THREE.MeshStandardMaterial &&
                        material.map
                    ) {
                        // Generate neutral texture
                        const grayscaleMap = createGrayscaleTexture(
                            material.map
                        );

                        material.map = grayscaleMap;
                    }

                    return material;
                }
            );

            object.material = Array.isArray(object.material)
                ? updatedMaterials
                : updatedMaterials[0];

            object.castShadow = true;
            object.receiveShadow = true;
            const materials = Array.isArray(object.material)
                ? object.material
                : [object.material];
            if (materials.some((material) => material.name === "fabric_Mat")) {
                const artworkMaterial = new THREE.MeshBasicMaterial({
                    map: artworkTexture,
                    transparent: true,
                    opacity: 1,
                    alphaTest: 0.01,
                    depthWrite: false,
                    side: THREE.DoubleSide,
                    polygonOffset: true,
                    polygonOffsetFactor: -1,
                });
                artworkMaterial.userData.isConfiguratorArtwork = true;
                ownedArtworkMaterials.add(artworkMaterial);
                const artworkOverlay = new THREE.Mesh(object.geometry, artworkMaterial);
                artworkOverlay.name = "ArtworkOverlay";
                artworkOverlay.renderOrder = 2;
                object.add(artworkOverlay);
            }
        });

        return { model: clonedScene, artworkMaterials: ownedArtworkMaterials };
    }, [scene, artworkTexture]);

    useEffect(() => {
        model.traverse((object) => {
            if (!(object instanceof THREE.Mesh)) return;

            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => {
                if (artworkMaterials.has(material)) {
                    if (material instanceof THREE.MeshBasicMaterial) {
                        material.map = artworkTexture;
                        material.needsUpdate = true;
                    }
                    return;
                }
                if (!(material instanceof THREE.MeshStandardMaterial)) return;
                if (material.name === "fabric_Mat") {
                    material.color.set(outerFabricColor);
                } else if (material.name === "Inner_fabric") {
                    material.color.set(innerFabricColor);
                } else if (material.name === "Metal_mat") {
                    material.color.set(frameColor);
                    material.metalness = 0.15;
                    material.roughness = 0.7;
                    material.envMapIntensity = 1.5;
                }
            });
        });
    }, [
        model,
        artworkMaterials,
        artworkTexture,
        outerFabricColor,
        innerFabricColor,
        frameColor,
    ]);

    useEffect(() => {
        modelLifecycle.current = { model, mounted: true };
        return () => {
            modelLifecycle.current.mounted = false;
            queueMicrotask(() => {
                if (modelLifecycle.current.model !== model || !modelLifecycle.current.mounted) {
                    model.traverse((object) => {
                        if (!(object instanceof THREE.Mesh)) return;
                        const materials = Array.isArray(object.material) ? object.material : [object.material];
                        materials.forEach((material) => {
                            if (artworkMaterials.has(material)) return;
                            material.map?.dispose();
                            material.dispose();
                        });
                    });
                    artworkMaterials.forEach((material) => material.dispose());
                    artworkMaterials.clear();
                }
            });
        };
    }, [model, artworkMaterials]);

    return (
        <Center>
            <primitive object={model} />
        </Center>
    );
}

useGLTF.preload("/models/Tent_5_5.glb");
