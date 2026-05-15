import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../../components/common/GlassCard';
import { ArrowRight, BookOpen, Users, Image as ImageIcon, Bell } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Users className="w-6 h-6 text-indigo-400" />,
      title: "People Gallery",
      desc: "Meet our brilliant minds and relive our memories."
    },
    {
      icon: <BookOpen className="w-6 h-6 text-emerald-400" />,
      title: "Study Suite",
      desc: "Track progress, routines, and get AI-powered study plans."
    },
    {
      icon: <Bell className="w-6 h-6 text-amber-400" />,
      title: "Class Alerts",
      desc: "Never miss a CT or class with our integrated calendar."
    }
  ];

  return (
    <div className="pt-24 pb-20 px-4 min-h-screen relative overflow-hidden">
      {/* Background Atmosphere */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] glow-indigo blur-[100px] opacity-40"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] glow-pink blur-[120px] opacity-30"></div>
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto py-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-[11px] font-black uppercase tracking-[0.2em] mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            PHYSICS 23 - TACHYON
          </div>
          <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter leading-none text-white">
            Future of Our <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">Classroom.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
            The all-in-one digital campus for our batch. Connect with classmates, track your studies, and ace your exams with Gemini AI.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link
              to="/login"
              className="group bg-white text-black px-10 py-4 rounded-2xl font-black text-sm flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-white/10 w-full sm:w-auto uppercase tracking-widest"
            >
              Enter Hub
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/people"
              className="bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 px-10 py-4 rounded-2xl font-black text-sm w-full sm:w-auto transition-all uppercase tracking-widest"
            >
              The People
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-7xl mx-auto py-24 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
            >
              <GlassCard className="h-full border-white/10 bg-white/[0.02] p-8">
                <div className="bg-gradient-to-br from-indigo-500/20 to-pink-500/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 border border-white/10 shadow-inner">
                  {f.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white tracking-tight">{f.title}</h3>
                <p className="text-gray-400 leading-relaxed font-medium">{f.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery Highlight */}
      <section className="max-w-7xl mx-auto py-24 relative z-10">
        <GlassCard className="p-0 border-white/5 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[500px]">
            <div className="p-12 lg:p-20 flex flex-col justify-center">
              <div className="w-12 h-1 bg-gradient-to-r from-indigo-500 to-pink-500 mb-8 rounded-full"></div>
              <h2 className="text-5xl font-bold mb-8 text-white tracking-tighter">Moments That Matter</h2>
              <p className="text-gray-400 text-lg mb-10 leading-relaxed font-medium">
                From late-night study sessions to campus adventures, every photo tells a unique story of our journey together.
              </p>
              <Link to="/album" className="flex items-center gap-3 text-indigo-400 font-black uppercase tracking-widest text-sm group">
                Enter Gallery <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 p-8 relative overflow-hidden">
              <div className="rounded-3xl overflow-hidden saturate-0 hover:saturate-100 transition-all duration-700 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&h=500&fit=crop" className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" alt="Class" />
              </div>
              <div className="rounded-3xl overflow-hidden translate-y-12 saturate-0 hover:saturate-100 transition-all duration-700 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=500&h=500&fit=crop" className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" alt="Tour" />
              </div>
              <div className="rounded-3xl overflow-hidden -translate-y-6 saturate-0 hover:saturate-100 transition-all duration-700 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?w=500&h=500&fit=crop" className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" alt="Event" />
              </div>
              <div className="rounded-3xl overflow-hidden translate-y-6 saturate-0 hover:saturate-100 transition-all duration-700 shadow-2xl">
                <img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=500&fit=crop" className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" alt="Random" />
              </div>
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}
