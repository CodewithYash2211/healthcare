import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button, Card, Input } from '../components/UI';
import { CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

export const OTPVerification = () => {
  const { verifyOTP } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { confirmationResult, phoneNumber, role } = location.state || {};

  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  if (!confirmationResult) {
    navigate('/login');
    return null;
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsVerifying(true);
    setError('');
    try {
      await verifyOTP(confirmationResult, otp, role);
      navigate('/');
    } catch (err: any) {
      console.error('OTP Verification failed:', err);
      setError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <button
          onClick={() => navigate('/login')}
          className="flex items-center gap-2 text-slate-500 hover:text-emerald-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToLogin')}
        </button>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{t('verifyPhone')}</h1>
            <p className="text-slate-500 mt-2">
              {t('otpSentTo')} <span className="font-semibold text-slate-700">{phoneNumber}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            <Input
              label={t('enterOtp')}
              placeholder="123456"
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-[1em] font-bold"
              required
            />

            {error && (
              <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full py-6 text-lg"
              disabled={isVerifying || otp.length !== 6}
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  {t('verifying')}
                </>
              ) : (
                t('verifyAndLogin')
              )}
            </Button>
          </form>

          <p className="text-center mt-6 text-sm text-slate-500">
            {t('didntReceiveCode')}{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-emerald-600 font-semibold hover:underline"
            >
              {t('resendCode')}
            </button>
          </p>
        </Card>
      </motion.div>
    </div>
  );
};
