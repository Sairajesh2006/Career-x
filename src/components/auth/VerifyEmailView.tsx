import React, { useState } from 'react';
import { CheckCircle2, LogOut, MailCheck, RefreshCw } from 'lucide-react';
import {
  checkEmailVerificationStatus,
  logoutStudentAccount,
  resendStudentVerificationEmail,
} from '../../services/authService';

interface VerifyEmailViewProps {
  email: string;
  onVerified: () => void;
}

export const VerifyEmailView: React.FC<VerifyEmailViewProps> = ({ email, onVerified }) => {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheckVerification = async () => {
    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      const verified = await checkEmailVerificationStatus();
      if (verified) {
        onVerified();
      } else {
        setError('Your email is not verified yet. Please click the verification link sent to your inbox, then try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to verify email status.');
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setMessage(null);
    try {
      await resendStudentVerificationEmail();
      setMessage('A new verification email has been sent. Please check your inbox and spam folder.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not resend verification email.');
    } finally {
      setResending(false);
    }
  };

  const handleLogout = async () => {
    await logoutStudentAccount();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-6">
          <MailCheck className="w-6 h-6" />
        </div>

        <h2 className="text-2xl font-bold text-white">Verify your email address</h2>
        <p className="text-sm text-slate-400 mt-2 leading-relaxed">
          To protect your Career-X student workspace and enable cloud progress saving, please click the verification link we sent to{' '}
          <span className="text-slate-200 font-medium">{email}</span>.
        </p>

        {error && (
          <div className="mt-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
            {message}
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleCheckVerification}
            disabled={checking}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{checking ? 'Checking Verification...' : "I've Verified My Email — Continue"}</span>
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full py-2.5 px-4 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${resending ? 'animate-spin' : ''}`} />
            <span>{resending ? 'Sending...' : 'Resend Verification Email'}</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-2 px-4 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out and use a different account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
