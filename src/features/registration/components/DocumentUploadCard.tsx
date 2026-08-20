'use client';

import React, { useState, useRef } from 'react';
import { UploadCloud, Check, X, Eye, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DocumentPreviewModal } from './DocumentPreviewModal';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export interface DocumentItem {
  id: string;
  title: string;
  desc: string;
}

export interface DocumentUploadCardProps {
  doc: DocumentItem;
  file?: File;
  previewUrl?: string;
  onSelect: (docId: string, file: File) => void;
  onRemove: (docId: string) => void;
  onError: (errorMessage: string) => void;
  isHighlightedError?: boolean;
}

export function DocumentUploadCard({
  doc,
  file,
  previewUrl,
  onSelect,
  onRemove,
  onError,
  isHighlightedError,
}: DocumentUploadCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndHandleFile = (selectedFile: File) => {
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      const ext = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!['jpg', 'jpeg', 'png', 'webp', 'pdf'].includes(ext || '')) {
        onError(`Format file "${selectedFile.name}" tidak didukung. Harap unggah berkas bertipe PDF, JPG, atau PNG.`);
        return;
      }
    }

    if (selectedFile.size > MAX_SIZE_BYTES) {
      onError(`Ukuran file "${selectedFile.name}" (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB) melebihi batas maksimal ${MAX_SIZE_MB}MB.`);
      return;
    }

    onSelect(doc.id, selectedFile);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      validateAndHandleFile(selected);
    }
    // Reset value to fix re-selection bug
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndHandleFile(droppedFile);
    }
  };

  const isPdf = file?.type === 'application/pdf' || file?.name.toLowerCase().endsWith('.pdf');

  return (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 rounded-2xl p-5 transition-all flex flex-col justify-between overflow-hidden group",
          file
            ? "border-[#00AA13] bg-[#00AA13]/5 shadow-xs"
            : isDragging
            ? "border-[#00AA13] bg-[#00AA13]/10 scale-[1.01] shadow-md"
            : isHighlightedError
            ? "border-red-400 bg-red-50/60 ring-2 ring-red-400/30"
            : "border-dashed border-gray-200 hover:border-[#00AA13]/50 hover:bg-gray-50/70"
        )}
      >
        <input
          ref={fileInputRef}
          id={`file-input-${doc.id}`}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={handleInputChange}
        />

        {file ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {previewUrl && !isPdf ? (
                  <div
                    onClick={() => setIsPreviewOpen(true)}
                    className="w-12 h-12 rounded-xl overflow-hidden border border-[#00AA13]/30 shrink-0 bg-white shadow-xs cursor-pointer hover:opacity-90 transition-opacity"
                    title="Klik untuk melihat pratinjau"
                  >
                    <img src={previewUrl} alt={doc.title} className="w-full h-full object-cover" />
                  </div>
                ) : isPdf ? (
                  <div
                    onClick={() => setIsPreviewOpen(true)}
                    className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex flex-col items-center justify-center shrink-0 border border-red-200 shadow-xs cursor-pointer hover:bg-red-100 transition-colors"
                    title="Klik untuk melihat dokumen PDF"
                  >
                    <FileText size={18} />
                    <span className="font-bold text-[9px] uppercase tracking-tighter">PDF</span>
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-[#00AA13] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Check size={22} />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-semibold text-gray-900 text-sm truncate">{doc.title}</h4>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#00AA13]/10 text-[#00AA13] shrink-0">
                      Wajib ✓
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate max-w-[200px] mt-0.5">{file.name}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-[#00AA13] hover:bg-[#00AA13]/10 transition-colors p-1 cursor-pointer"
                  title="Pratinjau Berkas"
                >
                  <Eye size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(doc.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors p-1 cursor-pointer"
                  title="Hapus Berkas"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="font-medium text-[#00AA13] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Eye size={13} /> Lihat Pratinjau
              </button>
              <label
                htmlFor={`file-input-${doc.id}`}
                className="font-medium text-gray-500 hover:text-gray-800 hover:underline cursor-pointer"
              >
                Ganti Berkas
              </label>
            </div>
          </div>
        ) : (
          <label
            htmlFor={`file-input-${doc.id}`}
            className="flex flex-col items-center justify-center text-center cursor-pointer py-4"
          >
            <div className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all shadow-xs",
              isDragging
                ? "bg-[#00AA13] text-white scale-110"
                : isHighlightedError
                ? "bg-red-100 text-red-600 animate-bounce"
                : "bg-gray-100 group-hover:bg-[#00AA13]/10 text-gray-500 group-hover:text-[#00AA13] group-hover:scale-105"
            )}>
              <UploadCloud size={24} />
            </div>
            <div className="flex items-center gap-1.5 mb-1">
              <h4 className="font-semibold text-gray-900 text-sm">{doc.title}</h4>
              <span className="text-red-500 font-bold">*</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">{doc.desc}</p>
            <span className={cn(
              "inline-flex items-center gap-1 text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all",
              isDragging
                ? "bg-[#00AA13] text-white"
                : isHighlightedError
                ? "bg-red-500 text-white shadow-sm"
                : "bg-[#00AA13]/10 text-[#00AA13] group-hover:bg-[#00AA13] group-hover:text-white"
            )}>
              Pilih Berkas / Tarik ke Sini
            </span>
          </label>
        )}
      </div>

      {/* Full Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title={doc.title}
        file={file || null}
        previewUrl={previewUrl}
      />
    </>
  );
}
