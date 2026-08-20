# Document Upload Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a robust, interactive, and mandatory 4-document upload system for the SPMB registration form with drag-and-drop, full image/PDF preview modals, strict file validation, and direct-to-Supabase-storage uploading.

**Architecture:** Split the upload UI into two modular components: `DocumentPreviewModal.tsx` (for full-screen preview of images and PDFs) and `DocumentUploadCard.tsx` (for handling drag-and-drop, validation, thumbnails, and state per document). Integrate these into `RegistrationForm.tsx` with a completeness counter and mandatory 4-document validation before triggering `uploadRegistrationDocuments`.

**Tech Stack:** Next.js (App Router), React 19, Tailwind CSS, Lucide React, Framer Motion, Supabase Storage & Database, TypeScript.

## Global Constraints
- Supported MIME types: `image/jpeg`, `image/png`, `image/webp`, `application/pdf`.
- Max file size: 5MB per file (`5 * 1024 * 1024` bytes).
- All 4 documents (`aktaKelahiran`, `kartuKeluarga`, `pasFoto`, `buktiPembayaran`) are mandatory.
- Theme accent color: `#00AA13` (brand green).

---

### Task 1: Create `DocumentPreviewModal` Component

**Files:**
- Create: `src/features/registration/components/DocumentPreviewModal.tsx`

**Interfaces:**
- Produces:
  ```typescript
  export interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    file: File | null;
    previewUrl?: string | null;
  }
  export function DocumentPreviewModal(props: DocumentPreviewModalProps): React.JSX.Element | null;
  ```

- [ ] **Step 1: Write `DocumentPreviewModal.tsx`**

```tsx
'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, ExternalLink } from 'lucide-react';

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
                className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-xl transition-colors"
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
                <img
                  src={previewUrl}
                  alt={title}
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
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition-colors"
            >
              Tutup Pratinjau
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Run typecheck to verify `DocumentPreviewModal.tsx`**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

---

### Task 2: Create `DocumentUploadCard` Component

**Files:**
- Create: `src/features/registration/components/DocumentUploadCard.tsx`

**Interfaces:**
- Consumes:
  - `DocumentPreviewModal`
- Produces:
  ```typescript
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
  export function DocumentUploadCard(props: DocumentUploadCardProps): React.JSX.Element;
  ```

- [ ] **Step 1: Write `DocumentUploadCard.tsx`**

```tsx
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
    // Fix re-selection bug by resetting input value
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
            ? "border-red-400 bg-red-50/50 animate-pulse"
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
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-500 hover:text-[#00AA13] hover:bg-[#00AA13]/10 transition-colors p-1"
                  title="Pratinjau Berkas"
                >
                  <Eye size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => onRemove(doc.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors p-1"
                  title="Hapus Berkas"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-xs">
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
```

- [ ] **Step 2: Run typecheck to verify `DocumentUploadCard.tsx`**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

---

### Task 3: Integrate Document Upload Components & Mandatory Validation into `RegistrationForm.tsx`

**Files:**
- Modify: `src/features/registration/components/RegistrationForm.tsx`

**Requirements:**
- Import `DocumentUploadCard` and `DOCUMENTS`.
- Add `missingDocErrors` tracking to highlight missing mandatory files if user attempts to submit without completing all 4.
- In Step 3 UI, render progress indicator (`X dari 4 Dokumen Wajib Terunggah`).
- Validate that `Object.keys(uploadedFiles).length === DOCUMENTS.length` before uploading/submitting.
- Display clear error alert if any document is missing.

- [ ] **Step 1: Update `RegistrationForm.tsx`**

- [ ] **Step 2: Run typecheck to verify full registration form**

Run: `npx tsc --noEmit`
Expected: PASS with 0 errors

---

### Task 4: End-to-End Verification

- [ ] **Step 1: Check build and typecheck**
Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 2: Manual walkthrough testing**
Verify in development browser:
1. Open Step 3: Verify all 4 document cards appear with Drag & Drop styling.
2. Select an image: Verify thumbnail, size, "Lihat Pratinjau" opens modal with full image.
3. Select a PDF: Verify PDF badge, size, modal preview renders PDF iframe.
4. Delete and re-select the exact same file: Verify `onChange` triggers smoothly.
5. Attempt submit with 3/4 documents: Verify error alert and missing card is highlighted.
6. Upload all 4 documents and submit: Verify direct upload to Supabase Storage and transition to Success page.
