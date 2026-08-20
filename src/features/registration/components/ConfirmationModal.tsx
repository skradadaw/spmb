'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X, Loader2, FileCheck, User, Phone, School } from 'lucide-react';
import type { FormData } from '../schema';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  uploadStatusMessage?: string;
  formData: FormData | null;
  uploadedCount: number;
  totalCount: number;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting,
  uploadStatusMessage,
  formData,
  uploadedCount,
  totalCount,
}: ConfirmationModalProps) {
  if (!isOpen || !formData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isSubmitting) onClose();
          }}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 my-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#00AA13] to-[#00880F] px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                <FileCheck size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg leading-tight">Konfirmasi Pendaftaran</h3>
                <p className="text-xs text-white/80 mt-0.5">Periksa kembali ringkasan data sebelum dikirim</p>
              </div>
            </div>
            {!isSubmitting && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* Info Alert Box */}
            <div className="p-3.5 bg-green-50 border border-green-200 rounded-2xl flex items-start gap-2.5 text-xs text-green-900 leading-relaxed">
              <CheckCircle2 size={18} className="text-[#00AA13] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">4 Dokumen Wajib Lengkap.</span> Data formulir dan berkas akan dikirim ke sistem panitia SPMB SD Plus 3 Al-Muhajirin.
              </div>
            </div>

            {/* Summary Data */}
            <div className="bg-gray-50/80 rounded-2xl p-4 border border-gray-100 space-y-3 text-xs">
              <div className="flex items-start gap-2.5 pb-2.5 border-b border-gray-200/60">
                <User size={15} className="text-[#00AA13] mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-500 text-[11px]">Identitas Murid</p>
                  <p className="font-bold text-gray-900 text-sm truncate">{formData.namaLengkap}</p>
                  <p className="text-gray-600 text-xs mt-0.5 font-medium">NISN: {formData.nisn || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pb-2.5 border-b border-gray-200/60">
                <School size={15} className="text-[#00AA13] mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-500 text-[11px]">Program & Asal Sekolah</p>
                  <p className="font-semibold text-gray-900">Kelas {formData.pilihanKelas} ({formData.jenisPendaftaran})</p>
                  <p className="text-gray-500 text-[11px] truncate">Asal: {formData.asalSekolah || '-'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pb-2.5 border-b border-gray-200/60">
                <Phone size={15} className="text-[#00AA13] mt-0.5 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-500 text-[11px]">Kontak Orang Tua / Wali</p>
                  <p className="font-semibold text-gray-900">{formData.namaAyah || formData.namaIbu}</p>
                  <p className="text-gray-500 text-[11px]">WhatsApp: {formData.teleponAyah || formData.teleponIbu || '-'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-600 font-medium text-[11px]">Status Dokumen:</span>
                <span className="inline-flex items-center gap-1 font-bold text-[#00AA13] bg-[#00AA13]/10 px-2.5 py-1 rounded-full text-[11px]">
                  <CheckCircle2 size={13} /> {uploadedCount} dari {totalCount} Dokumen Siap Upload
                </span>
              </div>
            </div>

            {/* Note */}
            <p className="text-[11px] text-gray-500 text-center px-2">
              Dengan mengklik tombol kirim, Anda menyatakan bahwa seluruh data yang diisi adalah benar dan dapat dipertanggungjawabkan.
            </p>
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-100 rounded-full border border-gray-200 transition-all cursor-pointer disabled:opacity-50"
            >
              Periksa Kembali
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onConfirm}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 sm:px-7 py-2.5 sm:py-3 bg-[#00AA13] hover:bg-[#00880F] active:scale-95 text-white rounded-full text-xs sm:text-sm font-bold transition-all shadow-md shadow-[#00AA13]/30 cursor-pointer disabled:opacity-80 disabled:cursor-wait"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>{uploadStatusMessage || 'Mengunggah Data...'}</span>
                </>
              ) : (
                <>
                  <span>Ya, Kirim Pendaftaran</span>
                  <CheckCircle2 size={16} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
