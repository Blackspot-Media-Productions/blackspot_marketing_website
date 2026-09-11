"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Props = {
  label: string;
  placeholder?: string;
  list: {
    label: string;
    value: string;
  }[];
  value: string;
  onChangeAction: (value: string) => void;
}

export function SelectInput({ label, list, value, onChangeAction, placeholder = "Select an option" }: Props) {
  const [dropdownActive, setDropdownActive] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownActive(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const Chevron = dropdownActive ? ChevronUp : ChevronDown;

  const currentValue = list.find((l) => l.value === value);

  return (
    <div ref={dropdownRef} className="custom-select-input">
      <span id="input-label">{label}</span>
      <button type="button" onClick={() => setDropdownActive((prev) => !prev)} className="input-toggler">
        <p style={{ pointerEvents: 'none' }} className={!value || !currentValue ? "input-placeholder" : ""}>{currentValue?.label || placeholder}</p>
        <span style={{ pointerEvents: 'none' }}><Chevron size={20} /></span>
      </button>

      <div className="input-dropdown-items-container" style={{ display: dropdownActive ? 'flex' : 'none' }}>
        {list.map(item => (
          <button key={item.value} className={value === item.value ? 'active' : ''} onClick={() => {
            onChangeAction(item.value);
            setDropdownActive(false);
          }}>
            <p>{item.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
