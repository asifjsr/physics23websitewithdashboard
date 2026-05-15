import React from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Mail, Facebook, Send, User } from 'lucide-react';
import { motion } from 'motion/react';

export default function Contact() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent! (Demo)");
  };

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black mb-4">Get in Touch</h1>
          <p className="text-slate-400 text-lg">Have a suggestion or need help? Reach out to our class representatives.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            <GlassCard className="bg-white/[0.02] border-none">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-indigo-400" /> Class Representatives
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="font-bold text-white">Alex Johnson</p>
                  <p className="text-sm text-slate-400 mb-2">Class Rep 1</p>
                  <a href="mailto:alex@university.com" className="flex items-center gap-2 text-sm text-indigo-400 hover:underline">
                    <Mail className="w-4 h-4" /> alex@university.com
                  </a>
                </div>
                <div className="pt-4 border-t border-white/5">
                  <p className="font-bold text-white">Sarah Smith</p>
                  <p className="text-sm text-slate-400 mb-2">Class Rep 2</p>
                  <a href="mailto:sarah@university.com" className="flex items-center gap-2 text-sm text-indigo-400 hover:underline">
                    <Mail className="w-4 h-4" /> sarah@university.com
                  </a>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="bg-white/[0.02] border-none">
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <div className="flex flex-col gap-4">
                <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <Facebook className="w-5 h-5 text-blue-500" /> Facebook Group
                </a>
                <a href="#" className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors">
                  <Send className="w-5 h-5 text-sky-500" /> Telegram Channel
                </a>
              </div>
            </GlassCard>
          </div>

          {/* Contact Form */}
          <GlassCard className="lg:col-span-2 p-8 border-none bg-slate-900/50">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="example@email.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Your Message</label>
                <textarea
                  required
                  rows={6}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  placeholder="How can we help you?"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                />
              </div>
              <button
                type="submit"
                className="w-full md:w-auto px-12 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
              >
                Send Message <Send className="w-4 h-4" />
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
