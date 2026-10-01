import React, { useId } from "react";
import { Eye, EyeOff } from "lucide-react";
import { fieldCls, labelCls } from "../utils/Fieldstyles";

interface FloatingInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  /** Keep the label lifted (needed for type="date" / "time", which are never empty-looking). */
  alwaysFloat?: boolean;
  /** Something to show inside the right edge, e.g. a password toggle. */
  trailing?: React.ReactNode;
  /** Helper or error text under the field. */
  hint?: string;
  error?: boolean;
}

const FloatingInput: React.FC<FloatingInputProps> = ({
  label,
  alwaysFloat = false,
  trailing,
  hint,
  error = false,
  id,
  className = "",
  placeholder = " ", // a placeholder must exist for :placeholder-shown to work
  ...rest
}) => {
  const auto = useId();
  const inputId = id ?? auto;
  const hintId = `${inputId}-hint`;

  return (
    <div>
      <div className="relative">
        <input
          {...rest}
          id={inputId}
          placeholder={placeholder}
          aria-invalid={error || undefined}
          aria-describedby={hint ? hintId : undefined}
          className={`${fieldCls(error)} ${trailing ? "pr-12" : ""} ${className}`}
        />
        <label htmlFor={inputId} className={labelCls(alwaysFloat)}>
          {label}
        </label>
        {trailing && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            {trailing}
          </div>
        )}
      </div>
      {hint && (
        <p
          id={hintId}
          className={`mt-1 text-xs ${error ? "text-rose-300" : "text-gray-500"}`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export const VisibilityToggle: React.FC<{
  shown: boolean;
  onToggle: () => void;
}> = ({ shown, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-label={shown ? "Hide password" : "Show password"}
    aria-pressed={shown}
    className="rounded-md p-2 text-gray-400 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
  >
    {shown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
  </button>
);

export default FloatingInput;
