import { X } from 'lucide-react';

const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" role="presentation" onMouseDown={onClose}>
    <div className="ui-card w-full max-w-lg" role="dialog" aria-modal="true" aria-label={title} onMouseDown={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-border px-5 py-4"><h2 className="text-sm font-semibold text-ink">{title}</h2><button onClick={onClose} className="ui-focus-ring rounded p-1 text-muted hover:bg-white/[0.05] hover:text-ink" aria-label="Close"><X className="h-4 w-4" /></button></div>
      <div className="p-5">{children}</div>
    </div>
  </div>;
};

export default Modal;
