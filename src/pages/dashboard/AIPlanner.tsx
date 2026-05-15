import React, { useState, useRef, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard';
import { 
  Sparkles, 
  Loader2, 
  Send, 
  Image as ImageIcon, 
  X, 
  User, 
  Bot, 
  CheckCircle, 
  PlusCircle,
  Calendar as CalendarIcon,
  ListTodo
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Message {
  role: 'user' | 'model';
  content: string;
  image?: string;
}

export default function AIChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Hello! I am your Academic AI Assistant. How can I help you today? You can ask me to create a study plan, add items to your routine, or even upload a screenshot of your schedule for me to process!' }
  ]);
  const [input, setInput] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlannerOpen, setIsPlannerOpen] = useState(false);
  
  // Refined Planner Form State
  const [plannerForm, setPlannerForm] = useState({
    subject: '',
    chapter: '',
    examDate: '',
    availableTime: '2 hours/day',
    customTime: ''
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handlePlannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const time = plannerForm.availableTime === 'Custom' ? plannerForm.customTime : plannerForm.availableTime;
    const prompt = `Create a study plan for ${plannerForm.subject}, chapter: ${plannerForm.chapter}. My exam is on ${plannerForm.examDate}. I can study for about ${time} per day.`;
    
    setIsPlannerOpen(false);
    setInput(prompt);
    // Automatically trigger send
    setTimeout(() => handleSpecialSend(prompt), 100);
  };

  const handleSpecialSend = async (text: string) => {
    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);
    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          history: messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })),
          localTime: new Date().toLocaleDateString('en-CA'),
          localDay: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'model', content: data.text || "I've processed your plan request." }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const executeFunctionCall = async (call: any) => {
    if (!user) return;
    
    const { name, args } = call;
    try {
      if (name === 'addToRoutine') {
        const routineData = {
          ...args,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'users', user.uid, 'routines'), routineData);
        const dayLabel = args.date ? `${args.day} (${args.date})` : args.day;
        return `✅ Successfully added ${args.subject} to your routine for ${dayLabel} at ${args.time}.`;
      }
      
      if (name === 'addTask') {
        const taskData = {
          ...args,
          done: false,
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'users', user.uid, 'tasks'), taskData);
        return `✅ Successfully added task: "${args.title}" to your list.`;
      }
    } catch (err) {
      console.error("Function execute error:", err);
      return `❌ Failed to execute ${name}.`;
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !image) || loading) return;

    const userMessage: Message = { role: 'user', content: input, image: image || undefined };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setImage(null);
    setLoading(true);

    try {
      // Prepare history for API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.content }]
      }));

      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          image: userMessage.image,
          history,
          localTime: new Date().toLocaleDateString('en-CA'), // YYYY-MM-DD
          localDay: new Date().toLocaleDateString('en-US', { weekday: 'long' })
        })
      });

      const data = await res.json();
      
      if (data.functionCalls && data.functionCalls.length > 0) {
        let results = [];
        for (const call of data.functionCalls) {
          const result = await executeFunctionCall(call);
          results.push(result);
        }
        
        setMessages(prev => [...prev, { 
          role: 'model', 
          content: results.join('\n') + (data.text ? '\n\n' + data.text : '')
        }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: data.text || "I'm not sure how to respond to that." }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-160px)] max-w-4xl mx-auto pb-4 overflow-hidden">
      <header className="shrink-0 mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-2">
            <Sparkles className="text-indigo-400" /> AI Assistant
          </h1>
          <p className="text-slate-400">Automate your routine and get study insights via chat.</p>
        </div>
        <button 
          onClick={() => setIsPlannerOpen(true)}
          className="bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-indigo-500/30 transition-all"
        >
          Smart Planner
        </button>
      </header>

      <GlassCard className="flex-1 flex flex-col border-none bg-white/[0.03] overflow-hidden p-0 relative min-h-0">
        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scroll-smooth custom-scrollbar"
        >
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                m.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-white/5'
              }`}>
                {m.role === 'user' ? <User size={20} /> : <Bot size={20} className="text-indigo-400" />}
              </div>
              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2 ${m.role === 'user' ? 'text-right' : ''}`}>
                {m.image && (
                  <img 
                    src={m.image} 
                    alt="Upload" 
                    className="max-w-64 rounded-2xl border border-white/10 mb-2 ml-auto" 
                  />
                )}
                <div className={`inline-block p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words text-left ${
                  m.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-slate-900 border border-white/5 text-slate-300 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4">
              <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-white/5 flex items-center justify-center shrink-0">
                <Bot size={20} className="text-indigo-400" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/5 flex items-center gap-2">
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">Thinking...</span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Action Quickbar */}
        <div className="px-6 py-3 bg-white/[0.02] border-t border-white/5 flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { label: "Create Study Plan", icon: <CalendarIcon size={14} />, prompt: "Can you create a study plan for my Data Structures exam?" },
            { label: "Add Routine Item", icon: <PlusCircle size={14} />, prompt: "Add Discrete Math class at 11:30 AM in room L-304 on Tuesday to my routine." },
            { label: "Add Task", icon: <ListTodo size={14} />, prompt: "Add a high priority task: Finish OS Assignment by tomorrow." },
          ].map((action, i) => (
            <button 
              key={i}
              onClick={() => setInput(action.prompt)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-400 transition-all whitespace-nowrap"
            >
              {action.icon} {action.label}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-slate-950/50 border-t border-white/5">
          {image && (
            <div className="relative inline-block mb-4 p-2 bg-slate-900 rounded-2xl border border-white/10 shadow-xl">
              <img src={image} alt="Preview" className="w-20 h-20 object-cover rounded-xl" />
              <button 
                onClick={() => setImage(null)}
                className="absolute -top-2 -right-2 p-1 bg-rose-600 rounded-full text-white hover:bg-rose-700 transition-all"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <div className="flex gap-4 items-end">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 bg-slate-900 hover:bg-slate-800 rounded-xl border border-white/5 text-slate-400 transition-all shrink-0"
            >
              <ImageIcon size={20} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
            <div className="flex-1 relative">
              <textarea 
                rows={1}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                  }
                }}
                placeholder="Ask AI anything..."
                className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-indigo-500 transition-all resize-none max-h-32 min-h-[56px]"
              />
              <button 
                onClick={handleSend}
                disabled={(!input.trim() && !image) || loading}
                className="absolute right-2 bottom-2 p-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Planner Modal */}
        <AnimatePresence>
          {isPlannerOpen && (
            <div className="absolute inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-8 flex flex-col">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <PlusCircle className="text-indigo-400" /> Smart Study Planner
                </h2>
                <button onClick={() => setIsPlannerOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X size={20} /></button>
              </div>

              <form onSubmit={handlePlannerSubmit} className="space-y-6 max-w-lg mx-auto w-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subject</label>
                    <input 
                      type="text" required placeholder="e.g. Algorithms"
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-white"
                      value={plannerForm.subject} onChange={e => setPlannerForm({...plannerForm, subject: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chapter</label>
                    <input 
                      type="text" required placeholder="e.g. Graph"
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-white"
                      value={plannerForm.chapter} onChange={e => setPlannerForm({...plannerForm, chapter: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Exam Date</label>
                  <input 
                    type="date" required
                    className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-white"
                    value={plannerForm.examDate} onChange={e => setPlannerForm({...plannerForm, examDate: e.target.value})}
                  />
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Available Time</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['1 hour/day', '2 hours/day', '3 hours/day', 'Custom'].map(opt => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setPlannerForm({...plannerForm, availableTime: opt})}
                          className={`py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                            plannerForm.availableTime === opt 
                              ? 'bg-indigo-600/20 border-indigo-600 text-indigo-400' 
                              : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10'
                          }`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {plannerForm.availableTime === 'Custom' && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                      <input 
                        type="text" placeholder="e.g. 5 hours"
                        className="w-full bg-slate-900 border border-white/10 rounded-2xl py-4 px-6 text-white"
                        value={plannerForm.customTime} onChange={e => setPlannerForm({...plannerForm, customTime: e.target.value})}
                      />
                    </motion.div>
                  )}
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 py-5 rounded-2xl font-black text-white uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all flex items-center justify-center gap-3"
                >
                  <Sparkles size={20} /> Generate Plan
                </button>
              </form>
            </div>
          )}
        </AnimatePresence>
      </GlassCard>
    </div>
  );
}
