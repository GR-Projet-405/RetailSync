import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils/cn';
import { Button } from './Button';

export const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-5xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Content */}
      <div className={cn(
        "relative w-full rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all glass-panel",
        sizes[size]
      )}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <h3 className="text-lg font-semibold text-slate-100">{title}</h3>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-100">
            <X size={18} />
          </Button>
        </div>

        {/* Body */}
        <div className="text-sm text-slate-300 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
