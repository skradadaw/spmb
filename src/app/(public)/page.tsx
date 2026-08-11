import Link from 'next/link';
import { ArrowRight, BookOpen, GraduationCap, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-[family-name:var(--font-geist-sans)]">
      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20 mix-blend-multiply" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center py-20 lg:py-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 font-semibold text-sm mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            Pendaftaran TA 2027/2028 Dibuka
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8">
            SD Plus 3 <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Al-Muhajirin</span>
          </h1>
          
          <p className="mt-4 max-w-2xl text-xl text-gray-600 mx-auto mb-10 leading-relaxed">
            Membangun generasi cerdas, berakhlak mulia, dan siap menghadapi tantangan masa depan melalui pendidikan berbasis karakter dan teknologi.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/pendaftaran" 
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-1"
            >
              Daftar Sekarang
              <ArrowRight size={20} />
            </Link>
            <Link 
              href="#info" 
              className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-8 py-4 rounded-full font-bold text-lg transition-all shadow-sm"
            >
              Info Lebih Lanjut
            </Link>
          </div>
        </div>
      </main>

      {/* Feature Highlights */}
      <section id="info" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 text-center">
            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100">
              <div className="w-14 h-14 mx-auto bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/20">
                <GraduationCap size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Kurikulum Unggulan</h3>
              <p className="text-gray-600">Perpaduan kurikulum nasional dan nilai-nilai Islami yang komprehensif.</p>
            </div>
            <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100">
              <div className="w-14 h-14 mx-auto bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-600/20">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Tenaga Pendidik Profesional</h3>
              <p className="text-gray-600">Guru-guru berpengalaman yang berdedikasi membimbing potensi anak.</p>
            </div>
            <div className="p-6 rounded-3xl bg-purple-50 border border-purple-100">
              <div className="w-14 h-14 mx-auto bg-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-600/20">
                <BookOpen size={28} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fasilitas Modern</h3>
              <p className="text-gray-600">Lingkungan belajar yang nyaman, aman, dan dilengkapi teknologi terkini.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 text-center">
        <p>&copy; 2027 SD Plus 3 Al-Muhajirin. All rights reserved.</p>
      </footer>
    </div>
  );
}
