import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, Menu, X, LayoutDashboard } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { GlassCard } from '../common/GlassCard';

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'People', path: '/people' },
    { name: 'Album', path: '/album' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4">
      <div className="max-w-7xl mx-auto">
        <GlassCard className="py-3 px-6 flex items-center justify-between" hover={false}>
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 p-2 rounded-xl group-hover:rotate-12 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">Physics 23</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-indigo-400",
                  location.pathname === link.path ? "text-indigo-400" : "text-slate-300"
                )}
              >
                {link.name}
              </Link>
            ))}
            {user ? (
              <Link
                to="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2"
              >
                <LayoutDashboard size={16} /> Dashboard
              </Link>
            ) : (
              <Link
                to="/login"
                className="bg-indigo-600 hover:bg-indigo-700 px-6 py-2 rounded-full text-sm font-bold transition-all shadow-lg shadow-indigo-500/20"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </GlassCard>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-2"
            >
              <GlassCard className="flex flex-col gap-4 p-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-lg font-medium py-2",
                      location.pathname === link.path ? "text-indigo-400" : "text-slate-300"
                    )}
                  >
                    {link.name}
                  </Link>
                ))}
                {user ? (
                  <Link
                    to="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="bg-indigo-600 text-center py-3 rounded-xl font-bold mt-2 flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard size={18} /> Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="bg-indigo-600 text-center py-3 rounded-xl font-bold mt-2"
                  >
                    Login
                  </Link>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
