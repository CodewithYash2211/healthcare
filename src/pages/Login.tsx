import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, Card } from '../components/UI';
import { Stethoscope, User, UserCog } from 'lucide-react';
import { motion } from 'motion/react';

export const Login = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState<'worker' | 'doctor'>('worker');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login(role);
      navigate('/');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-600 text-white mb-4 shadow-lg shadow-emerald-200">
            <Stethoscope className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('appName')}</h1>
          <p className="text-slate-500 mt-2">{t('appTagline')}</p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex gap-4 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setRole('worker')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  role === 'worker' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <User className="w-4 h-4" />
                {t('worker')}
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  role === 'doctor' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                }`}
              >
                <UserCog className="w-4 h-4" />
                {t('doctor')}
              </button>
            </div>

            <Button
              onClick={handleLogin}
              className="w-full py-6 text-lg"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? t('loggingIn') : `${t('loginAs')} ${t(role)}`}
            </Button>
          </div>
        </Card>

        <p className="text-center mt-6 text-sm text-slate-500">
          {t('secureLogin')}
        </p>
      </motion.div>
    </div>
  );
};
