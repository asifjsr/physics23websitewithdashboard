import React from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Target, Users, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export default function About() {
  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-black mb-6">Our Journey</h1>
          <p className="text-xl text-slate-400">ClassVerse is more than just a website. It's the digital heartbeat of Batch 2024-28.</p>
        </motion.div>

        <div className="space-y-12">
          <GlassCard className="bg-white/[0.02] border-none p-8">
            <div className="flex gap-6 items-start">
              <div className="bg-indigo-600/20 p-4 rounded-2xl">
                <Target className="w-8 h-8 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
                <p className="text-slate-400 leading-relaxed italic">
                  "To foster a culture of collaborative learning, ensuring every student in our batch has the tools, resources, and emotional support to excel in their academic and personal journey."
                </p>
              </div>
            </div>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GlassCard className="bg-white/[0.02] border-none">
              <Users className="w-10 h-10 text-emerald-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Community First</h3>
              <p className="text-slate-400">We believe that no student should struggle alone. Our platform promotes shared notes and collective growth.</p>
            </GlassCard>
            <GlassCard className="bg-white/[0.02] border-none">
              <Heart className="w-10 h-10 text-rose-400 mb-6" />
              <h3 className="text-xl font-bold mb-3">Lived Memories</h3>
              <p className="text-slate-400">From the first orientation to the final graduation, we capture every milestone that shapes our legacy.</p>
            </GlassCard>
          </div>

          <GlassCard className="bg-indigo-600/10 border-indigo-500/20 p-10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users className="w-32 h-32" />
             </div>
             <h2 className="text-2xl font-bold mb-4">Department of Science</h2>
             <p className="text-slate-300 mb-6 font-medium">University of Excellence • Batch 2024-28</p>
             <p className="text-slate-400">
               Founded on the principles of innovation and integrity, our department has been a hub for pioneers for over three decades. Our batch continues this tradition with passion and purpose.
             </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
