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
  Stethoscope,
  Hospital,
  FileText,
  Settings,
  Bell,
  Search,
  User as UserIcon,
  MapPin,
  WifiOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './Logo';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = user?.role === 'worker' ? [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/' },
    { icon: Users, label: t('patients'), path: '/patients' },
    { icon: MessageSquare, label: t('aiAssistant'), path: '/ai-assistant' },
    { icon: ScanFace, label: t('skinCheck'), path: '/skin-check' },
    { icon: Hospital, label: t('hospitals'), path: '/hospitals' },
    { icon: Settings, label: t('settings'), path: '/settings' },
  ] : [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/' },
    { icon: MapPin, label: t('mapView'), path: '/map' },
    { icon: Users, label: t('patientQueue'), path: '/pending-cases' },
    { icon: FileText, label: t('reports'), path: '/reports' },
    { icon: Settings, label: t('settings'), path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-r border-slate-200/50 dark:border-slate-700/50 flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] dark:shadow-none z-10 isolate">
        <div className="h-16 flex items-center px-6 border-b border-slate-200/50 dark:border-slate-700/50">
          <Logo />
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 relative group ${
                location.pathname === item.path
                  ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-900/30 shadow-sm shadow-emerald-100/50 dark:shadow-none'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {location.pathname === item.path && (
                <motion.div 
                  layoutId="activeTab"
                  className="absolute left-0 w-1 h-full bg-emerald-500 rounded-r-full" 
                />
              )}
              <item.icon className={`w-5 h-5 transition-colors ${location.pathname === item.path ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-4">
          <LanguageSwitcher />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40 shadow-sm dark:shadow-none">
          {/* Mobile Logo & Menu toggle */}
          <div className="flex md:hidden items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -ml-2 text-slate-600 bg-slate-50 rounded-xl">
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Logo />
          </div>

          {/* Search bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text" 
                placeholder={t('searchBarPlaceholder')} 
                className="w-full pl-10 pr-4 py-2 bg-slate-100/80 dark:bg-slate-800 border border-transparent rounded-full text-sm focus:bg-white dark:focus:bg-slate-900 focus:border-emerald-200 dark:focus:border-emerald-800 focus:ring-4 focus:ring-emerald-500/10 dark:text-slate-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3 md:gap-4 ml-auto">
            {isOffline && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 text-red-600 border border-red-100/50 text-xs font-bold animate-pulse">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Offline Mode</span>
              </div>
            )}
            <button className="relative p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{user?.name}</span>
                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">{t(user?.role || 'worker')}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="group relative"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 border-2 border-white shadow-sm flex items-center justify-center text-emerald-700 font-bold overflow-hidden">
                  {user?.name?.[0] || <UserIcon className="w-5 h-5" />}
                </div>
                {/* Logout tooltip */}
                <div className="absolute top-12 right-0 bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {t('clickToLogout')}
                </div>
              </button>
            </div>
          </div>
        </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed inset-0 top-[64px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-3xl z-40 p-4 flex flex-col"
          >
            <nav className="flex-1 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-4 rounded-xl text-lg font-medium transition-all ${
                    location.pathname === item.path
                      ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400'
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

      {/* Main Content Container */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50/50 dark:bg-transparent p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      </div>
    </div>
  );
};
