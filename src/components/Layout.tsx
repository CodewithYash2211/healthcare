import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  Users, 
  LayoutDashboard, 
  MessageSquare, 
  ScanFace, 
  LogOut, 
  Menu, 
  X,
  Stethoscope
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = user?.role === 'worker' ? [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/' },
    { icon: Users, label: t('patients'), path: '/patients' },
    { icon: MessageSquare, label: t('aiAssistant'), path: '/ai-assistant' },
    { icon: ScanFace, label: t('skinCheck'), path: '/skin-check' },
  ] : [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/' },
    { icon: Stethoscope, label: t('pending'), path: '/pending-cases' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-emerald-600 flex items-center gap-2">
            <Stethoscope className="w-6 h-6" />
            {t('appName')}
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                location.pathname === item.path
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-4">
          <LanguageSwitcher />
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
        <h1 className="text-lg font-bold text-emerald-600 flex items-center gap-2">
          <Stethoscope className="w-5 h-5" />
          {t('appName')}
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-[61px] bg-white z-40 p-4 flex flex-col"
          >
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium ${
                    location.pathname === item.path
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600'
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="pt-4 border-t border-slate-100 space-y-4 pb-8">
              <LanguageSwitcher />
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-4 w-full rounded-xl text-lg font-medium text-red-600"
              >
                <LogOut className="w-6 h-6" />
                {t('logout')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};
