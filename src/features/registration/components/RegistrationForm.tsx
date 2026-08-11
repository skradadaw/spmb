'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, ChevronLeft, UploadCloud, Loader2 } from 'lucide-react';
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
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onTouched',
  });

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) {
      fieldsToValidate = ['jenisPendaftaran', 'pilihanKelas', 'namaLengkap', 'jenisKelamin', 'tempatLahir', 'tanggalLahir', 'nik', 'asalSekolah', 'alamatRumah'];
    } else if (currentStep === 1) {
      fieldsToValidate = ['namaAyah', 'pekerjaanAyah', 'teleponAyah', 'namaIbu', 'pekerjaanIbu', 'teleponIbu'];
    }

    const isStepValid = await trigger(fieldsToValidate as any);
    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      const { success, error } = await submitRegistrationAction(data);

      if (!success) {
        console.error('Error submitting:', error);
        setSubmitError('Terjadi kesalahan saat menghubungi server. Pastikan koneksi internet stabil dan coba lagi.');
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

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 focus:border-[#00AA13] focus:ring-2 focus:ring-[#00AA13]/20 outline-none transition-all";

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
      {/* Progress Bar (Stepper) */}
      <div className="bg-[#00AA13] px-8 py-6 text-white">
        <h2 className="text-2xl font-bold mb-6">Formulir Pendaftaran</h2>
        <div className="flex justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-white/30 -translate-y-1/2 rounded" />
          <div 
            className="absolute top-1/2 left-0 h-1 bg-white -translate-y-1/2 rounded transition-all duration-500 ease-in-out" 
            style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
          />
          {steps.map((step, idx) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${idx <= currentStep ? 'bg-white text-[#00AA13] shadow-lg' : 'bg-white/20 text-white/70 border border-white/30'}`}>
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
        {submitError && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium flex items-start gap-3"
          >
            <div className="mt-0.5 font-bold">!</div>
            <div>{submitError}</div>
          </motion.div>
        )}
        
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
                  {/* Row 1 */}
                  <div className="space-y-2">
                    <label htmlFor="jenisPendaftaran" className="text-sm font-medium text-gray-700">Jenis Pendaftaran *</label>
                    <select id="jenisPendaftaran" {...register('jenisPendaftaran')} className={inputClass}>
                      <option value="">Pilih Jenis Pendaftaran</option>
                      <option value="Siswa Baru">Siswa Baru</option>
                      <option value="Pindahan">Pindahan</option>
                    </select>
                    {errors.jenisPendaftaran && <p className="text-red-500 text-xs mt-1">{errors.jenisPendaftaran.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="pilihanKelas" className="text-sm font-medium text-gray-700">Pilihan Kelas *</label>
                    <select id="pilihanKelas" {...register('pilihanKelas')} className={inputClass}>
                      <option value="">Pilih Kelas</option>
                      <option value="Reguler">Reguler</option>
                      <option value="Bilingual">Bilingual</option>
                      <option value="Tahfizh">Tahfizh</option>
                    </select>
                    {errors.pilihanKelas && <p className="text-red-500 text-xs mt-1">{errors.pilihanKelas.message}</p>}
                  </div>

                  {/* Row 2 */}
                  <div className="space-y-2">
                    <label htmlFor="namaLengkap" className="text-sm font-medium text-gray-700">Nama Lengkap *</label>
                    <input id="namaLengkap" {...register('namaLengkap')} className={inputClass} placeholder="Nama sesuai Akta Kelahiran" />
                    {errors.namaLengkap && <p className="text-red-500 text-xs mt-1">{errors.namaLengkap.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="jenisKelamin" className="text-sm font-medium text-gray-700">Jenis Kelamin *</label>
                    <select id="jenisKelamin" {...register('jenisKelamin')} className={inputClass}>
                      <option value="">Pilih Jenis Kelamin</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                    {errors.jenisKelamin && <p className="text-red-500 text-xs mt-1">{errors.jenisKelamin.message}</p>}
                  </div>

                  {/* Row 3 */}
                  <div className="space-y-2">
                    <label htmlFor="tempatLahir" className="text-sm font-medium text-gray-700">Tempat Lahir *</label>
                    <input id="tempatLahir" {...register('tempatLahir')} className={inputClass} placeholder="Kota/Kabupaten" />
                    {errors.tempatLahir && <p className="text-red-500 text-xs mt-1">{errors.tempatLahir.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="tanggalLahir" className="text-sm font-medium text-gray-700">Tanggal Lahir *</label>
                    <input id="tanggalLahir" type="date" {...register('tanggalLahir')} className={inputClass} />
                    {errors.tanggalLahir && <p className="text-red-500 text-xs mt-1">{errors.tanggalLahir.message}</p>}
                  </div>

                  {/* Row 4 */}
                  <div className="space-y-2">
                    <label htmlFor="nik" className="text-sm font-medium text-gray-700">NIK (16 Digit) *</label>
                    <input id="nik" {...register('nik')} className={inputClass} placeholder="16 Digit NIK" maxLength={16} />
                    {errors.nik && <p className="text-red-500 text-xs mt-1">{errors.nik.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="nisn" className="text-sm font-medium text-gray-700">NISN (Jika Ada)</label>
                    <input id="nisn" {...register('nisn')} className={inputClass} placeholder="Nomor Induk Siswa Nasional" />
                  </div>

                  {/* Row 5 */}
                  <div className="space-y-2">
                    <label htmlFor="anakKe" className="text-sm font-medium text-gray-700">Anak Ke-</label>
                    <input id="anakKe" type="number" {...register('anakKe')} className={inputClass} placeholder="Contoh: 1" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="saudaraDiMuhajirin" className="text-sm font-medium text-gray-700">Saudara di Al-Muhajirin</label>
                    <input id="saudaraDiMuhajirin" {...register('saudaraDiMuhajirin')} className={inputClass} placeholder="Nama saudara (jika ada)" />
                  </div>

                  {/* Row 6 */}
                  <div className="space-y-2">
                    <label htmlFor="asalSekolah" className="text-sm font-medium text-gray-700">Asal Sekolah (TK/PAUD) *</label>
                    <input id="asalSekolah" {...register('asalSekolah')} className={inputClass} placeholder="Nama TK/PAUD" />
                    {errors.asalSekolah && <p className="text-red-500 text-xs mt-1">{errors.asalSekolah.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="jarakKeSekolah" className="text-sm font-medium text-gray-700">Jarak ke Sekolah (KM)</label>
                    <input id="jarakKeSekolah" type="number" {...register('jarakKeSekolah')} className={inputClass} placeholder="Contoh: 5" />
                  </div>

                  {/* Row 7 */}
                  <div className="space-y-2 md:col-span-2">
                    <label htmlFor="alamatRumah" className="text-sm font-medium text-gray-700">Alamat Lengkap Rumah *</label>
                    <textarea id="alamatRumah" rows={3} {...register('alamatRumah')} className={inputClass} placeholder="Alamat lengkap sesuai domisili" />
                    {errors.alamatRumah && <p className="text-red-500 text-xs mt-1">{errors.alamatRumah.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="prestasiAnak" className="text-sm font-medium text-gray-700">Prestasi Anak (Opsional)</label>
                    <input id="prestasiAnak" {...register('prestasiAnak')} className={inputClass} placeholder="Misal: Juara 1 Lomba Mewarnai" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="tingkatPrestasi" className="text-sm font-medium text-gray-700">Tingkat Prestasi</label>
                    <select id="tingkatPrestasi" {...register('tingkatPrestasi')} className={inputClass}>
                      <option value="">Pilih Tingkat</option>
                      <option value="Sekolah">Sekolah</option>
                      <option value="Kecamatan">Kecamatan</option>
                      <option value="Kabupaten/Kota">Kabupaten/Kota</option>
                      <option value="Provinsi">Provinsi</option>
                      <option value="Nasional">Nasional</option>
                    </select>
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
                
                <div className="space-y-8">
                  {/* Ayah Section */}
                  <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <h4 className="font-semibold text-[#00AA13] mb-4 flex items-center gap-2">Data Ayah</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="namaAyah" className="text-sm font-medium text-gray-700">Nama Ayah *</label>
                        <input id="namaAyah" {...register('namaAyah')} className={inputClass} />
                        {errors.namaAyah && <p className="text-red-500 text-xs mt-1">{errors.namaAyah.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="nikAyah" className="text-sm font-medium text-gray-700">NIK Ayah</label>
                        <input id="nikAyah" {...register('nikAyah')} className={inputClass} maxLength={16} />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="tahunLahirAyah" className="text-sm font-medium text-gray-700">Tahun Lahir Ayah</label>
                        <input id="tahunLahirAyah" type="number" {...register('tahunLahirAyah')} className={inputClass} placeholder="YYYY" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="pendidikanAyah" className="text-sm font-medium text-gray-700">Pendidikan Ayah</label>
                        <select id="pendidikanAyah" {...register('pendidikanAyah')} className={inputClass}>
                          <option value="">Pilih Pendidikan</option>
                          <option value="SD">SD Sederajat</option>
                          <option value="SMP">SMP Sederajat</option>
                          <option value="SMA">SMA Sederajat</option>
                          <option value="D1-D3">D1 - D3</option>
                          <option value="S1">S1</option>
                          <option value="S2">S2</option>
                          <option value="S3">S3</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="pekerjaanAyah" className="text-sm font-medium text-gray-700">Pekerjaan Ayah *</label>
                        <input id="pekerjaanAyah" {...register('pekerjaanAyah')} className={inputClass} />
                        {errors.pekerjaanAyah && <p className="text-red-500 text-xs mt-1">{errors.pekerjaanAyah.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="penghasilanAyah" className="text-sm font-medium text-gray-700">Penghasilan Per Bulan</label>
                        <select id="penghasilanAyah" {...register('penghasilanAyah')} className={inputClass}>
                          <option value="">Pilih Rentang Penghasilan</option>
                          <option value="< 2 Juta">&lt; Rp 2.000.000</option>
                          <option value="2-5 Juta">Rp 2.000.000 - Rp 5.000.000</option>
                          <option value="5-10 Juta">Rp 5.000.000 - Rp 10.000.000</option>
                          <option value="> 10 Juta">&gt; Rp 10.000.000</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="teleponAyah" className="text-sm font-medium text-gray-700">Nomor WhatsApp Ayah *</label>
                        <input id="teleponAyah" {...register('teleponAyah')} className={inputClass} placeholder="Contoh: 0812..." />
                        {errors.teleponAyah && <p className="text-red-500 text-xs mt-1">{errors.teleponAyah.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="alamatAyah" className="text-sm font-medium text-gray-700">Alamat Ayah</label>
                        <input id="alamatAyah" {...register('alamatAyah')} className={inputClass} />
                      </div>
                    </div>
                  </div>

                  {/* Ibu Section */}
                  <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                    <h4 className="font-semibold text-[#00AA13] mb-4 flex items-center gap-2">Data Ibu</h4>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor="namaIbu" className="text-sm font-medium text-gray-700">Nama Ibu *</label>
                        <input id="namaIbu" {...register('namaIbu')} className={inputClass} />
                        {errors.namaIbu && <p className="text-red-500 text-xs mt-1">{errors.namaIbu.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="nikIbu" className="text-sm font-medium text-gray-700">NIK Ibu</label>
                        <input id="nikIbu" {...register('nikIbu')} className={inputClass} maxLength={16} />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="tahunLahirIbu" className="text-sm font-medium text-gray-700">Tahun Lahir Ibu</label>
                        <input id="tahunLahirIbu" type="number" {...register('tahunLahirIbu')} className={inputClass} placeholder="YYYY" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="pendidikanIbu" className="text-sm font-medium text-gray-700">Pendidikan Ibu</label>
                        <select id="pendidikanIbu" {...register('pendidikanIbu')} className={inputClass}>
                          <option value="">Pilih Pendidikan</option>
                          <option value="SD">SD Sederajat</option>
                          <option value="SMP">SMP Sederajat</option>
                          <option value="SMA">SMA Sederajat</option>
                          <option value="D1-D3">D1 - D3</option>
                          <option value="S1">S1</option>
                          <option value="S2">S2</option>
                          <option value="S3">S3</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="pekerjaanIbu" className="text-sm font-medium text-gray-700">Pekerjaan Ibu *</label>
                        <input id="pekerjaanIbu" {...register('pekerjaanIbu')} className={inputClass} />
                        {errors.pekerjaanIbu && <p className="text-red-500 text-xs mt-1">{errors.pekerjaanIbu.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="penghasilanIbu" className="text-sm font-medium text-gray-700">Penghasilan Per Bulan</label>
                        <select id="penghasilanIbu" {...register('penghasilanIbu')} className={inputClass}>
                          <option value="">Pilih Rentang Penghasilan</option>
                          <option value="Tidak Berpenghasilan">Tidak Berpenghasilan</option>
                          <option value="< 2 Juta">&lt; Rp 2.000.000</option>
                          <option value="2-5 Juta">Rp 2.000.000 - Rp 5.000.000</option>
                          <option value="5-10 Juta">Rp 5.000.000 - Rp 10.000.000</option>
                          <option value="> 10 Juta">&gt; Rp 10.000.000</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="teleponIbu" className="text-sm font-medium text-gray-700">Nomor WhatsApp Ibu *</label>
                        <input id="teleponIbu" {...register('teleponIbu')} className={inputClass} placeholder="Contoh: 0812..." />
                        {errors.teleponIbu && <p className="text-red-500 text-xs mt-1">{errors.teleponIbu.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="alamatIbu" className="text-sm font-medium text-gray-700">Alamat Ibu</label>
                        <input id="alamatIbu" {...register('alamatIbu')} className={inputClass} />
                      </div>
                    </div>
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
                
                <div className="grid md:grid-cols-2 gap-4">
                  {['Akta Kelahiran', 'Kartu Keluarga', 'Pas Foto Anak (Terbaru)', 'Bukti Pembayaran OKB'].map((docName, i) => (
                    <div key={i} className="border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <UploadCloud size={24} />
                      </div>
                      <h4 className="font-medium text-gray-800 mb-1 text-sm">{docName}</h4>
                      <p className="text-xs text-gray-500">Maks. 5MB</p>
                    </div>
                  ))}
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
                  className="flex items-center gap-2 px-8 py-3 bg-[#00AA13] text-white rounded-full font-medium hover:bg-[#00880F] transition-all shadow-lg shadow-[#00AA13]/30 hover:shadow-[#00AA13]/50"
                >
                  Selanjutnya
                  <ChevronRight size={20} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex items-center gap-2 px-8 py-3 bg-[#00AA13] text-white rounded-full font-medium transition-all shadow-lg shadow-[#00AA13]/30 hover:shadow-[#00AA13]/50 ${
                    isSubmitting ? 'opacity-70 cursor-wait' : 'hover:bg-[#00880F]'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      Lewati & Kirim Pendaftaran
                      <CheckCircle2 size={20} />
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
