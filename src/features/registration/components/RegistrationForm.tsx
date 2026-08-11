'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, ChevronLeft, UploadCloud } from 'lucide-react';
import { formSchema, type FormData } from '../schema';
import { submitRegistrationAction } from '../actions';

const steps = [
  { id: 'murid', title: 'Data Murid' },
  { id: 'orangtua', title: 'Data Orang Tua' },
  { id: 'dokumen', title: 'Dokumen' },
  { id: 'selesai', title: 'Selesai' },
];

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
  });

  const nextStep = async () => {
    // Validasi per step sebelum lanjut
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ['namaLengkap', 'nik', 'tempatLahir', 'tanggalLahir'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['namaAyah', 'pekerjaanAyah', 'namaIbu', 'pekerjaanIbu', 'noTelp'];
    }

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const { success, error } = await submitRegistrationAction(data);

      if (!success) {
        console.error('Error submitting:', error);
        alert('Terjadi kesalahan. Cek koneksi atau konfigurasi Supabase.');
      } else {
        setSubmitSuccess(true);
        setCurrentStep(3); // Ke halaman sukses
      }
    } catch (err) {
      console.error('Exception:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
      {/* Progress Bar (Stepper) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
        <h2 className="text-2xl font-bold mb-6">Formulir Pendaftaran</h2>
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/30 -translate-y-1/2 rounded" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-white -translate-y-1/2 rounded transition-all duration-500 ease-in-out" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step, idx) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${idx <= currentStep ? 'bg-white text-blue-600 shadow-lg' : 'bg-blue-800/50 text-white/50 border border-white/20'}`}>
                {idx < currentStep ? <CheckCircle2 size={20} /> : idx + 1}
              </div>
              <span className={`text-xs font-medium hidden md:block ${idx <= currentStep ? 'text-white' : 'text-white/50'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-8 md:p-12">
        <form onSubmit={handleSubmit(onSubmit)}>
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Informasi Calon Murid</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input 
                      {...register('namaLengkap')} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Masukkan nama sesuai Akta"
                    />
                    {errors.namaLengkap && <p className="text-red-500 text-xs mt-1">{errors.namaLengkap.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">NIK (Nomor Induk Kependudukan)</label>
                    <input 
                      {...register('nik')} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="16 digit NIK"
                      maxLength={16}
                    />
                    {errors.nik && <p className="text-red-500 text-xs mt-1">{errors.nik.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tempat Lahir</label>
                    <input 
                      {...register('tempatLahir')} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Kota/Kabupaten"
                    />
                    {errors.tempatLahir && <p className="text-red-500 text-xs mt-1">{errors.tempatLahir.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Tanggal Lahir</label>
                    <input 
                      type="date"
                      {...register('tanggalLahir')} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                    {errors.tanggalLahir && <p className="text-red-500 text-xs mt-1">{errors.tanggalLahir.message}</p>}
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Asal Sekolah (TK/PAUD) - Jika Ada</label>
                    <input 
                      {...register('asalSekolah')} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="Nama TK atau Kosongkan jika tidak ada"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Data Orang Tua / Wali</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama Ayah</label>
                    <input 
                      {...register('namaAyah')} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                    {errors.namaAyah && <p className="text-red-500 text-xs mt-1">{errors.namaAyah.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pekerjaan Ayah</label>
                    <input 
                      {...register('pekerjaanAyah')} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                    {errors.pekerjaanAyah && <p className="text-red-500 text-xs mt-1">{errors.pekerjaanAyah.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Nama Ibu</label>
                    <input 
                      {...register('namaIbu')} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                    {errors.namaIbu && <p className="text-red-500 text-xs mt-1">{errors.namaIbu.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Pekerjaan Ibu</label>
                    <input 
                      {...register('pekerjaanIbu')} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                    />
                    {errors.pekerjaanIbu && <p className="text-red-500 text-xs mt-1">{errors.pekerjaanIbu.message}</p>}
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">Nomor WhatsApp Aktif</label>
                    <input 
                      {...register('noTelp')} 
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      placeholder="081234567890"
                    />
                    {errors.noTelp && <p className="text-red-500 text-xs mt-1">{errors.noTelp.message}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h3 className="text-xl font-semibold text-gray-800 mb-6">Unggah Dokumen (Opsional saat ini)</h3>
                <p className="text-gray-500 text-sm mb-6">Anda dapat melewati langkah ini dan mengunggah dokumen nanti melalui dashboard orang tua setelah akun diverifikasi.</p>
                
                <div className="border-2 border-dashed border-blue-200 rounded-2xl p-10 flex flex-col items-center justify-center text-center hover:bg-blue-50/50 transition-colors cursor-pointer group">
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={32} />
                  </div>
                  <h4 className="font-medium text-gray-800 mb-1">Klik atau seret file ke sini</h4>
                  <p className="text-xs text-gray-500">Mendukung file JPG, PNG, PDF (Maks. 5MB)</p>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={48} />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-4">Pendaftaran Berhasil!</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-8">
                  Data pendaftaran calon murid telah tersimpan di sistem. Silakan periksa WhatsApp Anda secara berkala untuk informasi jadwal observasi.
                </p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl"
                >
                  Kembali ke Beranda
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          {currentStep < 3 && (
            <div className="mt-10 flex items-center justify-between pt-6 border-t border-gray-100">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  currentStep === 0 
                  ? 'text-gray-300 cursor-not-allowed' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <ChevronLeft size={20} />
                Sebelumnya
              </button>

              {currentStep < 2 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50"
                >
                  Selanjutnya
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-full font-medium transition-all shadow-lg shadow-green-600/30 hover:shadow-green-600/50 ${
                    isSubmitting ? 'opacity-70 cursor-wait' : 'hover:bg-green-700'
                  }`}
                >
                  {isSubmitting ? 'Memproses...' : 'Kirim Pendaftaran'}
                  {!isSubmitting && <CheckCircle2 size={20} />}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
