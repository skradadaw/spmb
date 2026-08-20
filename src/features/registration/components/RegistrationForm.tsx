'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller, useWatch, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2, CalendarIcon, User, Users, MapPin, FileText, GraduationCap, Info, Check } from 'lucide-react';
import { DIRECTORATE_2_UNITS, formSchema, step1BaseSchema, step2Schema, type FormData } from '../schema';
import {
  cancelRegistrationAction,
  finalizeRegistrationAction,
  prepareRegistrationAction,
} from '../actions';
import { DOCUMENT_DEFINITIONS } from '../contracts';
import {
  acquireSubmissionLock,
  buildRegistrationPreparation,
  buildSubmissionCredentials,
  createSubmissionCredentials,
  releaseSubmissionLock,
} from '../clientSubmission';
import { uploadSignedDocuments } from '../signedUploadClient';
import { DocumentUploadCard } from './DocumentUploadCard';
import { ConfirmationModal } from './ConfirmationModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, differenceInYears, differenceInMonths } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useWilayahIndonesia } from '@/hooks/useWilayahIndonesia';

const steps = [
  { id: 'murid', title: 'Data Murid', icon: User },
  { id: 'orangtua', title: 'Data Orang Tua', icon: Users },
  { id: 'dokumen', title: 'Dokumen', icon: FileText },
  { id: 'selesai', title: 'Selesai', icon: CheckCircle2 },
];

const DOCUMENTS = DOCUMENT_DEFINITIONS;

type NumericField = 'nik' | 'nisn' | 'rt' | 'rw' | 'nikAyah' | 'nikIbu';
type PhoneField = 'teleponAyah' | 'teleponIbu';

const parseDateString = (str?: string): Date | undefined => {
  if (!str) return undefined;
  const parts = str.split('-');
  if (parts.length !== 3) return undefined;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
  return new Date(year, month, day);
};

export default function RegistrationForm() {
  const submissionLockRef = useRef(false);
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File }>({});
  const [previewUrls, setPreviewUrls] = useState<{ [key: string]: string }>({});
  const [missingDocErrors, setMissingDocErrors] = useState<string[]>([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const [uploadStatusMessage, setUploadStatusMessage] = useState<string>('');
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

  const { register, control, handleSubmit, formState: { errors }, trigger, getValues, setValue, clearErrors } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    shouldUnregister: false,
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
      namaOrangtuaDirektorat2: '',
      unitOrangtuaDirektorat2: '',
      saudaraDiDirektorat2: 'Tidak',
      namaSaudaraDirektorat2: '',
      unitSaudaraDirektorat2: '',
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

  const provinsiVal = useWatch({ control, name: 'provinsi' });
  const kotaVal = useWatch({ control, name: 'kota' });
  const kecamatanVal = useWatch({ control, name: 'kecamatan' });

  const bekerjaDiDirektorat2 = useWatch({ control, name: 'bekerjaDiDirektorat2' });
  const saudaraDiDirektorat2 = useWatch({ control, name: 'saudaraDiDirektorat2' });
  const tanggalLahir = useWatch({ control, name: 'tanggalLahir' });
  
  let ageYears = 0;
  let ageMonths = 0;
  if (tanggalLahir) {
    const bd = parseDateString(tanggalLahir);
    if (bd && !isNaN(bd.getTime())) {
      const today = new Date();
      ageYears = differenceInYears(today, bd);
      ageMonths = differenceInMonths(today, bd) % 12;
    }
  }

  // Restore dependent dropdown data if user navigates back to step 1 or reloads
  useEffect(() => {
    if (provinsiVal && provinces.length > 0) {
      const prov = provinces.find(p => p.name === provinsiVal);
      if (prov) fetchRegencies(prov.id);
    }
  }, [provinsiVal, provinces, fetchRegencies]);

  useEffect(() => {
    if (kotaVal && regencies.length > 0) {
      const kota = regencies.find(r => r.name === kotaVal);
      if (kota) fetchDistricts(kota.id);
    }
  }, [kotaVal, regencies, fetchDistricts]);

  useEffect(() => {
    if (kecamatanVal && districts.length > 0) {
      const kec = districts.find(d => d.name === kecamatanVal);
      if (kec) fetchVillages(kec.id);
    }
  }, [kecamatanVal, districts, fetchVillages]);

  const formatWhatsApp = (fieldName: 'teleponAyah' | 'teleponIbu') => {
    let val = getValues(fieldName) || "";
    val = val.replace(/\D/g, '');
    if (val.startsWith('62')) {
      val = '08' + val.substring(2);
    } else if (val.startsWith('8')) {
      val = '08' + val.substring(1);
    }
    setValue(fieldName, val, { shouldValidate: true, shouldDirty: true });
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

  const handleNumericInput = (field: NumericField | PhoneField, maxLen?: number) => (e: React.FormEvent<HTMLInputElement>) => {
    let clean = (e.currentTarget.value || '').replace(/\D/g, '');
    if (maxLen && clean.length > maxLen) {
      clean = clean.slice(0, maxLen);
    }
    setValue(field, clean, { shouldValidate: true, shouldDirty: true });
  };

  const nextStep = async () => {
    let fieldsToValidate: Array<keyof FormData> = [];
    if (currentStep === 0) {
      fieldsToValidate = Object.keys(step1BaseSchema.shape) as Array<keyof FormData>;
    } else if (currentStep === 1) {
      fieldsToValidate = Object.keys(step2Schema.shape) as Array<keyof FormData>;
    }

    const isStepValid = await trigger(fieldsToValidate);

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

  const onFormError = (formErrors: FieldErrors<FormData>) => {
    const step1Keys = Object.keys(step1BaseSchema.shape);
    const hasStep1Error = Object.keys(formErrors).some(key => step1Keys.includes(key));
    if (hasStep1Error) {
      setCurrentStep(0);
      setSubmitError('Ada isian di Data Murid yang belum lengkap. Mohon periksa kembali kolom yang bergaris merah.');
    } else {
      setCurrentStep(1);
      setSubmitError('Ada isian di Data Orang Tua yang belum lengkap. Mohon periksa kembali kolom yang bergaris merah.');
    }
    setTimeout(() => {
      const firstError = document.querySelector('.border-red-500');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const onSubmit = (data: FormData) => {
    setSubmitError(null);
    setUploadError(null);

    // Validate that all 4 mandatory documents are uploaded
    const missing = DOCUMENTS.filter((doc) => !uploadedFiles[doc.id]).map((d) => d.id);
    if (missing.length > 0) {
      setMissingDocErrors(missing);
      const missingNames = DOCUMENTS.filter((doc) => missing.includes(doc.id)).map((d) => d.title).join(', ');
      setUploadError(`Mohon lengkapi seluruh dokumen wajib (${missingNames}) sebelum mengirimkan formulir pendaftaran.`);
      setTimeout(() => {
        const firstMissing = document.querySelector('.border-red-400');
        if (firstMissing) {
          firstMissing.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
      return;
    }

    // Open confirmation modal for user review
    setPendingFormData(data);
    setIsConfirmModalOpen(true);
  };

  const handleFinalSubmit = async () => {
    if (!pendingFormData) return;
    if (!acquireSubmissionLock(submissionLockRef)) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setUploadStatusMessage('Menyiapkan unggahan aman...');

    const credentials = createSubmissionCredentials();
    const credentialInput = buildSubmissionCredentials(credentials);

    try {
      const preparation = buildRegistrationPreparation(
        pendingFormData,
        uploadedFiles,
        honeypotRef.current?.value ?? '',
        credentials,
      );
      const prepared = await prepareRegistrationAction(preparation);

      if (!prepared.success) {
        setSubmitError(prepared.error);
        setIsConfirmModalOpen(false);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
        return;
      }

      setUploadStatusMessage('Mengunggah dokumen 0 dari 4...');
      await uploadSignedDocuments(prepared.uploads, uploadedFiles, (completed, total) => {
        setUploadStatusMessage(`Mengunggah dokumen ${completed} dari ${total}...`);
      });
      setUploadStatusMessage('Memeriksa dokumen dan menyelesaikan pendaftaran...');
      const result = await finalizeRegistrationAction(credentialInput);
      if (!result.success) {
        await cancelRegistrationAction(credentialInput);
        setSubmitError(result.error);
        setIsConfirmModalOpen(false);
        return;
      }

      setIsConfirmModalOpen(false);
      setCurrentStep(3);
    } catch {
      await cancelRegistrationAction(credentialInput).catch(() => undefined);
      setSubmitError('Terjadi kesalahan sistem saat mengirim data.');
      setIsConfirmModalOpen(false);
    } finally {
      releaseSubmissionLock(submissionLockRef);
      setIsSubmitting(false);
      setUploadStatusMessage('');
    }
  };

  const inputClass = "w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm hover:border-gray-300 focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all shadow-sm placeholder:text-gray-400";

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Form Card */}
      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden">
        {/* Modern Step Header Bar */}
        <div className="relative bg-gradient-to-r from-[#00550B] via-[#007A10] to-[#00A315] px-5 sm:px-8 py-4 sm:py-5 flex items-center justify-between text-white overflow-hidden shadow-xs">
          {/* Subtle Ambient Light Glow in Header */}
          <div className="absolute top-0 right-1/4 w-64 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-emerald-300/15 rounded-full blur-xl pointer-events-none" />

          {/* Left: Step Icon & Info */}
          <div className="flex items-center gap-3 sm:gap-3.5 relative z-10 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs">
              {(() => {
                const CurrentIcon = steps[Math.min(currentStep, steps.length - 1)].icon;
                return <CurrentIcon size={20} className="stroke-[2.2]" />;
              })()}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-tight leading-tight truncate">
                {steps[Math.min(currentStep, steps.length - 1)].title}
              </h2>
              <div className="flex items-center gap-1.5 sm:gap-2 text-emerald-100 text-[11px] sm:text-xs mt-0.5 font-medium truncate">
                <span>Langkah {Math.min(currentStep + 1, steps.length)} dari {steps.length}</span>
                <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-emerald-300 shrink-0" />
                <span className="text-white/80 hidden sm:inline truncate">
                  {currentStep === 0 && 'Identitas Murid'}
                  {currentStep === 1 && 'Data Orang Tua / Wali'}
                  {currentStep === 2 && 'Unggah Berkas'}
                  {currentStep === 3 && 'Selesai'}
                </span>
              </div>
            </div>
          </div>

          {/* Right: Live Progress Pill */}
          <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 bg-black/15 backdrop-blur-md border border-white/15 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold text-white shadow-xs shrink-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="hidden sm:inline text-emerald-100 font-medium">Progres:</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
        </div>

        {/* Dynamic Gradient Hairline Progress Line */}
        <div className="w-full h-[3px] bg-black/10 relative overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-300 via-green-200 to-white"
            initial={false}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          />
        </div>

        {/* Form Content */}
        <div className="p-5 sm:p-8 md:p-12">
          {submitError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium flex items-start gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-bold text-xs">!</span>
              </div>
              <div>{submitError}</div>
            </motion.div>
          )}
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(onSubmit, onFormError)(e);
            }}
            onKeyDown={(e) => {
              // Prevent accidental submit when pressing Enter in inputs
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
                e.preventDefault();
              }
            }}
          >
          <div
            aria-hidden="true"
            className="absolute left-[-10000px] top-auto h-px w-px overflow-hidden"
          >
            <label htmlFor="registration-website">Website</label>
            <input
              ref={honeypotRef}
              id="registration-website"
              name="website"
              type="text"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <div className={cn("space-y-6", currentStep !== 0 && "hidden")}>
            <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#00AA13]/10 flex items-center justify-center text-[#00AA13] shrink-0">
                <User size={18} className="sm:w-5 sm:h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Informasi Calon Murid</h3>
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
                            <Select onValueChange={(val) => { field.onChange(val); clearErrors('jenisPendaftaran'); }} value={field.value || undefined}>
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
                            <Select onValueChange={(val) => { field.onChange(val); clearErrors('pilihanKelas'); }} value={field.value || undefined}>
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
                        <input 
                          id="nik" 
                          {...register('nik')} 
                          onInput={handleNumericInput('nik', 16)}
                          className={cn(inputClass, errors.nik && "border-red-500")} 
                          placeholder="16 Digit NIK" 
                          maxLength={16} 
                        />
                        {errors.nik && <p className="text-red-500 text-xs mt-1">{errors.nik.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="nisn" className="text-sm font-medium text-gray-700">NISN (Nomor Induk Siswa Nasional) *</label>
                        <input 
                          id="nisn" 
                          {...register('nisn')} 
                          onInput={handleNumericInput('nisn', 10)}
                          className={cn(inputClass, errors.nisn && "border-red-500")} 
                          placeholder="NISN (4–10 digit angka)" 
                          minLength={4}
                          maxLength={10}
                        />
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
                                    "justify-start text-left flex items-center cursor-pointer",
                                    !field.value && "text-gray-400 font-normal",
                                    errors.tanggalLahir && "border-red-500"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4 text-[#00AA13]" />
                                  {field.value && parseDateString(field.value) ? (
                                    format(parseDateString(field.value)!, "PPP", { locale: idLocale })
                                  ) : (
                                    <span>Pilih tanggal lahir</span>
                                  )}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0 bg-white shadow-2xl border border-gray-100 rounded-2xl" align="start">
                                <Calendar
                                  mode="single"
                                  captionLayout="dropdown"
                                  startMonth={new Date(new Date().getFullYear() - 15, 0)}
                                  endMonth={new Date()}
                                  locale={idLocale}
                                  selected={parseDateString(field.value)}
                                  onSelect={(date) => {
                                    setValue(
                                      'tanggalLahir',
                                      date ? format(date, 'yyyy-MM-dd') : '',
                                      {
                                        shouldValidate: true,
                                        shouldDirty: true,
                                        shouldTouch: true,
                                      },
                                    );
                                    setIsCalendarOpen(false);
                                  }}
                                  defaultMonth={parseDateString(field.value) || new Date(new Date().getFullYear() - 7, 0)}
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
                            <Select onValueChange={(val) => { field.onChange(val); clearErrors('jenisKelamin'); }} value={field.value || undefined}>
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
                            <Select onValueChange={(val) => { field.onChange(val); clearErrors('tingkatPrestasi'); }} value={field.value || undefined}>
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
                                const prev = field.value;
                                field.onChange(val);
                                clearErrors('provinsi');
                                if (prev && prev !== val) {
                                  setValue('kota', '');
                                  setValue('kecamatan', '');
                                  setValue('kelurahan', '');
                                }
                                const prov = provinces.find(p => p.name === val);
                                if (prov) fetchRegencies(prov.id);
                              }}
                              value={field.value || undefined}
                            >
                              <SelectTrigger className={errors.provinsi ? "border-red-500" : ""}>
                                <SelectValue placeholder={wilayahLoading.provinces ? "Memuat..." : "Pilih Provinsi"} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.value && !provinces.some(p => p.name === field.value) && (
                                  <SelectItem key={field.value} value={field.value}>{field.value}</SelectItem>
                                )}
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
                                const prev = field.value;
                                field.onChange(val);
                                clearErrors('kota');
                                if (prev && prev !== val) {
                                  setValue('kecamatan', '');
                                  setValue('kelurahan', '');
                                }
                                const kota = regencies.find(r => r.name === val);
                                if (kota) fetchDistricts(kota.id);
                              }}
                              value={field.value || undefined}
                              disabled={!provinsiVal}
                            >
                              <SelectTrigger className={errors.kota ? "border-red-500" : ""}>
                                <SelectValue placeholder={wilayahLoading.regencies ? "Memuat..." : "Pilih Kota/Kabupaten"} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.value && !regencies.some(r => r.name === field.value) && (
                                  <SelectItem key={field.value} value={field.value}>{field.value}</SelectItem>
                                )}
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
                                const prev = field.value;
                                field.onChange(val);
                                clearErrors('kecamatan');
                                if (prev && prev !== val) {
                                  setValue('kelurahan', '');
                                }
                                const kec = districts.find(d => d.name === val);
                                if (kec) fetchVillages(kec.id);
                              }}
                              value={field.value || undefined}
                              disabled={!kotaVal}
                            >
                              <SelectTrigger className={errors.kecamatan ? "border-red-500" : ""}>
                                <SelectValue placeholder={wilayahLoading.districts ? "Memuat..." : "Pilih Kecamatan"} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.value && !districts.some(d => d.name === field.value) && (
                                  <SelectItem key={field.value} value={field.value}>{field.value}</SelectItem>
                                )}
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
                              onValueChange={(val) => {
                                field.onChange(val);
                                clearErrors('kelurahan');
                              }}
                              value={field.value || undefined}
                              disabled={!kecamatanVal}
                            >
                              <SelectTrigger className={errors.kelurahan ? "border-red-500" : ""}>
                                <SelectValue placeholder={wilayahLoading.villages ? "Memuat..." : "Pilih Kelurahan/Desa"} />
                              </SelectTrigger>
                              <SelectContent>
                                {field.value && !villages.some(v => v.name === field.value) && (
                                  <SelectItem key={field.value} value={field.value}>{field.value}</SelectItem>
                                )}
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
                        <textarea 
                          id="alamatJalan" 
                          rows={2}
                          {...register('alamatJalan')} 
                          className={cn(
                            "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm hover:border-gray-300 focus:border-[#00AA13] focus:ring-2 focus:ring-[#00AA13]/20 outline-none transition-all shadow-xs placeholder:text-gray-400 resize-none leading-relaxed",
                            errors.alamatJalan && "border-red-500"
                          )} 
                          placeholder="Contoh: Jl. Merdeka No. 10, Blok C" 
                        />
                        {errors.alamatJalan && <p className="text-red-500 text-xs mt-1">{errors.alamatJalan.message}</p>}
                      </div>

                      {/* 6. RT */}
                      <div className="space-y-1.5 col-span-1 lg:col-span-1">
                        <label htmlFor="rt" className="text-sm font-medium text-gray-700">RT *</label>
                        <input 
                          id="rt" 
                          {...register('rt')} 
                          onInput={handleNumericInput('rt', 3)}
                          className={cn(inputClass, errors.rt && "border-red-500")} 
                          placeholder="01" 
                          maxLength={3} 
                        />
                        {errors.rt && <p className="text-red-500 text-xs mt-1">{errors.rt.message}</p>}
                      </div>

                      {/* 7. RW */}
                      <div className="space-y-1.5 col-span-1 lg:col-span-1">
                        <label htmlFor="rw" className="text-sm font-medium text-gray-700">RW *</label>
                        <input 
                          id="rw" 
                          {...register('rw')} 
                          onInput={handleNumericInput('rw', 3)}
                          className={cn(inputClass, errors.rw && "border-red-500")} 
                          placeholder="02" 
                          maxLength={3} 
                        />
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
                                clearErrors('bekerjaDiDirektorat2');
                                if (val === 'Tidak') {
                                  setValue('namaOrangtuaDirektorat2', '');
                                  setValue('unitOrangtuaDirektorat2', '');
                                  clearErrors(['namaOrangtuaDirektorat2', 'unitOrangtuaDirektorat2']);
                                }
                              }} 
                              value={field.value || undefined}
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
                        <>
                        <div className="space-y-1.5">
                          <label htmlFor="namaOrangtuaDirektorat2" className="text-sm font-medium text-gray-700">Nama orang tua yang bekerja *</label>
                          <input 
                            id="namaOrangtuaDirektorat2"
                            {...register('namaOrangtuaDirektorat2', {
                              onChange: () => {
                                if (errors.namaOrangtuaDirektorat2) {
                                  clearErrors('namaOrangtuaDirektorat2');
                                }
                              }
                            })} 
                            className={cn(inputClass, errors.namaOrangtuaDirektorat2 && "border-red-500")}
                            placeholder="Masukkan nama orang tua"
                          />
                          {errors.namaOrangtuaDirektorat2 && <p className="text-red-500 text-xs mt-1">{errors.namaOrangtuaDirektorat2.message}</p>}
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Berada di unit mana? *</label>
                          <Controller
                            control={control}
                            name="unitOrangtuaDirektorat2"
                            render={({ field }) => (
                              <Select onValueChange={(val) => { field.onChange(val); clearErrors('unitOrangtuaDirektorat2'); }} value={field.value || undefined}>
                                <SelectTrigger className={errors.unitOrangtuaDirektorat2 ? "border-red-500" : ""}>
                                  <SelectValue placeholder="Pilih Unit" />
                                </SelectTrigger>
                                <SelectContent>
                                  {DIRECTORATE_2_UNITS.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          {errors.unitOrangtuaDirektorat2 && <p className="text-red-500 text-xs mt-1">{errors.unitOrangtuaDirektorat2.message}</p>}
                        </div>
                        </>
                      )}

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Apakah mempunyai saudara yang bersekolah di unit Direktorat 2? *</label>
                        <Controller
                          control={control}
                          name="saudaraDiDirektorat2"
                          render={({ field }) => (
                            <Select
                              onValueChange={(val) => {
                                field.onChange(val);
                                clearErrors('saudaraDiDirektorat2');
                                if (val === 'Tidak') {
                                  setValue('namaSaudaraDirektorat2', '');
                                  setValue('unitSaudaraDirektorat2', '');
                                  clearErrors(['namaSaudaraDirektorat2', 'unitSaudaraDirektorat2']);
                                }
                              }}
                              value={field.value || undefined}
                            >
                              <SelectTrigger className={errors.saudaraDiDirektorat2 ? "border-red-500" : ""}>
                                <SelectValue placeholder="Pilih Jawaban" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Ya">Ya</SelectItem>
                                <SelectItem value="Tidak">Tidak</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        />
                        {errors.saudaraDiDirektorat2 && <p className="text-red-500 text-xs mt-1">{errors.saudaraDiDirektorat2.message}</p>}
                      </div>

                      {saudaraDiDirektorat2 === 'Ya' && (
                        <>
                          <div className="space-y-1.5">
                            <label htmlFor="namaSaudaraDirektorat2" className="text-sm font-medium text-gray-700">Nama saudara *</label>
                            <input
                              id="namaSaudaraDirektorat2"
                              {...register('namaSaudaraDirektorat2', {
                                onChange: () => clearErrors('namaSaudaraDirektorat2'),
                              })}
                              className={cn(inputClass, errors.namaSaudaraDirektorat2 && "border-red-500")}
                              placeholder="Masukkan nama saudara"
                            />
                            {errors.namaSaudaraDirektorat2 && <p className="text-red-500 text-xs mt-1">{errors.namaSaudaraDirektorat2.message}</p>}
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-700">Bersekolah di unit mana? *</label>
                            <Controller
                              control={control}
                              name="unitSaudaraDirektorat2"
                              render={({ field }) => (
                                <Select onValueChange={(val) => { field.onChange(val); clearErrors('unitSaudaraDirektorat2'); }} value={field.value || undefined}>
                                  <SelectTrigger className={errors.unitSaudaraDirektorat2 ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Pilih Unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DIRECTORATE_2_UNITS.map((unit) => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                            {errors.unitSaudaraDirektorat2 && <p className="text-red-500 text-xs mt-1">{errors.unitSaudaraDirektorat2.message}</p>}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn("space-y-6", currentStep !== 1 && "hidden")}>
                <div className="mb-4 sm:mb-6">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#00AA13]/10 flex items-center justify-center text-[#00AA13] shrink-0">
                      <Users size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">Data Orang Tua / Wali</h3>
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
                        <input id="namaAyah" {...register('namaAyah')} className={cn(inputClass, errors.namaAyah && "border-red-500")} placeholder="Nama lengkap Ayah" />
                        {errors.namaAyah && <p className="text-red-500 text-xs mt-1">{errors.namaAyah.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="nikAyah" className="text-sm font-medium text-gray-700">NIK Ayah *</label>
                        <input 
                          id="nikAyah" 
                          {...register('nikAyah')} 
                          onInput={handleNumericInput('nikAyah', 16)}
                          className={cn(inputClass, errors.nikAyah && "border-red-500")} 
                          placeholder="16 Digit NIK Ayah"
                          maxLength={16} 
                        />
                        {errors.nikAyah && <p className="text-red-500 text-xs mt-1">{errors.nikAyah.message}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Pendidikan Ayah *</label>
                        <Controller
                          control={control}
                          name="pendidikanAyah"
                          render={({ field }) => (
                            <Select onValueChange={(val) => { field.onChange(val); clearErrors('pendidikanAyah'); }} value={field.value || undefined}>
                              <SelectTrigger className={errors.pendidikanAyah ? "border-red-500" : ""}>
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
                        <input id="pekerjaanAyah" {...register('pekerjaanAyah')} className={cn(inputClass, errors.pekerjaanAyah && "border-red-500")} placeholder="Contoh: Karyawan Swasta" />
                        {errors.pekerjaanAyah && <p className="text-red-500 text-xs mt-1">{errors.pekerjaanAyah.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Penghasilan Per Bulan *</label>
                        <Controller
                          control={control}
                          name="penghasilanAyah"
                          render={({ field }) => (
                            <Select onValueChange={(val) => { field.onChange(val); clearErrors('penghasilanAyah'); }} value={field.value || undefined}>
                              <SelectTrigger className={errors.penghasilanAyah ? "border-red-500" : ""}>
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
                        <input 
                          id="teleponAyah" 
                          {...register('teleponAyah', { onBlur: () => formatWhatsApp('teleponAyah') })} 
                          onInput={handleNumericInput('teleponAyah', 15)}
                          className={cn(inputClass, errors.teleponAyah && "border-red-500")} 
                          placeholder="Contoh: 08123456789" 
                          maxLength={15}
                        />
                        {errors.teleponAyah && <p className="text-red-500 text-xs mt-1">{errors.teleponAyah.message}</p>}
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                          <label htmlFor="alamatAyah" className="text-sm font-medium text-gray-700">Alamat Ayah *</label>
                          <label className="flex items-center gap-2 text-xs font-semibold text-[#00AA13] bg-[#00AA13]/10 px-3.5 py-1.5 rounded-full cursor-pointer hover:bg-[#00AA13]/20 transition-colors w-fit select-none">
                            <input 
                              type="checkbox" 
                              className="rounded text-[#00AA13] focus:ring-[#00AA13] cursor-pointer w-4 h-4 accent-[#00AA13]"
                              onChange={(e) => handleCopyAddress('alamatAyah', e.target.checked)}
                            />
                            <span>Alamat sama dengan tempat tinggal anak</span>
                          </label>
                        </div>
                        <textarea 
                          id="alamatAyah" 
                          rows={3}
                          {...register('alamatAyah')} 
                          className={cn(
                            "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm hover:border-gray-300 focus:border-[#00AA13] focus:ring-2 focus:ring-[#00AA13]/20 outline-none transition-all shadow-xs placeholder:text-gray-400 resize-none leading-relaxed",
                            errors.alamatAyah && "border-red-500"
                          )} 
                          placeholder="Masukkan alamat lengkap domisili Ayah..."
                        />
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
                        <input id="namaIbu" {...register('namaIbu')} className={cn(inputClass, errors.namaIbu && "border-red-500")} placeholder="Nama lengkap Ibu" />
                        {errors.namaIbu && <p className="text-red-500 text-xs mt-1">{errors.namaIbu.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label htmlFor="nikIbu" className="text-sm font-medium text-gray-700">NIK Ibu *</label>
                        <input 
                          id="nikIbu" 
                          {...register('nikIbu')} 
                          onInput={handleNumericInput('nikIbu', 16)}
                          className={cn(inputClass, errors.nikIbu && "border-red-500")} 
                          placeholder="16 Digit NIK Ibu"
                          maxLength={16} 
                        />
                        {errors.nikIbu && <p className="text-red-500 text-xs mt-1">{errors.nikIbu.message}</p>}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Pendidikan Ibu *</label>
                        <Controller
                          control={control}
                          name="pendidikanIbu"
                          render={({ field }) => (
                            <Select onValueChange={(val) => { field.onChange(val); clearErrors('pendidikanIbu'); }} value={field.value || undefined}>
                              <SelectTrigger className={errors.pendidikanIbu ? "border-red-500" : ""}>
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
                        <input id="pekerjaanIbu" {...register('pekerjaanIbu')} className={cn(inputClass, errors.pekerjaanIbu && "border-red-500")} placeholder="Contoh: Ibu Rumah Tangga / PNS" />
                        {errors.pekerjaanIbu && <p className="text-red-500 text-xs mt-1">{errors.pekerjaanIbu.message}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Penghasilan Per Bulan *</label>
                        <Controller
                          control={control}
                          name="penghasilanIbu"
                          render={({ field }) => (
                            <Select onValueChange={(val) => { field.onChange(val); clearErrors('penghasilanIbu'); }} value={field.value || undefined}>
                              <SelectTrigger className={errors.penghasilanIbu ? "border-red-500" : ""}>
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
                        <input 
                          id="teleponIbu" 
                          {...register('teleponIbu', { onBlur: () => formatWhatsApp('teleponIbu') })} 
                          onInput={handleNumericInput('teleponIbu', 15)}
                          className={cn(inputClass, errors.teleponIbu && "border-red-500")} 
                          placeholder="Contoh: 08123456789" 
                          maxLength={15}
                        />
                        {errors.teleponIbu && <p className="text-red-500 text-xs mt-1">{errors.teleponIbu.message}</p>}
                      </div>
                      <div className="space-y-1.5 md:col-span-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                          <label htmlFor="alamatIbu" className="text-sm font-medium text-gray-700">Alamat Ibu *</label>
                          <label className="flex items-center gap-2 text-xs font-semibold text-[#00AA13] bg-[#00AA13]/10 px-3.5 py-1.5 rounded-full cursor-pointer hover:bg-[#00AA13]/20 transition-colors w-fit select-none">
                            <input 
                              type="checkbox" 
                              className="rounded text-[#00AA13] focus:ring-[#00AA13] cursor-pointer w-4 h-4 accent-[#00AA13]"
                              onChange={(e) => handleCopyAddress('alamatIbu', e.target.checked)}
                            />
                            <span>Alamat sama dengan tempat tinggal anak</span>
                          </label>
                        </div>
                        <textarea 
                          id="alamatIbu" 
                          rows={3}
                          {...register('alamatIbu')} 
                          className={cn(
                            "w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm hover:border-gray-300 focus:border-[#00AA13] focus:ring-2 focus:ring-[#00AA13]/20 outline-none transition-all shadow-xs placeholder:text-gray-400 resize-none leading-relaxed",
                            errors.alamatIbu && "border-red-500"
                          )} 
                          placeholder="Masukkan alamat lengkap domisili Ibu..."
                        />
                        {errors.alamatIbu && <p className="text-red-500 text-xs mt-1">{errors.alamatIbu.message}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn("space-y-6", currentStep !== 2 && "hidden")}>
            {/* Step 3 Header & Completeness Tracker */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-emerald-50/40 via-white to-gray-50/70 rounded-2xl border border-emerald-100 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#00AA13]/10 text-[#00AA13] flex items-center justify-center shrink-0 shadow-xs">
                    <FileText size={20} className="stroke-[2.2]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                      Unggah Dokumen Wajib
                    </h3>
                    <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
                      Wajib mengunggah 4 berkas dokumen untuk kelengkapan pendaftaran.
                    </p>
                  </div>
                </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 bg-white px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl border border-gray-200/80 shadow-2xs shrink-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] sm:text-xs font-semibold text-gray-600">Status:</span>
                        <span className={cn(
                          "text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded-md",
                          Object.keys(uploadedFiles).length === DOCUMENTS.length
                            ? "bg-green-100 text-green-800 font-extrabold"
                            : "bg-amber-50 text-amber-800 border border-amber-200/60"
                        )}>
                          {Object.keys(uploadedFiles).length === DOCUMENTS.length
                            ? "4/4 Lengkap ✓"
                            : `${Object.keys(uploadedFiles).length} dari 4 Berkas`}
                        </span>
                      </div>
                      <div className="w-20 sm:w-28 h-2 bg-gray-100 rounded-full overflow-hidden border border-gray-200/50">
                        <div
                          className="h-full bg-[#00AA13] transition-all duration-300 rounded-full"
                          style={{ width: `${(Object.keys(uploadedFiles).length / DOCUMENTS.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {uploadError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold flex items-start gap-2.5 shadow-xs"
                  >
                    <span className="text-sm">⚠️</span>
                    <p className="flex-1 leading-relaxed">{uploadError}</p>
                  </motion.div>
                )}

                {/* 4 Mandatory Document Cards */}
                <div className="grid md:grid-cols-2 gap-5">
                  {DOCUMENTS.map((doc) => (
                    <DocumentUploadCard
                      key={doc.id}
                      doc={doc}
                      file={uploadedFiles[doc.id]}
                      previewUrl={previewUrls[doc.id]}
                      onSelect={(docId, file) => {
                        setUploadedFiles((prev) => ({ ...prev, [docId]: file }));
                        setMissingDocErrors((prev) => prev.filter((id) => id !== docId));
                        setUploadError(null);
                        if (file.type.startsWith('image/')) {
                          const url = URL.createObjectURL(file);
                          setPreviewUrls((prev) => ({ ...prev, [docId]: url }));
                        } else {
                          setPreviewUrls((prev) => {
                            const next = { ...prev };
                            delete next[docId];
                            return next;
                          });
                        }
                      }}
                      onRemove={(docId) => {
                        setUploadedFiles((prev) => {
                          const next = { ...prev };
                          delete next[docId];
                          return next;
                        });
                        setPreviewUrls((prev) => {
                          const next = { ...prev };
                          if (next[docId]) {
                            URL.revokeObjectURL(next[docId]);
                            delete next[docId];
                          }
                          return next;
                        });
                      }}
                      onError={(err) => setUploadError(err)}
                      isHighlightedError={missingDocErrors.includes(doc.id)}
                    />
                  ))}
                </div>
              </div>

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
                  window.location.reload();
                }}
                className="px-8 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-colors shadow-lg hover:shadow-xl cursor-pointer"
              >
                Kembali ke Beranda
              </button>
            </motion.div>
          )}

          {/* Bottom Stepper Indicator (Alur Rapi & Seimbang) */}
          {currentStep < 3 && (
            <div className="mt-12 pt-8 border-t border-gray-100">
              <div className="relative w-full max-w-lg mx-auto mb-8 px-2">
                {/* Continuous Connector Line Behind Circles */}
                <div className="absolute top-4 sm:top-4.5 left-[12.5%] right-[12.5%] h-[2px] bg-gray-200 z-0">
                  <motion.div
                    className="h-full bg-[#00AA13]"
                    initial={false}
                    animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                  />
                </div>

                {/* 4 Steps Grid (Equal 25% Width Columns) */}
                <div className="grid grid-cols-4 relative z-10">
                  {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isCompleted = idx < currentStep;
                    const isActive = idx === currentStep;
                    const isUpcoming = idx > currentStep;

                    return (
                      <div key={step.id} className="flex flex-col items-center text-center">
                        {/* Step Circle Badge */}
                        <motion.div
                          animate={{ scale: isActive ? 1.05 : 1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className={cn(
                            "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-300 ring-4 ring-white",
                            isCompleted && "bg-[#00AA13] text-white shadow-xs",
                            isActive && "bg-[#00AA13] text-white ring-4 ring-[#00AA13]/25 shadow-sm font-bold",
                            isUpcoming && "bg-gray-100 text-gray-400 border border-gray-200"
                          )}
                        >
                          {isCompleted ? (
                            <Check size={15} strokeWidth={2.8} />
                          ) : (
                            <StepIcon size={15} />
                          )}
                        </motion.div>

                        {/* Label */}
                        <span
                          className={cn(
                            "text-[10px] sm:text-xs font-semibold tracking-tight mt-1.5 transition-colors line-clamp-1 sm:line-clamp-none px-0.5",
                            isCompleted && "text-[#00AA13]",
                            isActive && "text-gray-900 font-bold",
                            isUpcoming && "text-gray-400"
                          )}
                        >
                          {step.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Buttons (Mobile Optimized) */}
              <div className="flex items-center justify-between gap-2 sm:gap-3 pt-2 w-full">
                {currentStep > 0 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex items-center justify-center gap-1 px-3.5 sm:px-6 py-2.5 sm:py-3 rounded-full text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all cursor-pointer shadow-xs shrink-0"
                  >
                    <ChevronLeft size={16} className="shrink-0" />
                    <span>Sebelumnya</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 2 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 sm:px-8 py-2.5 sm:py-3 bg-[#00AA13] hover:bg-[#00880F] active:scale-95 text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#00AA13]/30 hover:shadow-lg hover:shadow-[#00AA13]/40 cursor-pointer min-w-0 ml-auto"
                  >
                    <span>Selanjutnya</span>
                    <ChevronRight size={16} className="shrink-0" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit, onFormError)}
                    disabled={isSubmitting}
                    className={cn(
                      "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-8 py-2.5 sm:py-3.5 bg-[#00AA13] text-white rounded-full text-xs sm:text-sm font-semibold transition-all shadow-md shadow-[#00AA13]/30 hover:shadow-lg hover:shadow-[#00AA13]/40 cursor-pointer min-w-0 ml-auto",
                      isSubmitting ? "opacity-80 cursor-wait" : "hover:bg-[#00880F] active:scale-95"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin shrink-0" />
                        <span className="truncate">{uploadStatusMessage || 'Memproses...'}</span>
                      </>
                    ) : Object.keys(uploadedFiles).length === DOCUMENTS.length ? (
                      <>
                        <span className="truncate">Kirim Pendaftaran</span>
                        <span className="text-[11px] opacity-90 hidden sm:inline">(4/4 Lengkap)</span>
                        <CheckCircle2 size={16} className="shrink-0" />
                      </>
                    ) : (
                      <>
                        <span className="truncate">Lengkapi Berkas</span>
                        <span className="font-bold text-[10px] sm:text-[11px] bg-white/20 px-1.5 py-0.5 rounded-full shrink-0">
                          {Object.keys(uploadedFiles).length}/4
                        </span>
                        <ChevronRight size={15} className="shrink-0" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleFinalSubmit}
        isSubmitting={isSubmitting}
        uploadStatusMessage={uploadStatusMessage}
        formData={pendingFormData}
        uploadedCount={Object.keys(uploadedFiles).length}
        totalCount={DOCUMENTS.length}
      />
    </div>
  );
}
