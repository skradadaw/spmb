'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronRight, ChevronLeft, UploadCloud, Loader2, CalendarIcon, User, Users, MapPin, FileText, GraduationCap, Trophy, Info, X, Check } from 'lucide-react';
import { formSchema, step1BaseSchema, step2Schema, type FormData } from '../schema';
import { submitRegistrationAction } from '../actions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useWilayahIndonesia } from '@/hooks/useWilayahIndonesia';

const steps = [
  { id: 'murid', title: 'Data Murid' },
  { id: 'orangtua', title: 'Data Orang Tua' },
  { id: 'dokumen', title: 'Dokumen' },
  { id: 'selesai', title: 'Selesai' },
];

const DOCUMENTS = [
  { id: 'aktaKelahiran', title: 'Akta Kelahiran', desc: 'PDF, JPG, atau PNG (Maks. 5MB)' },
  { id: 'kartuKeluarga', title: 'Kartu Keluarga', desc: 'PDF, JPG, atau PNG (Maks. 5MB)' },
  { id: 'pasFoto', title: 'Pas Foto Anak (Terbaru)', desc: 'Foto formal anak (Maks. 5MB)' },
  { id: 'buktiPembayaran', title: 'Bukti Pembayaran OKB', desc: 'Struk transfer / pembayaran (Maks. 5MB)' },
];

export default function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    provinces,
    regencies,
    districts,
    villages,
    loading: wilayahLoading,
    fetchRegencies,
    fetchDistricts,
    fetchVillages,
  } = useWilayahIndonesia();

  const { register, control, handleSubmit, formState: { errors }, trigger, watch, getValues, setValue, setError, clearErrors, reset } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      jenisPendaftaran: '',
      pilihanKelas: '',
      namaLengkap: '',
      jenisKelamin: '',
      tempatLahir: '',
      tanggalLahir: '',
      nik: '',
      nisn: '',
      bekerjaDiDirektorat2: 'Tidak',
      profesiDiDirektorat2: '',
      asalSekolah: '',
      prestasiAnak: '',
      tingkatPrestasi: '',
      jarakKeSekolah: '',
      alamatJalan: '',
      rt: '',
      rw: '',
      kelurahan: '',
      kecamatan: '',
      kota: '',
      provinsi: '',
      namaAyah: '',
      nikAyah: '',
      pendidikanAyah: '',
      pekerjaanAyah: '',
      penghasilanAyah: '',
      teleponAyah: '',
      alamatAyah: '',
      namaIbu: '',
      nikIbu: '',
      pendidikanIbu: '',
      pekerjaanIbu: '',
      penghasilanIbu: '',
      teleponIbu: '',
      alamatIbu: '',
    },
  });

  // Restore dependent dropdown data if user navigates back to step 1
  useEffect(() => {
    const prov = provinces.find(p => p.name === getValues('provinsi'));
    if (prov && regencies.length === 0) fetchRegencies(prov.id);
  }, [provinces, getValues, fetchRegencies, regencies.length]);

  useEffect(() => {
    const kota = regencies.find(r => r.name === getValues('kota'));
    if (kota && districts.length === 0) fetchDistricts(kota.id);
  }, [regencies, getValues, fetchDistricts, districts.length]);

  useEffect(() => {
    const kec = districts.find(d => d.name === getValues('kecamatan'));
    if (kec && villages.length === 0) fetchVillages(kec.id);
  }, [districts, getValues, fetchVillages, villages.length]);
  
  const bekerjaDiDirektorat2 = watch('bekerjaDiDirektorat2');
  const tanggalLahir = watch('tanggalLahir');
  
  let ageYears = 0;
  let ageMonths = 0;
  if (tanggalLahir) {
    const bd = new Date(tanggalLahir);
    const today = new Date();
    ageYears = differenceInYears(today, bd);
    ageMonths = differenceInMonths(today, bd) % 12;
  }

  const formValues = watch();
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('spmb-draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        reset(parsed);
      } catch (e) {}
    }
    const savedStep = localStorage.getItem('spmb-step');
    if (savedStep) {
      try {
        const stepNum = parseInt(savedStep, 10);
        if (!isNaN(stepNum) && stepNum >= 0 && stepNum < 3) {
          setCurrentStep(stepNum);
        }
      } catch (e) {}
    }
    setIsRestored(true);
  }, [reset]);

  useEffect(() => {
    if (isRestored) {
      localStorage.setItem('spmb-draft', JSON.stringify(formValues));
      localStorage.setItem('spmb-step', currentStep.toString());
    }
  }, [formValues, currentStep, isRestored]);

  const formatWhatsApp = (fieldName: 'teleponAyah' | 'teleponIbu') => {
    let val = getValues(fieldName) || "";
    val = val.replace(/\D/g, '');
    if (val.startsWith('62')) {
      val = '0' + val.substring(2);
    } else if (val.startsWith('8')) {
      val = '0' + val;
    }
    setValue(fieldName, val, { shouldValidate: true });
  };

  const handleCopyAddress = (target: 'alamatAyah' | 'alamatIbu', checked: boolean) => {
    if (checked) {
      const alJalan = getValues('alamatJalan');
      const rt = getValues('rt');
      const rw = getValues('rw');
      const kel = getValues('kelurahan');
      const kec = getValues('kecamatan');
      const kota = getValues('kota');
      const prov = getValues('provinsi');
      
      const parts = [
        alJalan,
        (rt || rw) ? `RT ${rt || '-'}/RW ${rw || '-'}` : '',
        kel ? `Kel. ${kel}` : '',
        kec ? `Kec. ${kec}` : '',
        kota ? `Kota/Kab. ${kota}` : '',
        prov ? `Prov. ${prov}` : ''
      ].filter(Boolean);

      if (parts.length > 0) {
        setValue(target, parts.join(', '), { shouldValidate: true });
      }
    } else {
      setValue(target, '', { shouldValidate: true });
    }
  };

  const handleFileSelect = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError(`Ukuran file "${file.name}" melebihi batas maksimal 5MB.`);
      return;
    }
    setUploadError(null);
    setUploadedFiles((prev) => ({ ...prev, [docId]: file }));
  };

  const handleFileRemove = (docId: string) => {
    setUploadedFiles((prev) => {
      const updated = { ...prev };
      delete updated[docId];
      return updated;
    });
  };

  const nextStep = async () => {
    let fieldsToValidate: string[] = [];
    if (currentStep === 0) {
      fieldsToValidate = Object.keys(step1BaseSchema.shape);
      const bekerja = getValues('bekerjaDiDirektorat2');
      const profesi = getValues('profesiDiDirektorat2');
      if (bekerja === 'Ya' && (!profesi || profesi.trim() === '')) {
        setError('profesiDiDirektorat2', {
          type: 'manual',
          message: 'Profesi wajib diisi jika bekerja di direktorat 2',
        });
      } else {
        clearErrors('profesiDiDirektorat2');
      }
    } else if (currentStep === 1) {
      fieldsToValidate = Object.keys(step2Schema.shape);
    }

    const isStepValid = await trigger(fieldsToValidate as any);

    if (currentStep === 0) {
      const bekerja = getValues('bekerjaDiDirektorat2');
      const profesi = getValues('profesiDiDirektorat2');
      if (bekerja === 'Ya' && (!profesi || profesi.trim() === '')) {
        setError('profesiDiDirektorat2', {
          type: 'manual',
          message: 'Profesi wajib diisi jika bekerja di direktorat 2',
        });
        setTimeout(() => {
          const firstError = document.querySelector('.border-red-500');
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
        return;
      }
    }

    if (isStepValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setTimeout(() => {
        const firstError = document.querySelector('.border-red-500');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
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
        setSubmitError(typeof error === 'string' ? error : 'Terjadi kesalahan saat menghubungi server. Pastikan koneksi internet stabil dan coba lagi.');
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        localStorage.removeItem('spmb-draft');
        localStorage.removeItem('spmb-step');
        setSubmitSuccess(true);
        setCurrentStep(3); // Ke halaman sukses
      }
    } catch (err: any) {
      console.error('Exception:', err);
      setSubmitError(err?.message || 'Terjadi kesalahan sistem saat mengirim data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm hover:border-gray-300 focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all shadow-sm placeholder:text-gray-400";

  return (
    <div className="w-full max-w-6xl mx-auto bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl overflow-hidden border border-gray-100">
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
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#00AA13]/10 flex items-center justify-center text-[#00AA13]">
                    <User size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Informasi Calon Murid</h3>
                </div>
                
                <div className="space-y-6">
                  {/* Program Pilihan */}
                  <div className="p-6 bg-white shadow-sm rounded-xl border border-gray-200">
                    <div className="bg-gray-50/50 p-3 rounded-lg border-l-4 border-[#00AA13] flex items-center gap-2 mb-4">
                      <FileText size={16} className="text-[#00AA13]" />
                      <h4 className="text-sm font-semibold text-gray-900">Program Pilihan</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Jenis Pendaftaran *</label>
                        <Controller
                          control={control}
                          name="jenisPendaftaran"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <SelectTrigger className={errors.jenisPendaftaran ? "border-red-500" : ""}>
                                <SelectValue placeholder="Pilih Jenis Pendaftaran" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Siswa Baru">Siswa Baru</SelectItem>
                                <SelectItem value="Pindahan">Pindahan</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.jenisPendaftaran && <p className="text-red-500 text-xs mt-1">{errors.jenisPendaftaran.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Pilihan Kelas *</label>
                        <Controller
                          control={control}
                          name="pilihanKelas"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <SelectTrigger className={errors.pilihanKelas ? "border-red-500" : ""}>
                                <SelectValue placeholder="Pilih Kelas" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Reguler">Reguler</SelectItem>
                                <SelectItem value="Bilingual">Bilingual</SelectItem>
                                <SelectItem value="Tahfizh">Tahfizh</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.pilihanKelas && <p className="text-red-500 text-xs mt-1">{errors.pilihanKelas.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Identitas Diri */}
                  <div className="p-6 bg-white shadow-sm rounded-xl border border-gray-200">
                    <div className="bg-gray-50/50 p-3 rounded-lg border-l-4 border-[#00AA13] flex items-center gap-2 mb-4">
                      <User size={16} className="text-[#00AA13]" />
                      <h4 className="text-sm font-semibold text-gray-900">Identitas Diri</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5 md:col-span-2">
                        <label htmlFor="namaLengkap" className="text-sm font-medium text-gray-700">Nama Lengkap *</label>
                        <input id="namaLengkap" {...register('namaLengkap')} className={cn(inputClass, errors.namaLengkap && "border-red-500")} placeholder="Nama sesuai Akta Kelahiran" />
                        {errors.namaLengkap && <p className="text-red-500 text-xs mt-1">{errors.namaLengkap.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="nik" className="text-sm font-medium text-gray-700">NIK (16 Digit) *</label>
                        <input id="nik" {...register('nik')} className={cn(inputClass, errors.nik && "border-red-500")} placeholder="16 Digit NIK" maxLength={16} />
                        {errors.nik && <p className="text-red-500 text-xs mt-1">{errors.nik.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="nisn" className="text-sm font-medium text-gray-700">NISN (Nomor Induk Siswa Nasional) *</label>
                        <input id="nisn" {...register('nisn')} className={cn(inputClass, errors.nisn && "border-red-500")} placeholder="Nomor Induk Siswa Nasional" />
                        {errors.nisn && <p className="text-red-500 text-xs mt-1">{errors.nisn.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="tempatLahir" className="text-sm font-medium text-gray-700">Tempat Lahir *</label>
                        <input id="tempatLahir" {...register('tempatLahir')} className={cn(inputClass, errors.tempatLahir && "border-red-500")} placeholder="Kota/Kabupaten" />
                        {errors.tempatLahir && <p className="text-red-500 text-xs mt-1">{errors.tempatLahir.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Tanggal Lahir *</label>
                        <Controller
                          control={control}
                          name="tanggalLahir"
                          render={({ field }) => (
                            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                              <PopoverTrigger asChild>
                                <button
                                  type="button"
                                  className={cn(
                                    inputClass,
                                    "justify-start text-left flex items-center",
                                    !field.value && "text-gray-400 font-normal",
                                    errors.tanggalLahir && "border-red-500"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(new Date(field.value), "PPP", { locale: idLocale }) : <span>Pilih tanggal</span>}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                  mode="single"
                                  selected={field.value ? new Date(field.value) : undefined}
                                  onSelect={(date) => {
                                    field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                                    setIsCalendarOpen(false);
                                  }}
                                  defaultMonth={field.value ? new Date(field.value) : new Date(new Date().getFullYear() - 7, 0)}
                                />
                              </PopoverContent>
                            </Popover>
                          )}
                        />
                        {errors.tanggalLahir && <p className="text-red-500 text-xs mt-1">{errors.tanggalLahir.message}</p>}
                        {tanggalLahir && (
                          <p className={cn("text-xs mt-2 font-medium", ageYears < 6 ? "text-amber-600" : "text-green-600")}>
                            Usia: {ageYears} Tahun {ageMonths} Bulan
                            {ageYears < 6 && " (Perhatian: Usia di bawah 6 tahun)"}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Jenis Kelamin *</label>
                        <Controller
                          control={control}
                          name="jenisKelamin"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <SelectTrigger className={errors.jenisKelamin ? "border-red-500" : ""}>
                                <SelectValue placeholder="Pilih Jenis Kelamin" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                <SelectItem value="Perempuan">Perempuan</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.jenisKelamin && <p className="text-red-500 text-xs mt-1">{errors.jenisKelamin.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Pendidikan & Prestasi */}
                  <div className="p-6 bg-white shadow-sm rounded-xl border border-gray-200">
                    <div className="bg-gray-50/50 p-3 rounded-lg border-l-4 border-[#00AA13] flex items-center gap-2 mb-4">
                      <GraduationCap size={16} className="text-[#00AA13]" />
                      <h4 className="text-sm font-semibold text-gray-900">Riwayat Pendidikan & Prestasi</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label htmlFor="asalSekolah" className="text-sm font-medium text-gray-700">Asal Sekolah (TK/PAUD) *</label>
                        <input id="asalSekolah" {...register('asalSekolah')} className={cn(inputClass, errors.asalSekolah && "border-red-500")} placeholder="Nama TK/PAUD" />
                        {errors.asalSekolah && <p className="text-red-500 text-xs mt-1">{errors.asalSekolah.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="jarakKeSekolah" className="text-sm font-medium text-gray-700">Jarak ke Sekolah (KM) *</label>
                        <input id="jarakKeSekolah" type="number" step="0.1" {...register('jarakKeSekolah')} className={cn(inputClass, errors.jarakKeSekolah && "border-red-500")} placeholder="Contoh: 5.5" />
                        {errors.jarakKeSekolah && <p className="text-red-500 text-xs mt-1">{errors.jarakKeSekolah.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="prestasiAnak" className="text-sm font-medium text-gray-700">Prestasi Anak (Opsional)</label>
                        <input id="prestasiAnak" {...register('prestasiAnak')} className={inputClass} placeholder="Misal: Juara 1 Lomba Mewarnai" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Tingkat Prestasi</label>
                        <Controller
                          control={control}
                          name="tingkatPrestasi"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Tingkat" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Sekolah">Sekolah</SelectItem>
                                <SelectItem value="Kecamatan">Kecamatan</SelectItem>
                                <SelectItem value="Kabupaten/Kota">Kabupaten/Kota</SelectItem>
                                <SelectItem value="Provinsi">Provinsi</SelectItem>
                                <SelectItem value="Nasional">Nasional</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Alamat Lengkap */}
                  <div className="p-6 bg-white shadow-sm rounded-xl border border-gray-200">
                    <div className="bg-gray-50/50 p-3 rounded-lg border-l-4 border-[#00AA13] flex items-center gap-2 mb-4">
                      <MapPin size={16} className="text-[#00AA13]" />
                      <h4 className="text-sm font-semibold text-gray-900">Alamat Lengkap Rumah</h4>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
                      {/* 1. Provinsi */}
                      <div className="space-y-1.5 col-span-2 lg:col-span-3">
                        <label className="text-sm font-medium text-gray-700">Provinsi *</label>
                        <Controller
                          control={control}
                          name="provinsi"
                          render={({ field }) => (
                            <Select 
                              onValueChange={(val) => {
                                field.onChange(val);
                                setValue('kota', '');
                                setValue('kecamatan', '');
                                setValue('kelurahan', '');
                                const prov = provinces.find(p => p.name === val);
                                if (prov) fetchRegencies(prov.id);
                              }}
                              value={field.value || ""}
                            >
                              <SelectTrigger className={errors.provinsi ? "border-red-500" : ""}>
                                <SelectValue placeholder={wilayahLoading.provinces ? "Memuat..." : "Pilih Provinsi"} />
                              </SelectTrigger>
                              <SelectContent>
                                {provinces.map(prov => (
                                  <SelectItem key={prov.id} value={prov.name}>{prov.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.provinsi && <p className="text-red-500 text-xs mt-1">{errors.provinsi.message}</p>}
                      </div>

                      {/* 2. Kota */}
                      <div className="space-y-1.5 col-span-2 lg:col-span-3">
                        <label className="text-sm font-medium text-gray-700">Kota/Kabupaten *</label>
                        <Controller
                          control={control}
                          name="kota"
                          render={({ field }) => (
                            <Select 
                              onValueChange={(val) => {
                                field.onChange(val);
                                setValue('kecamatan', '');
                                setValue('kelurahan', '');
                                const kota = regencies.find(r => r.name === val);
                                if (kota) fetchDistricts(kota.id);
                              }}
                              value={field.value || ""}
                              disabled={!getValues('provinsi')}
                            >
                              <SelectTrigger className={errors.kota ? "border-red-500" : ""}>
                                <SelectValue placeholder={wilayahLoading.regencies ? "Memuat..." : "Pilih Kota/Kabupaten"} />
                              </SelectTrigger>
                              <SelectContent>
                                {regencies.map(r => (
                                  <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.kota && <p className="text-red-500 text-xs mt-1">{errors.kota.message}</p>}
                      </div>

                      {/* 3. Kecamatan */}
                      <div className="space-y-1.5 col-span-2 lg:col-span-3">
                        <label className="text-sm font-medium text-gray-700">Kecamatan *</label>
                        <Controller
                          control={control}
                          name="kecamatan"
                          render={({ field }) => (
                            <Select 
                              onValueChange={(val) => {
                                field.onChange(val);
                                setValue('kelurahan', '');
                                const kec = districts.find(d => d.name === val);
                                if (kec) fetchVillages(kec.id);
                              }}
                              value={field.value || ""}
                              disabled={!getValues('kota')}
                            >
                              <SelectTrigger className={errors.kecamatan ? "border-red-500" : ""}>
                                <SelectValue placeholder={wilayahLoading.districts ? "Memuat..." : "Pilih Kecamatan"} />
                              </SelectTrigger>
                              <SelectContent>
                                {districts.map(d => (
                                  <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.kecamatan && <p className="text-red-500 text-xs mt-1">{errors.kecamatan.message}</p>}
                      </div>

                      {/* 4. Kelurahan */}
                      <div className="space-y-1.5 col-span-2 lg:col-span-3">
                        <label className="text-sm font-medium text-gray-700">Kelurahan/Desa *</label>
                        <Controller
                          control={control}
                          name="kelurahan"
                          render={({ field }) => (
                            <Select 
                              onValueChange={field.onChange}
                              value={field.value || ""}
                              disabled={!getValues('kecamatan')}
                            >
                              <SelectTrigger className={errors.kelurahan ? "border-red-500" : ""}>
                                <SelectValue placeholder={wilayahLoading.villages ? "Memuat..." : "Pilih Kelurahan/Desa"} />
                              </SelectTrigger>
                              <SelectContent>
                                {villages.map(v => (
                                  <SelectItem key={v.id} value={v.name}>{v.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.kelurahan && <p className="text-red-500 text-xs mt-1">{errors.kelurahan.message}</p>}
                      </div>

                      {/* 5. Jalan */}
                      <div className="space-y-1.5 col-span-2 lg:col-span-4">
                        <label htmlFor="alamatJalan" className="text-sm font-medium text-gray-700">Nama Jalan / Perumahan & Nomor Rumah *</label>
                        <input id="alamatJalan" {...register('alamatJalan')} className={cn(inputClass, errors.alamatJalan && "border-red-500")} placeholder="Contoh: Jl. Merdeka No. 10" />
                        {errors.alamatJalan && <p className="text-red-500 text-xs mt-1">{errors.alamatJalan.message}</p>}
                      </div>

                      {/* 6. RT */}
                      <div className="space-y-1.5 col-span-1 lg:col-span-1">
                        <label htmlFor="rt" className="text-sm font-medium text-gray-700">RT *</label>
                        <input id="rt" {...register('rt')} className={cn(inputClass, errors.rt && "border-red-500")} placeholder="01" maxLength={3} />
                        {errors.rt && <p className="text-red-500 text-xs mt-1">{errors.rt.message}</p>}
                      </div>

                      {/* 7. RW */}
                      <div className="space-y-1.5 col-span-1 lg:col-span-1">
                        <label htmlFor="rw" className="text-sm font-medium text-gray-700">RW *</label>
                        <input id="rw" {...register('rw')} className={cn(inputClass, errors.rw && "border-red-500")} placeholder="02" maxLength={3} />
                        {errors.rw && <p className="text-red-500 text-xs mt-1">{errors.rw.message}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Informasi Tambahan */}
                  <div className="p-6 bg-white shadow-sm rounded-xl border border-gray-200">
                    <div className="bg-gray-50/50 p-3 rounded-lg border-l-4 border-[#00AA13] flex items-center gap-2 mb-4">
                      <Info size={16} className="text-[#00AA13]" />
                      <h4 className="text-sm font-semibold text-gray-900">Informasi Tambahan</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Apakah orangtua bekerja di direktorat 2 Al-Muhajirin? *</label>
                        <Controller
                          control={control}
                          name="bekerjaDiDirektorat2"
                          render={({ field }) => (
                            <Select 
                              onValueChange={(val) => {
                                field.onChange(val);
                                if (val === 'Tidak') {
                                  setValue('profesiDiDirektorat2', '');
                                  clearErrors('profesiDiDirektorat2');
                                }
                              }} 
                              value={field.value || ""}
                            >
                              <SelectTrigger className={errors.bekerjaDiDirektorat2 ? "border-red-500" : ""}>
                                <SelectValue placeholder="Pilih Jawaban" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Ya">Ya</SelectItem>
                                <SelectItem value="Tidak">Tidak</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.bekerjaDiDirektorat2 && <p className="text-red-500 text-xs mt-1">{errors.bekerjaDiDirektorat2.message}</p>}
                      </div>
                      {bekerjaDiDirektorat2 === 'Ya' && (
                        <div className="space-y-1.5 md:col-span-2">
                          <label htmlFor="profesiDiDirektorat2" className="text-sm font-medium text-gray-700">Bekerja sebagai profesi apa? *</label>
                          <input 
                            id="profesiDiDirektorat2" 
                            {...register('profesiDiDirektorat2', {
                              onChange: () => {
                                if (errors.profesiDiDirektorat2) {
                                  clearErrors('profesiDiDirektorat2');
                                }
                              }
                            })} 
                            className={cn(inputClass, errors.profesiDiDirektorat2 && "border-red-500")} 
                            placeholder="Contoh: Guru" 
                          />
                          {errors.profesiDiDirektorat2 && <p className="text-red-500 text-xs mt-1">{errors.profesiDiDirektorat2.message}</p>}
                        </div>
                      )}
                    </div>
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
                <div className="mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#00AA13]/10 flex items-center justify-center text-[#00AA13]">
                      <Users size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Data Orang Tua / Wali</h3>
                  </div>
                </div>
                
                <div className="space-y-8 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8">
                  {/* Ayah Section */}
                  <div className="p-6 bg-white shadow-sm rounded-xl border border-gray-200">
                    <div className="bg-gray-50/50 p-3 rounded-lg border-l-4 border-[#00AA13] flex items-center gap-2 mb-4">
                      <User size={16} className="text-[#00AA13]" />
                      <h4 className="text-sm font-semibold text-gray-900">Data Ayah</h4>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className="space-y-1.5">
                        <label htmlFor="namaAyah" className="text-sm font-medium text-gray-700">Nama Ayah *</label>
                        <input id="namaAyah" {...register('namaAyah')} className={cn(inputClass, errors.namaAyah && "border-red-500")} />
                        {errors.namaAyah && <p className="text-red-500 text-xs mt-1">{errors.namaAyah.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="nikAyah" className="text-sm font-medium text-gray-700">NIK Ayah *</label>
                        <input id="nikAyah" {...register('nikAyah')} className={cn(inputClass, errors.nikAyah && "border-red-500")} maxLength={16} />
                        {errors.nikAyah && <p className="text-red-500 text-xs mt-1">{errors.nikAyah.message}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Pendidikan Ayah *</label>
                        <Controller
                          control={control}
                          name="pendidikanAyah"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Pendidikan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SD">SD Sederajat</SelectItem>
                                <SelectItem value="SMP">SMP Sederajat</SelectItem>
                                <SelectItem value="SMA">SMA Sederajat</SelectItem>
                                <SelectItem value="D1-D3">D1 - D3</SelectItem>
                                <SelectItem value="S1">S1</SelectItem>
                                <SelectItem value="S2">S2</SelectItem>
                                <SelectItem value="S3">S3</SelectItem>
                              </SelectContent>
                            </Select>
                      )}
                    />
                    {errors.pendidikanAyah && <p className="text-red-500 text-xs mt-1">{errors.pendidikanAyah.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="pekerjaanAyah" className="text-sm font-medium text-gray-700">Pekerjaan Ayah *</label>
                    <input id="pekerjaanAyah" {...register('pekerjaanAyah')} className={cn(inputClass, errors.pekerjaanAyah && "border-red-500")} />
                    {errors.pekerjaanAyah && <p className="text-red-500 text-xs mt-1">{errors.pekerjaanAyah.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Penghasilan Per Bulan *</label>
                    <Controller
                          control={control}
                          name="penghasilanAyah"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Rentang" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="< 2 Juta">&lt; Rp 2.000.000</SelectItem>
                                <SelectItem value="2-5 Juta">Rp 2.000.000 - Rp 5.000.000</SelectItem>
                                <SelectItem value="5-10 Juta">Rp 5.000.000 - Rp 10.000.000</SelectItem>
                                <SelectItem value="> 10 Juta">&gt; Rp 10.000.000</SelectItem>
                              </SelectContent>
                            </Select>
                      )}
                    />
                    {errors.penghasilanAyah && <p className="text-red-500 text-xs mt-1">{errors.penghasilanAyah.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="teleponAyah" className="text-sm font-medium text-gray-700">Nomor WhatsApp Ayah *</label>
                    <input id="teleponAyah" {...register('teleponAyah', { onBlur: () => formatWhatsApp('teleponAyah') })} className={cn(inputClass, errors.teleponAyah && "border-red-500")} placeholder="Contoh: 0812..." />
                    {errors.teleponAyah && <p className="text-red-500 text-xs mt-1">{errors.teleponAyah.message}</p>}
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label htmlFor="alamatAyah" className="text-sm font-medium text-gray-700">Alamat Ayah *</label>
                      <label className="flex items-center gap-2 text-xs font-medium text-[#00AA13] bg-[#00AA13]/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#00AA13]/20 transition-colors w-fit">
                        <input 
                          type="checkbox" 
                          className="rounded text-[#00AA13] focus:ring-[#00AA13] cursor-pointer w-3.5 h-3.5"
                          onChange={(e) => handleCopyAddress('alamatAyah', e.target.checked)}
                        />
                        ☑️ Centang jika alamat sama dengan anak
                      </label>
                    </div>
                    <input id="alamatAyah" {...register('alamatAyah')} className={cn(inputClass, errors.alamatAyah && "border-red-500")} />
                    {errors.alamatAyah && <p className="text-red-500 text-xs mt-1">{errors.alamatAyah.message}</p>}
                  </div>
                    </div>
                  </div>

                  {/* Ibu Section */}
                  <div className="p-6 bg-white shadow-sm rounded-xl border border-gray-200">
                    <div className="bg-gray-50/50 p-3 rounded-lg border-l-4 border-[#00AA13] flex items-center gap-2 mb-4">
                      <User size={16} className="text-[#00AA13]" />
                      <h4 className="text-sm font-semibold text-gray-900">Data Ibu</h4>
                    </div>
                    <div className="flex flex-col gap-6">
                      <div className="space-y-1.5">
                        <label htmlFor="namaIbu" className="text-sm font-medium text-gray-700">Nama Ibu *</label>
                        <input id="namaIbu" {...register('namaIbu')} className={cn(inputClass, errors.namaIbu && "border-red-500")} />
                        {errors.namaIbu && <p className="text-red-500 text-xs mt-1">{errors.namaIbu.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="nikIbu" className="text-sm font-medium text-gray-700">NIK Ibu *</label>
                        <input id="nikIbu" {...register('nikIbu')} className={cn(inputClass, errors.nikIbu && "border-red-500")} maxLength={16} />
                        {errors.nikIbu && <p className="text-red-500 text-xs mt-1">{errors.nikIbu.message}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Pendidikan Ibu *</label>
                        <Controller
                          control={control}
                          name="pendidikanIbu"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Pendidikan" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SD">SD Sederajat</SelectItem>
                                <SelectItem value="SMP">SMP Sederajat</SelectItem>
                                <SelectItem value="SMA">SMA Sederajat</SelectItem>
                                <SelectItem value="D1-D3">D1 - D3</SelectItem>
                                <SelectItem value="S1">S1</SelectItem>
                                <SelectItem value="S2">S2</SelectItem>
                                <SelectItem value="S3">S3</SelectItem>
                              </SelectContent>
                            </Select>
                      )}
                    />
                    {errors.pendidikanIbu && <p className="text-red-500 text-xs mt-1">{errors.pendidikanIbu.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="pekerjaanIbu" className="text-sm font-medium text-gray-700">Pekerjaan Ibu *</label>
                    <input id="pekerjaanIbu" {...register('pekerjaanIbu')} className={cn(inputClass, errors.pekerjaanIbu && "border-red-500")} />
                    {errors.pekerjaanIbu && <p className="text-red-500 text-xs mt-1">{errors.pekerjaanIbu.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-gray-700">Penghasilan Per Bulan *</label>
                    <Controller
                          control={control}
                          name="penghasilanIbu"
                          render={({ field }) => (
                            <Select onValueChange={field.onChange} value={field.value || ""}>
                              <SelectTrigger>
                                <SelectValue placeholder="Pilih Rentang" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Tidak Berpenghasilan">Tidak Berpenghasilan</SelectItem>
                                <SelectItem value="< 2 Juta">&lt; Rp 2.000.000</SelectItem>
                                <SelectItem value="2-5 Juta">Rp 2.000.000 - Rp 5.000.000</SelectItem>
                                <SelectItem value="5-10 Juta">Rp 5.000.000 - Rp 10.000.000</SelectItem>
                                <SelectItem value="> 10 Juta">&gt; Rp 10.000.000</SelectItem>
                              </SelectContent>
                            </Select>
                      )}
                    />
                    {errors.penghasilanIbu && <p className="text-red-500 text-xs mt-1">{errors.penghasilanIbu.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="teleponIbu" className="text-sm font-medium text-gray-700">Nomor WhatsApp Ibu *</label>
                    <input id="teleponIbu" {...register('teleponIbu', { onBlur: () => formatWhatsApp('teleponIbu') })} className={cn(inputClass, errors.teleponIbu && "border-red-500")} placeholder="Contoh: 0812..." />
                    {errors.teleponIbu && <p className="text-red-500 text-xs mt-1">{errors.teleponIbu.message}</p>}
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <label htmlFor="alamatIbu" className="text-sm font-medium text-gray-700">Alamat Ibu *</label>
                      <label className="flex items-center gap-2 text-xs font-medium text-[#00AA13] bg-[#00AA13]/10 px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#00AA13]/20 transition-colors w-fit">
                        <input 
                          type="checkbox" 
                          className="rounded text-[#00AA13] focus:ring-[#00AA13] cursor-pointer w-3.5 h-3.5"
                          onChange={(e) => handleCopyAddress('alamatIbu', e.target.checked)}
                        />
                        ☑️ Centang jika alamat sama dengan anak
                      </label>
                    </div>
                    <input id="alamatIbu" {...register('alamatIbu')} className={cn(inputClass, errors.alamatIbu && "border-red-500")} />
                    {errors.alamatIbu && <p className="text-red-500 text-xs mt-1">{errors.alamatIbu.message}</p>}
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00AA13]/10 flex items-center justify-center text-[#00AA13]">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Unggah Dokumen</h3>
                    <p className="text-xs text-gray-500">Opsional - Dapat diunggah sekarang atau menyusul melalui WhatsApp / Panitia</p>
                  </div>
                </div>

                {uploadError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-medium">
                    {uploadError}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {DOCUMENTS.map((doc) => {
                    const file = uploadedFiles[doc.id];
                    return (
                      <div
                        key={doc.id}
                        className={cn(
                          "relative border-2 rounded-xl p-5 transition-all flex flex-col justify-between",
                          file
                            ? "border-[#00AA13] bg-[#00AA13]/5"
                            : "border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
                        )}
                      >
                        <input
                          id={`file-input-${doc.id}`}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          onChange={(e) => handleFileSelect(doc.id, e)}
                        />

                        {file ? (
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-[#00AA13] text-white flex items-center justify-center shrink-0 shadow-sm">
                                <Check size={20} />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-semibold text-gray-900 text-sm">{doc.title}</h4>
                                <p className="text-xs text-gray-600 truncate max-w-[200px] mt-0.5">{file.name}</p>
                                <p className="text-[11px] text-gray-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleFileRemove(doc.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors p-1"
                              title="Hapus file"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        ) : (
                          <label
                            htmlFor={`file-input-${doc.id}`}
                            className="flex flex-col items-center justify-center text-center cursor-pointer py-3"
                          >
                            <div className="w-10 h-10 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                              <UploadCloud size={20} />
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm mb-1">{doc.title}</h4>
                            <p className="text-xs text-gray-500 mb-2">{doc.desc}</p>
                            <span className="text-xs font-semibold text-[#00AA13] hover:underline">Pilih File</span>
                          </label>
                        )}
                      </div>
                    );
                  })}
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
                  onClick={() => {
                    localStorage.removeItem('spmb-draft');
                    localStorage.removeItem('spmb-step');
                    window.location.reload();
                  }}
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
                  ) : Object.keys(uploadedFiles).length > 0 ? (
                    <>
                      Kirim Pendaftaran ({Object.keys(uploadedFiles).length} Dokumen)
                      <CheckCircle2 size={20} />
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
