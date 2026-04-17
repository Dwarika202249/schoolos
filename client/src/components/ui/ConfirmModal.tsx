import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';
import { Button } from './Button';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to perform this action? This cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'danger',
  isLoading = false
}) => {
  const variantStyles = {
    danger: "text-red-500 bg-red-500/10 border-red-500/20",
    warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    info: "text-primary bg-primary/10 border-primary/20"
  };

  const buttonVariants = {
    danger: "bg-red-500 hover:bg-red-600 shadow-xl shadow-red-500/20",
    warning: "bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/20",
    info: "bg-primary hover:bg-primary/90 shadow-xl shadow-primary/20 text-white"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-card border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden"
          >
            {/* Header Icon */}
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6 border ${variantStyles[variant]}`}>
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="text-center space-y-3 mb-8">
              <h3 className="text-2xl font-black tracking-tight">{title}</h3>
              <p className="text-slate-400 font-medium leading-relaxed">
                {message}
              </p>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 py-6 rounded-2xl border-white/5 hover:bg-white/5 font-bold"
                disabled={isLoading}
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                isLoading={isLoading}
                className={`flex-1 py-6 rounded-2xl font-black ${buttonVariants[variant]}`}
              >
                {confirmText}
              </Button>
            </div>

            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-6 right-6 p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
