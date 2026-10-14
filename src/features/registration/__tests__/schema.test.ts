import { describe, expect, it } from 'vitest';
import { formSchema, step1Schema } from '@/features/registration/schema';

const baseValidStep1 = {
  jenisPendaftaran: 'Siswa Baru',
  pilihanKelas: 'Reguler',
  namaLengkap: 'Muhammad Al-Fatih',
  jenisKelamin: 'Laki-laki',
  tempatLahir: 'Purwakarta',
  tanggalLahir: '2019-05-15',
  nik: '3214011505190001',
  nisn: '1234567890',
  bekerjaDiDirektorat2: 'Tidak',
  namaOrangtuaDirektorat2: '',
  unitOrangtuaDirektorat2: '',
  saudaraDiDirektorat2: 'Tidak',
  namaSaudaraDirektorat2: '',
  unitSaudaraDirektorat2: '',
  asalSekolah: 'TK Al-Muhajirin',
  prestasiAnak: '',
  tingkatPrestasi: '',
  jarakKeSekolah: '1.5',
  alamatJalan: 'Jl. Veteran No. 10',
  rt: '01',
  rw: '02',
  kelurahan: 'Nagri Kaler',
  kecamatan: 'Purwakarta',
  kota: 'Kabupaten Purwakarta',
  provinsi: 'Jawa Barat',
  adaPengusul: 'Tidak',
  tipePengusul: '',
  namaTkPengusul: '',
  namaPengusul: '',
  nomorWaPengusul: '',
};

const baseValidStep2 = {
  namaAyah: 'Ahmad Dahlan',
  nikAyah: '3214010101800001',
  pendidikanAyah: 'S1',
  pekerjaanAyah: 'Karyawan Swasta',
  penghasilanAyah: '5-10 Juta',
  teleponAyah: '081234567890',
  alamatAyah: 'Jl. Veteran No. 10',
  namaIbu: 'Siti Walidah',
  nikIbu: '3214010202850001',
  pendidikanIbu: 'S1',
  pekerjaanIbu: 'Guru',
  penghasilanIbu: '2-5 Juta',
  teleponIbu: '081234567891',
  alamatIbu: 'Jl. Veteran No. 10',
};

describe('Registration Form Validation Schema', () => {
  describe('step1Schema with default / no affiliation & no referral', () => {
    it('validates clean data with no referral and no affiliation', () => {
      const result = step1Schema.safeParse(baseValidStep1);
      expect(result.success).toBe(true);
    });
  });

  describe('step1Schema Referral (Pengusul) validation', () => {
    it('validates referral with Guru/Karyawan SD Plus 3', () => {
      const data = {
        ...baseValidStep1,
        adaPengusul: 'Ya',
        tipePengusul: 'Guru/Karyawan SD Plus 3',
        namaPengusul: 'Ustadzah Aminah',
        nomorWaPengusul: '081234567890',
      };
      const result = step1Schema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('validates referral with Kepala TK and origin TK name', () => {
      const data = {
        ...baseValidStep1,
        adaPengusul: 'Ya',
        tipePengusul: 'Kepala TK',
        namaTkPengusul: 'TK Pembina Purwakarta',
        namaPengusul: 'Hj. Rohanah, M.Pd',
        nomorWaPengusul: '085212345678',
      };
      const result = step1Schema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails when adaPengusul is Ya but tipePengusul is missing', () => {
      const data = {
        ...baseValidStep1,
        adaPengusul: 'Ya',
        tipePengusul: '',
        namaPengusul: 'Budi',
        nomorWaPengusul: '081234567890',
      };
      const result = step1Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path.includes('tipePengusul'));
        expect(error?.message).toBe('Kategori pengusul wajib dipilih');
      }
    });

    it('fails when Kepala TK is selected but namaTkPengusul is empty', () => {
      const data = {
        ...baseValidStep1,
        adaPengusul: 'Ya',
        tipePengusul: 'Kepala TK',
        namaTkPengusul: '',
        namaPengusul: 'Hj. Rohanah',
        nomorWaPengusul: '081234567890',
      };
      const result = step1Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path.includes('namaTkPengusul'));
        expect(error?.message).toBe('Nama TK pengusul wajib diisi');
      }
    });

    it('fails when adaPengusul is Ya but namaPengusul is less than 3 chars', () => {
      const data = {
        ...baseValidStep1,
        adaPengusul: 'Ya',
        tipePengusul: 'Guru/Karyawan SD Plus 3',
        namaPengusul: 'Al',
        nomorWaPengusul: '081234567890',
      };
      const result = step1Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path.includes('namaPengusul'));
        expect(error?.message).toBe('Nama lengkap pengusul wajib diisi');
      }
    });

    it('fails when nomorWaPengusul is invalid', () => {
      const data = {
        ...baseValidStep1,
        adaPengusul: 'Ya',
        tipePengusul: 'Guru/Karyawan SD Plus 3',
        namaPengusul: 'Ustadzah Aminah',
        nomorWaPengusul: '12345',
      };
      const result = step1Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path.includes('nomorWaPengusul'));
        expect(error?.message).toBe('Nomor WhatsApp pengusul tidak valid');
      }
    });
  });

  describe('step1Schema Prestasi validation', () => {
    it('requires an achievement name once a level is chosen', () => {
      const result = step1Schema.safeParse({ ...baseValidStep1, tingkatPrestasi: 'Kecamatan', prestasiAnak: '' });
      expect(result.success).toBe(false);
      expect(result.error?.issues.some((issue) => issue.path[0] === 'prestasiAnak')).toBe(true);
    });

    it('accepts a level together with its achievement name', () => {
      expect(step1Schema.safeParse({ ...baseValidStep1, tingkatPrestasi: 'Kecamatan', prestasiAnak: 'Juara 1 Lomba Mewarnai' }).success).toBe(true);
    });

    it('does not ask for a name when there is no achievement', () => {
      expect(step1Schema.safeParse({ ...baseValidStep1, tingkatPrestasi: '', prestasiAnak: '' }).success).toBe(true);
    });
  });

  describe('step1Schema Kelas Tujuan validation', () => {
    it('requires a target grade for Pindahan applicants', () => {
      const result = step1Schema.safeParse({ ...baseValidStep1, jenisPendaftaran: 'Pindahan' });
      expect(result.success).toBe(false);
      expect(result.error?.issues.some((issue) => issue.path[0] === 'kelasTujuan')).toBe(true);
    });

    it('accepts grades 2 through 6 for Pindahan applicants', () => {
      expect(step1Schema.safeParse({ ...baseValidStep1, jenisPendaftaran: 'Pindahan', kelasTujuan: '4' }).success).toBe(true);
      expect(step1Schema.safeParse({ ...baseValidStep1, jenisPendaftaran: 'Pindahan', kelasTujuan: '1' }).success).toBe(false);
    });

    it('does not ask Siswa Baru applicants for a target grade', () => {
      expect(step1Schema.safeParse(baseValidStep1).success).toBe(true);
    });
  });

  describe('step1Schema Direktorat 2 Affiliation validation', () => {
    it('validates parent working at Direktorat 2', () => {
      const data = {
        ...baseValidStep1,
        bekerjaDiDirektorat2: 'Ya',
        namaOrangtuaDirektorat2: 'Ahmad Dahlan',
        unitOrangtuaDirektorat2: 'SD Plus 3 Al-Muhajirin',
      };
      const result = step1Schema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails when parent works at Direktorat 2 but name is missing', () => {
      const data = {
        ...baseValidStep1,
        bekerjaDiDirektorat2: 'Ya',
        namaOrangtuaDirektorat2: '',
        unitOrangtuaDirektorat2: 'SD Plus 3 Al-Muhajirin',
      };
      const result = step1Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path.includes('namaOrangtuaDirektorat2'));
        expect(error?.message).toBe('Nama orang tua yang bekerja wajib diisi');
      }
    });

    it('validates sibling schooling at Direktorat 2', () => {
      const data = {
        ...baseValidStep1,
        saudaraDiDirektorat2: 'Ya',
        namaSaudaraDirektorat2: 'Fatimah Az-Zahra',
        unitSaudaraDirektorat2: 'SMP Fullday Al-Muhajirin',
      };
      const result = step1Schema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('fails when sibling at Direktorat 2 but sibling name is missing', () => {
      const data = {
        ...baseValidStep1,
        saudaraDiDirektorat2: 'Ya',
        namaSaudaraDirektorat2: '',
        unitSaudaraDirektorat2: 'SMP Fullday Al-Muhajirin',
      };
      const result = step1Schema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        const error = result.error.issues.find((i) => i.path.includes('namaSaudaraDirektorat2'));
        expect(error?.message).toBe('Nama saudara wajib diisi');
      }
    });
  });

  describe('Full formSchema validation', () => {
    it('successfully parses complete registration with all new fields', () => {
      const fullData = {
        ...baseValidStep1,
        adaPengusul: 'Ya',
        tipePengusul: 'Kepala TK',
        namaTkPengusul: 'TK Al-Muhajirin',
        namaPengusul: 'Hj. Siti',
        nomorWaPengusul: '081234567890',
        bekerjaDiDirektorat2: 'Ya',
        namaOrangtuaDirektorat2: 'Ahmad Dahlan',
        unitOrangtuaDirektorat2: 'SD Plus 3 Al-Muhajirin',
        ...baseValidStep2,
      };

      const result = formSchema.safeParse(fullData);
      expect(result.success).toBe(true);
    });
  });
});
