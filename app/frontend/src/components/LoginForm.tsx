import React, { useState } from 'react'
import { Lock, Mail, User2, Zap } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../contexts/ToastContext'
import { Button } from './ui/Button'
import { Card, CardContent } from './ui/Card'
import { Input } from './ui/Input'
import { useHealthCheck } from '../hooks/useHealthCheck'
import { HealthSphereCard } from './HealthSphereCard'

interface LoginFormProps {
  onToggleMode: () => void;
  isLogin: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode, isLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast()
  const { services, refresh } = useHealthCheck({ pollMs: 30_000, timeoutMs: 5_000 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (!result.success) {
        setError(result.error || (isLogin ? 'Invalid email or password' : 'Registration failed'));
        toast({
          tone: 'error',
          title: isLogin ? 'Sign in failed' : 'Sign up failed',
          description: result.error || 'Please try again.',
        })
      } else {
        toast({
          tone: 'success',
          title: isLogin ? 'Welcome back' : 'Account created',
          description: isLogin ? 'You are now signed in.' : 'You are now signed in.',
        })
      }
    } catch (error) {
      console.error('[LoginForm] Unexpected error:', error);
      setError('An unexpected error occurred. Please try again.');
      toast({ tone: 'error', title: 'Something went wrong', description: 'Please try again.' })
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[color:var(--color-gbg-1)]">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 opacity-0 dark:opacity-100 bg-[radial-gradient(60rem_40rem_at_top,rgba(57,160,255,0.22),transparent)]" />
        <div className="container-page flex min-h-screen items-center justify-center py-12">
          <div className="grid w-full max-w-5xl items-center gap-6 lg:grid-cols-[1fr_420px]">
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-white/10 bg-zinc-950/55 p-8 shadow-[0_14px_60px_rgba(0,0,0,0.55)] backdrop-blur-xl">
                <div className="text-display text-xl font-semibold text-zinc-50">
                  System status
                </div>
                <p className="mt-2 text-sm text-zinc-400">
                  Live health checks for connected services.
                </p>
                <div className="mt-6 space-y-4">
                  {services.map((s) => (
                    <HealthSphereCard key={s.key} service={s} onRefresh={() => void refresh()} compact />
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full max-w-md justify-self-center">
              <div className="mb-8 flex items-center justify-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-neon-blue),var(--color-neon-purple))] text-white shadow-[0_0_0_1px_rgba(255,255,255,0.10),0_18px_60px_rgba(57,160,255,0.18)]">
                  <Zap className="h-6 w-6" aria-hidden="true" />
                </div>
                <div className="text-left">
                  <div className="text-display text-lg font-semibold text-zinc-900 dark:text-zinc-50">CloudBlitz</div>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400">Access console</div>
                </div>
              </div>

              <Card className="shadow-lg dark:border-white/10 dark:bg-zinc-950/55">
                <CardContent className="p-8">
                  <h1 className="text-display text-xl font-semibold text-zinc-900 dark:text-zinc-50">
                    {isLogin ? 'Welcome back' : 'Create your account'}
                  </h1>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {isLogin
                      ? 'Use your email and password to sign in.'
                      : 'Fill in your details to get started.'}
                  </p>

                  <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    {!isLogin ? (
                      <Input
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        label="Full name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={handleChange}
                      />
                    ) : null}

                    <Input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      label="Email"
                      placeholder="name@company.com"
                      value={formData.email}
                      onChange={handleChange}
                    />

                    <Input
                      name="password"
                      type="password"
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      required
                      label="Password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />

                    {error ? (
                      <div
                        className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-500/10 dark:text-red-200"
                        role="alert"
                      >
                        {error}
                      </div>
                    ) : null}

                    <Button
                      type="submit"
                      className="w-full"
                      isLoading={loading}
                      leftIcon={
                        isLogin ? (
                          <Mail className="h-4 w-4" aria-hidden="true" />
                        ) : (
                          <User2 className="h-4 w-4" aria-hidden="true" />
                        )
                      }
                    >
                      {isLogin ? 'Sign in' : 'Create account'}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      leftIcon={<Lock className="h-4 w-4" aria-hidden="true" />}
                      onClick={onToggleMode}
                    >
                      {isLogin ? 'Create an account' : 'Back to sign in'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
                © 2024 CloudBlitz. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
