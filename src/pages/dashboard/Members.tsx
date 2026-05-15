import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { User, Mail, Search, MessageSquare, Phone } from 'lucide-react';
import { motion } from 'motion/react';

interface Person {
  id: string;
  studentId: string;
  name: string;
  role: string;
  position?: string;
  discipline: string;
  bio?: string;
  imageUrl?: string;
  facebookUrl?: string;
  linkedinUrl?: string;
}

export default function Members() {
  const [people, setPeople] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'people'), orderBy('studentId', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Person[];
      setPeople(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching people:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const roles = ['All', ...new Set(people.map(p => p.role))];

  const filteredPeople = people.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || p.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-10">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tighter">Batch Directory</h1>
          <p className="text-slate-400 font-medium">Official directory of students and members of Physics 23 - Tachyon.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex bg-white/5 rounded-2xl p-1">
            <select 
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-widest text-slate-300 px-4 py-2 outline-none cursor-pointer"
            >
              {roles.map(role => (
                <option key={role} value={role} className="bg-slate-900">{role}</option>
              ))}
            </select>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text"
              placeholder="Search by name or ID..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPeople.map((person, index) => (
            <motion.div
              key={person.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="h-full border-none bg-white/[0.03] hover:bg-white/[0.05] transition-all group p-0 overflow-hidden text-center">
                <div className="h-24 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 relative">
                  <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                    <div className="w-20 h-20 rounded-full border-4 border-slate-950 bg-slate-900 overflow-hidden shadow-xl">
                      {person.imageUrl ? (
                        <img 
                          src={person.imageUrl} 
                          alt={person.name} 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=1e293b&color=818cf8&bold=true`;
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-indigo-400 font-black text-2xl uppercase">
                          {person.name.charAt(0)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-12 pb-6 px-6">
                  <div className="flex flex-col items-center mb-4">
                    <h3 className="font-bold text-white text-lg truncate w-full">{person.name}</h3>
                    <div className="flex flex-wrap justify-center items-center gap-2 mt-1">
                      <span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded-md">
                        {person.studentId}
                      </span>
                      <div className="inline-block px-2 py-0.5 rounded-full bg-indigo-500/10 text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                        {person.role}
                      </div>
                      {person.position && (
                        <div className="inline-block px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                          {person.position}
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-slate-500 font-medium">{person.discipline}</p>
                  </div>

                  {person.bio && (
                    <p className="text-xs text-slate-400 line-clamp-2 mb-4 italic">"{person.bio}"</p>
                  )}

                  <div className="flex gap-2 mt-6">
                    {person.facebookUrl && (
                      <a 
                        href={person.facebookUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-white/5 hover:bg-indigo-600 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        Facebook
                      </a>
                    )}
                    {person.linkedinUrl && (
                      <a 
                        href={person.linkedinUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 py-3 bg-white/5 hover:bg-slate-700 text-[10px] font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                      >
                        LinkedIn
                      </a>
                    )}
                    {!person.facebookUrl && !person.linkedinUrl && (
                      <div className="flex-1 py-3 bg-white/[0.01] text-[10px] text-slate-600 font-bold rounded-xl italic">
                        No social links
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {filteredPeople.length === 0 && !loading && (
        <div className="py-20 text-center text-slate-600 italic">
          No records found matching your search or filter.
        </div>
      )}
    </div>
  );
}
