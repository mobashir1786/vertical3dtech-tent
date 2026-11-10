import type { DesignSection } from "../../types/configurator";

const options: { value: DesignSection; label: string }[] = [
  { value: "roof", label: "Roof" },
  { value: "front", label: "Front" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
];

interface Props {
  value: DesignSection;
  onChange: (section: DesignSection) => void;
}

export default function SectionSelector({ value, onChange }: Props) {
  return (
    <div className="section-selector" role="group" aria-label="Tent design section">
      {options.map((option) => (
        <button
          type="button"
          key={option.value}
          className={value === option.value ? "section-button active" : "section-button"}
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
