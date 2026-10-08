const tones = {
  neutral: 'border-border bg-white/[0.04] text-muted',
  coral: 'border-match/30 bg-match/10 text-match',
  success: 'border-success/30 bg-success/10 text-success',
  warning: 'border-warning/30 bg-warning/10 text-warning',
  error: 'border-error/30 bg-error/10 text-error'
};

const Badge = ({ tone = 'neutral', className = '', children }) => (
  <span className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-medium ${tones[tone]} ${className}`}>
    {children}
  </span>
);

export default Badge;
