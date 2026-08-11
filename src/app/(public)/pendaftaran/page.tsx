import RegistrationForm from '@/features/registration/components/RegistrationForm';

export default function PendaftaranPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl mb-4">
            Pendaftaran Murid Baru
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            SD Plus 3 Al-Muhajirin Tahun Ajaran 2027/2028. Silakan lengkapi formulir di bawah ini dengan data yang valid.
          </p>
        </div>

        <RegistrationForm />
      </div>
    </div>
  );
}
