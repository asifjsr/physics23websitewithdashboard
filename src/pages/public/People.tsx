import React from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { Search } from 'lucide-react';
import { motion } from 'motion/react';

const PEOPLE = [
  { id: "231701", name: "NAWSHIN KHAN", role: "Student", image: "https://i.pravatar.cc/150?u=231701", quote: "Making memories that last a lifetime." },
  { id: "231703", name: "ANIKA TASNIM", role: "Student", image: "https://i.pravatar.cc/150?u=231703", quote: "Making memories that last a lifetime." },
  { id: "231705", name: "APU KUMER PAL", role: "Student", image: "https://i.pravatar.cc/150?u=231705", quote: "Making memories that last a lifetime." },
  { id: "231708", name: "MST. FARJANA MAHIN", role: "Student", image: "https://i.pravatar.cc/150?u=231708", quote: "Making memories that last a lifetime." },
  { id: "231709", name: "MD. SAIFUL ISLAM MANIK", role: "Student", image: "https://i.pravatar.cc/150?u=231709", quote: "Making memories that last a lifetime." },
  { id: "231710", name: "SEJANUR RAHMAN SEJAN", role: "Student", image: "https://i.pravatar.cc/150?u=231710", quote: "Making memories that last a lifetime." },
  { id: "231711", name: "MST. TANIMA JANNAT HASHI", role: "Student", image: "https://i.pravatar.cc/150?u=231711", quote: "Making memories that last a lifetime." },
  { id: "231713", name: "MD. SHAKIB", role: "Class Representative", image: "https://i.pravatar.cc/150?u=231713", quote: "Making memories that last a lifetime." },
  { id: "231715", name: "JANNATULL SABDID", role: "Student", image: "https://i.pravatar.cc/150?u=231715", quote: "Making memories that last a lifetime." },
  { id: "231718", name: "FARDIN AL ZAWAD FAHIM", role: "Student", image: "https://i.pravatar.cc/150?u=231718", quote: "Making memories that last a lifetime." },
  { id: "231719", name: "MD. ASIF KHAN", role: "Student", image: "https://lh3.googleusercontent.com/d/1oAgNKQhVWd7QyytSphvZ0aBpR7qSunoG", quote: "Leading Physics 23 to excellence." },
  { id: "231720", name: "MONOARUL ISLAM FAHIM", role: "Student", image: "https://i.pravatar.cc/150?u=231720", quote: "Making memories that last a lifetime." },
  { id: "231722", name: "MAHIR MAHDI", role: "Student", image: "https://i.pravatar.cc/150?u=231722", quote: "Making memories that last a lifetime." },
  { id: "231723", name: "AFIA ANISA", role: "Student", image: "https://i.pravatar.cc/150?u=231723", quote: "Making memories that last a lifetime." },
  { id: "231729", name: "MST.MODINA KHATUN", role: "Student", image: "https://i.pravatar.cc/150?u=231729", quote: "Making memories that last a lifetime." },
  { id: "231730", name: "MAHATHIR MOHAMMAD", role: "Student", image: "https://i.pravatar.cc/150?u=231730", quote: "Making memories that last a lifetime." },
  { id: "231734", name: "TAHSIN AHMED MAHIM", role: "Student", image: "https://i.pravatar.cc/150?u=231734", quote: "Making memories that last a lifetime." },
  { id: "231735", name: "SOHAN SARDER", role: "Student", image: "https://i.pravatar.cc/150?u=231735", quote: "Making memories that last a lifetime." },
  { id: "231736", name: "JEET DAY", role: "Student", image: "https://i.pravatar.cc/150?u=231736", quote: "Making memories that last a lifetime." },
  { id: "231737", name: "PROMA DAS RUPA", role: "Student", image: "https://i.pravatar.cc/150?u=231737", quote: "Making memories that last a lifetime." },
  { id: "231739", name: "FAHAD BIN SHARAFAT", role: "Student", image: "https://i.pravatar.cc/150?u=231739", quote: "Making memories that last a lifetime." },
  { id: "231740", name: "SANCHITA MONDAL", role: "Student", image: "https://i.pravatar.cc/150?u=231740", quote: "Making memories that last a lifetime." },
  { id: "231741", name: "MAFUJUR RAHMAN", role: "Student", image: "https://i.pravatar.cc/150?u=231741", quote: "Making memories that last a lifetime." },
  { id: "231742", name: "EZAZ MAHMUD", role: "Student", image: "https://i.pravatar.cc/150?u=231742", quote: "Making memories that last a lifetime." },
  { id: "221703", name: "CHANDAN BALA", role: "Student", image: "https://i.pravatar.cc/150?u=221703", quote: "Making memories that last a lifetime." },
  { id: "221740", name: "Md. Tariqul Islam", role: "Student", image: "https://i.pravatar.cc/150?u=221740", quote: "Making memories that last a lifetime." }
];

export default function People() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filtered = PEOPLE.filter(b => 
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    b.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-32 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-4">Our Community</h1>
            <p className="text-slate-400">The brilliant minds of our class.</p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((member, i) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="group p-4 flex flex-col items-center text-center">
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden mb-4 ring-4 ring-indigo-500/0 group-hover:ring-indigo-500/50 transition-all mx-auto">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-xs text-indigo-400 font-semibold mb-3">{member.role}</p>
                  <div className="text-xs text-slate-500 bg-white/5 py-1 px-3 rounded-full mb-3">
                    ID: {member.id}
                  </div>
                  <p className="text-sm text-slate-400 italic">"{member.quote}"</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
