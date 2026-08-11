import RegistrationForm from '@/components/RegistrationForm';

export default function PendaftaranPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-1/4 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl" />
      </div>

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
