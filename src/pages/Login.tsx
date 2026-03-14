import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, Card, Input } from '../components/UI';
import { Stethoscope, User, UserCog, Send, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export const Login = () => {
  const { signInWithGoogle, signInWithPhone } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState<'worker' | 'doctor'>('worker');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    setError('');
    try {
      await signInWithGoogle(role);
      navigate('/');
    } catch (err: any) {
      console.error('Google Login failed:', err);
      if (err.code === 'auth/configuration-not-found') {
        setError('Google Sign-In is not enabled in Firebase Console.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;

    setIsPhoneLoading(true);
    setError('');
    try {
      // Ensure phone number starts with + and country code
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const confirmationResult = await signInWithPhone(formattedPhone, role);
      navigate('/verify-otp', { 
        state: { 
          confirmationResult, 
          phoneNumber: formattedPhone,
          role 
        } 
      });
    } catch (err: any) {
      console.error('Phone Login failed:', err);
      if (err.code === 'auth/configuration-not-found') {
        setError('Phone Authentication is not enabled in Firebase Console.');
      } else if (err.code === 'auth/billing-not-enabled') {
        setError('Real SMS requires a paid plan. Please use a "Test Phone Number" in Firebase Console for free testing.');
      } else {
        setError(err.message || 'Failed to send OTP. Please check your number.');
      }
    } finally {
      setIsPhoneLoading(false);
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

            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-3 py-6 bg-white border-slate-200 hover:bg-slate-50 text-slate-700 font-medium shadow-sm transition-all"
                onClick={handleGoogleLogin}
                disabled={isGoogleLoading || isPhoneLoading}
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                )}
                {t('continueWithGoogle')}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400">Or</span></div>
              </div>

              <form onSubmit={handlePhoneLogin} className="space-y-4">
                <Input
                  label={t('loginWithPhone')}
                  placeholder="9876543210"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  icon={<Send className="w-4 h-4 text-slate-400" />}
                  required
                />
                
                {error && (
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full py-4 text-base font-semibold shadow-md shadow-emerald-100"
                  disabled={isGoogleLoading || isPhoneLoading || phoneNumber.length < 10}
                >
                  {isPhoneLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : t('sendOtp')}
                </Button>
              </form>
            </div>
          </div>
        </Card>

        <div id="recaptcha-container"></div>

        <p className="text-center mt-6 text-sm text-slate-500">
          {t('secureLogin')}
        </p>
      </motion.div>
    </div>
  );
};
