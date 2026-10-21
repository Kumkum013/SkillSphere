import { forwardRef } from 'react';

const Input = forwardRef(({ label, hint, error, className = '', id, ...props }, ref) => {
  const inputId = id || props.name;
  return (
    <label className="block space-y-2" htmlFor={inputId}>
      {label && <span className="block text-xs font-medium text-slate-300">{label}</span>}
      <input
        ref={ref}
        id={inputId}
        className={`ui-control ui-focus-ring h-11 w-full border border-slate-300 bg-slate-50 px-3 text-sm text-slate-900 placeholder:text-slate-500 focus:border-[#f87171] focus:bg-white ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {(hint || error) && <span className={`block text-xs ${error ? 'text-red-300' : 'text-slate-400'}`}>{error || hint}</span>}
    </label>
  );
});

Input.displayName = 'Input';
export default Input;
