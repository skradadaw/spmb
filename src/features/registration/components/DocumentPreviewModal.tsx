'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download } from 'lucide-react';

export interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  file: File | null;
  previewUrl?: string | null;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  title,
  file,
  previewUrl,
}: DocumentPreviewModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00AA13]/10 text-[#00AA13] flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900 leading-tight">{title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {file.name} • {fileSizeMB} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {previewUrl && (
                <a
                  href={previewUrl}
                  download={file.name}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200/60 rounded-xl transition-colors"
                  title="Unduh Berkas"
                >
                  <Download size={18} />
                </a>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors cursor-pointer"
                title="Tutup"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-gray-900/5 min-h-[300px]">
            {isPdf && previewUrl ? (
              <iframe
                src={previewUrl}
                title={title}
                className="w-full h-[65vh] rounded-2xl border border-gray-200 bg-white shadow-inner"
              />
            ) : previewUrl ? (
              <div className="max-h-[65vh] overflow-auto flex items-center justify-center">
                <Image
                  src={previewUrl}
                  alt={title}
                  width={1200}
                  height={900}
                  unoptimized
                  className="max-w-full max-h-[65vh] object-contain rounded-2xl shadow-md border border-gray-100"
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400">
                <FileText size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">Pratinjau tidak tersedia untuk format ini.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-100 bg-white flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors cursor-pointer"
            >
              Tutup Pratinjau
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
