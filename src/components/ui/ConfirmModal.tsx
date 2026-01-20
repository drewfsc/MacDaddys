'use client';

import { createContext, useContext, useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmStyle?: 'danger' | 'primary';
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    resolver?.(true);
    setResolver(null);
  };

  const handleCancel = () => {
    setIsOpen(false);
    resolver?.(false);
    setResolver(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {/* Confirm Modal */}
      {isOpen && options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancel}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-modal-in">
            {/* Icon */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${
              options.confirmStyle === 'danger' ? 'bg-red-100' : 'bg-[#C41E3A]/10'
            }`}>
              {options.confirmStyle === 'danger' ? (
                <svg className="w-6 h-6 text-[#C41E3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-[#C41E3A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>

            {/* Content */}
            <h3 className="font-headline text-xl text-[#1a1a1a] text-center tracking-wider mb-2">
              {options.title}
            </h3>
            <p className="text-gray-600 text-center mb-6 whitespace-pre-line">
              {options.message}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 font-headline tracking-wider rounded-lg hover:bg-gray-50 transition-colors"
              >
                {options.cancelText || 'CANCEL'}
              </button>
              <button
                onClick={handleConfirm}
                className={`flex-1 px-4 py-2.5 font-headline tracking-wider rounded-lg transition-colors ${
                  options.confirmStyle === 'danger'
                    ? 'bg-[#C41E3A] text-white hover:bg-[#a01830]'
                    : 'bg-[#1a1a1a] text-white hover:bg-gray-800'
                }`}
              >
                {options.confirmText || 'CONFIRM'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}
