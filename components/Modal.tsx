
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useModalBackHandler } from '../hooks/useModalBackHandler';

interface ModalProps {
  isOpen: boolean;
  onClose?: () => void;
  title: string;
  children: React.ReactNode;
  hideCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, hideCloseButton = false }) => {
  // Apply the refined back button logic
  useModalBackHandler(isOpen, onClose || (() => {}));

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Background with premium fade and blur */}
      <div className="absolute inset-0 bg-slate-900/40 premium-modal-backdrop" onClick={onClose} />
      
      {/* Pop-up area with premium spring-pop transition */}
      <div 
        className="glass-card shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] rounded-[3rem] w-full max-w-md premium-modal-content transition-all relative overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-dark-900">
          <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight uppercase leading-tight">{title}</h3>
          {!hideCloseButton && onClose && (
            <button 
                onClick={onClose} 
                className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-white p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 transition-all active:scale-90"
            >
              <X size={24} strokeWidth={2.5} />
            </button>
          )}
        </div>
        <div className="p-8 overflow-y-auto no-scrollbar bg-white dark:bg-dark-900">
          {children}
        </div>
      </div>
    </div>
  );
};
