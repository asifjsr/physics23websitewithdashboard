import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './GlassCard';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'danger'
}: ConfirmModalProps) {
  
  React.useEffect(() => {
    if (isOpen) {
      console.log("Delete modal opened");
    }
  }, [isOpen]);

  const handleConfirm = () => {
    console.log("Delete confirmed");
    onConfirm();
  };

  const handleCancel = () => {
    console.log("Delete cancelled");
    onCancel();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-sm"
          >
            <GlassCard className="p-8 border-none bg-slate-900 shadow-2xl relative overflow-hidden">
              {/* Refined background accent */}
              <div className={`absolute -top-12 -right-12 w-24 h-24 blur-3xl rounded-full ${
                variant === 'danger' ? 'bg-rose-500/20' : 'bg-indigo-500/20'
              }`} />

              <div className="flex flex-col items-center text-center space-y-6">
                <div className={`w-16 h-16 rounded-3xl flex items-center justify-center ${
                  variant === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-indigo-500/10 text-indigo-500'
                }`}>
                  <AlertCircle size={32} />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
                </div>

                <div className="flex gap-3 w-full pt-2">
                  <button
                    onClick={handleCancel}
                    className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 rounded-2xl font-bold text-slate-300 transition-all border border-white/5"
                  >
                    {cancelText}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className={`flex-1 py-4 px-6 rounded-2xl font-black text-white shadow-lg transition-all ${
                      variant === 'danger' 
                        ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20' 
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
                    }`}
                  >
                    {confirmText}
                  </button>
                </div>
              </div>

              <button 
                onClick={handleCancel}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-white/5 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
