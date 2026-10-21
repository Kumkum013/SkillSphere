import { forwardRef } from 'react';

const variants = {
  primary: 'bg-[#f87171] text-[#111827] border-transparent shadow-[0_10px_24px_rgba(248,113,113,0.26)] hover:bg-[#fb7185]',
  secondary: 'bg-slate-800 text-slate-100 border border-slate-700 hover:border-slate-500 hover:bg-slate-700',
  ghost: 'bg-transparent text-slate-300 border-transparent hover:bg-slate-800/80 hover:text-white',
  danger: 'bg-red-500/10 text-red-300 border border-red-400/30 hover:bg-red-500/15'
};

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm'
};

const Button = forwardRef(({ variant = 'primary', size = 'md', loading = false, className = '', children, ...props }, ref) => (
  <button
    ref={ref}
    className={`ui-control ui-focus-ring inline-flex items-center justify-center gap-2 border font-medium ${variants[variant]} ${sizes[size]} ${loading ? 'pointer-events-none opacity-60' : ''} ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent" aria-hidden="true" />}
    {children}
  </button>
));

Button.displayName = 'Button';
export default Button;
