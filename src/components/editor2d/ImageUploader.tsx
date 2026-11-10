
import { useRef } from "react";

import { useConfiguratorStore } from "../../store/configuratorStore";

export default function ImageUploader() {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const addElement = useConfiguratorStore(
        (state) => state.addElement
    );

    const handleImageUpload = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];

        if (!file) return;

        // Allow only PNG, JPG and WebP images.
        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/webp",
        ];

        if (!allowedTypes.includes(file.type)) {
            alert("Please upload a PNG, JPG or WebP image.");
            event.target.value = "";
            return;
        }

        // Maximum upload size: 5 MB.
        if (file.size > 5 * 1024 * 1024) {
            alert("Image size should not exceed 5 MB.");
            event.target.value = "";
            return;
        }

        const image = new Image();
        image.onload = () => {
            const maxWidth = 220;
            const maxHeight = 180;

            const scale = Math.min(
                maxWidth / image.width,
                maxHeight / image.height,
                1
            );

            addElement({
                id: crypto.randomUUID(),
                type: "image",
                src: image.src,
                x: 150,
                y: 150,
                width: image.width * scale,
                height: image.height * scale,
                rotation: 0,
            });

            event.target.value = "";
        };

        image.onerror = () => {
            alert("Unable to load the selected image.");
            event.target.value = "";
        };

        const reader = new FileReader();
        reader.onerror = () => {
            alert("Unable to read the selected image.");
            event.target.value = "";
        };
        reader.onload = () => {
            if (typeof reader.result !== "string") {
                alert("Unable to read the selected image.");
                event.target.value = "";
                return;
            }
            image.src = reader.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="image-uploader">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                hidden
                onChange={handleImageUpload}
            />

            <button
                type="button"
                className="upload-button"
                onClick={() => fileInputRef.current?.click()}
            >
                <span>＋</span>
                Upload Company Logo
            </button>

            <p>PNG, JPG or WebP · Maximum 5 MB</p>
        </div>
    );
}
