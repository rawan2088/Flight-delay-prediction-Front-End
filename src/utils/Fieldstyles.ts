// Shared class strings for floating-label fields.
// Kept in a .ts file (not next to the components) so React Fast Refresh keeps working.

/** The input box. `peer` lets the sibling <label> react to the input's state. */
export const fieldCls = (error = false) =>
  [
    "peer h-14 w-full rounded-lg border bg-slate-900 px-4 pt-5 text-white",
    "transition-colors focus:outline-none",
    // the real placeholder only appears once the label has floated out of the way
    "placeholder:text-transparent focus:placeholder:text-slate-500",
    error ? "border-rose-500" : "border-slate-700 focus:border-blue-500",
  ].join(" ");

/**
 * The label sits inside the input at rest, then shrinks and lifts when the
 * field is focused, filled, or autofilled. `float` pins it up for inputs that
 * always show something (date, time).
 */
export const labelCls = (float = false) =>
  [
    "pointer-events-none absolute left-4 top-4 origin-left whitespace-nowrap",
    "text-gray-400 transition-all duration-200",
    "peer-focus:-translate-y-3.5 peer-focus:scale-75 peer-focus:text-blue-400",
    "peer-[:not(:placeholder-shown)]:-translate-y-3.5 peer-[:not(:placeholder-shown)]:scale-75",
    "peer-autofill:-translate-y-3.5 peer-autofill:scale-75",
    float ? "-translate-y-3.5 scale-75" : "",
  ].join(" ");
