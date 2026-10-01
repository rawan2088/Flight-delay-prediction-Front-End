import React, { useState, useRef, useEffect, useMemo, useId } from "react";
import { fieldCls, labelCls } from "../utils/Fieldstyles";

interface Option {
  code: string;
  label: string;
}

interface AutocompleteInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (code: string) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
}

const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "",
  required = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  // Compute display value from the code value
  const displayValue = useMemo(() => {
    if (value) {
      const option = options.find((opt) => opt.code === value);
      return option ? option.label : "";
    }
    return "";
  }, [value, options]);

  // derive what should be shown in the input (no setState in effects)
  const renderedInputValue = showSuggestions ? inputValue : displayValue;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute suggestions (derived via useMemo)
  const suggestions = useMemo(() => {
    if (!showSuggestions) return [];
    const q = inputValue.trim().toLowerCase();
    if (!q) {
      return options.slice(0, 10);
    }
    return options
      .filter(
        (option) =>
          option.label.toLowerCase().includes(q) ||
          option.code.toLowerCase().includes(q),
      )
      .slice(0, 10);
  }, [inputValue, options, showSuggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowSuggestions(true);
    setActiveIndex(-1);

    // Clear the selected code if user starts typing again
    if (value) {
      onChange("");
    }
  };

  const handleSuggestionClick = (option: Option) => {
    setInputValue(option.label);
    onChange(option.code);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === "ArrowDown") {
        setShowSuggestions(true);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        handleSuggestionClick(suggestions[activeIndex]);
      } else if (suggestions.length === 1) {
        handleSuggestionClick(suggestions[0]);
      } else {
        setShowSuggestions(false);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const showBadge = !!value && !showSuggestions;

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          id={inputId}
          type="text"
          name={name}
          value={renderedInputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setShowSuggestions(true);
            setActiveIndex(-1);
          }}
          onKeyDown={handleKeyDown}
          className={`${fieldCls()} ${showBadge ? "pr-16" : ""}`}
          placeholder={placeholder || " "}
          required={required}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-haspopup="listbox"
        />
        <label htmlFor={inputId} className={labelCls()}>
          {label}
        </label>

        {/* The chosen code lives inside the field instead of on its own line */}
        {showBadge && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white">
            {value}
          </span>
        )}
      </div>

      {/* Hidden input to store the actual code (include name so native forms pick it up) */}
      <input type="hidden" name={name} value={value} />

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          role="listbox"
          aria-label={`${label} suggestions`}
          className="absolute left-0 top-full z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-slate-700 bg-slate-800 shadow-lg scrollbar-custom sm:max-h-60 md:max-h-80"
        >
          {suggestions.map((option, idx) => (
            <div
              key={option.code}
              role="option"
              aria-selected={idx === activeIndex}
              onMouseDown={(e) => {
                // use onMouseDown to prevent input blur before click
                e.preventDefault();
                handleSuggestionClick(option);
              }}
              className={`cursor-pointer border-b border-slate-700 px-3 py-2 transition-colors last:border-b-0 hover:bg-slate-700/60 sm:px-4 sm:py-3 ${
                idx === activeIndex ? "bg-slate-700" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-white sm:text-sm">
                    {option.label}
                  </div>
                </div>
                <div className="flex-shrink-0 rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white">
                  {option.code}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showSuggestions && inputValue && suggestions.length === 0 && (
        <div className="absolute left-0 top-full z-20 mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 p-3 shadow-lg sm:p-4">
          <p className="text-xs text-gray-400 sm:text-sm">
            No matches found for "{inputValue}"
          </p>
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
