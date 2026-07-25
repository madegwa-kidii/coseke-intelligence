'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'invalid'>('loading');
  const [error, setError] = useState('');
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token || !email) {
      setStatus('invalid');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email: decodeURIComponent(email) }),
        });

        const data = await response.json();

        if (data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setError(data.message || 'Verification failed');
        }
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Verification failed');
      }
    };

    verifyEmail();
  }, [token, email]);

  const handleResendEmail = async () => {
    if (!email) return;

    setIsResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: decodeURIComponent(email) }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus('loading');
        setError('');
        // Reset to show message
        setTimeout(() => {
          setStatus('success');
          setError('New verification email sent!');
        }, 500);
      } else {
        setError(data.message || 'Failed to resend email');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-cyan-500/5 rounded-full blur-3xl"></div>
      </div>

      <Card className="w-full max-w-md border border-slate-700 bg-slate-950/50 backdrop-blur-sm relative z-10">
        <CardHeader className="space-y-1">
          <div className="text-xs font-mono text-slate-400 mb-2">COSEKE.AUTH</div>
          <CardTitle className="text-2xl font-bold text-white">Verify Email</CardTitle>
          <CardDescription className="text-slate-400">Confirm your email address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === 'loading' && (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
              </div>
              <p className="text-slate-300">Verifying your email...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-green-500/10 border border-green-500/20 p-6 text-center">
                <div className="text-4xl mb-3">✓</div>
                <h3 className="text-lg font-semibold text-green-200 mb-2">Email Verified!</h3>
                <p className="text-sm text-green-100/80">
                  Your email has been successfully verified. You can now sign in to your account.
                </p>
              </div>
              <Button
                onClick={() => router.push('/auth/login')}
                className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-full font-semibold"
              >
                Sign In Now
              </Button>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
                <p className="text-red-200 font-medium mb-2">Verification Failed</p>
                <p className="text-sm text-red-100/80">{error}</p>
              </div>
              {email && (
                <Button
                  onClick={handleResendEmail}
                  disabled={isResending}
                  className="w-full bg-blue-600 hover:bg-blue-700 rounded-full font-semibold disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              )}
              <Button
                onClick={() => router.push('/auth/register')}
                variant="outline"
                className="w-full rounded-full border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Back to Registration
              </Button>
            </div>
          )}

          {status === 'invalid' && (
            <div className="space-y-4">
              <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                <p className="text-yellow-200 font-medium mb-2">Invalid Link</p>
                <p className="text-sm text-yellow-100/80">
                  The verification link is missing or invalid. Please try registering again.
                </p>
              </div>
              <Button
                onClick={() => router.push('/auth/register')}
                className="w-full bg-white text-slate-900 hover:bg-slate-100 rounded-full font-semibold"
              >
                Register Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
