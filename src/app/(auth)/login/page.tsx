// src/app/(auth)/login/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useLoginMutation } from '@/store/services/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginForm) {
    try {
      const result = await login(data as any).unwrap();
      if (result.success) {
        dispatch(setCredentials(result.data));
        router.push('/connect-shopify');
      }
    } catch (err: any) {
      const payload = err?.data;
      // Backend sends { error, message, details[] }
      let description = payload?.message ?? 'Incorrect email or password. Please try again.';

      if (payload?.details?.length) {
        const detail = (payload.details as string[])[0];
        const fieldMsg = detail.includes(':') ? detail.split(':').slice(1).join(':').trim() : detail;
        description = fieldMsg.charAt(0).toUpperCase() + fieldMsg.slice(1);
      }

      toast({
        title: 'Login failed',
        description,
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-md">
        {/* Headline */}
        <div className="text-center mb-12">
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-heading)' }}
          >
            Welcome back
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Sign in to your seller account
          </p>
        </div>

        {/* Form Card */}
        <div
          className="rounded-2xl p-6"
          style={{
            background: 'var(--bg-white)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.03), 0 4px 24px rgba(0,0,0,0.04)',
          }}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seller@example.com"
                {...register('email')}
                className={errors.email ? 'border-red-400' : ''}
              />
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                {...register('password')}
                className={errors.password ? 'border-red-400' : ''}
              />
              {errors.password && (
                <p className="text-xs text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full rounded-xl text-white font-semibold"
              disabled={isLoading}
              style={{
                background: 'var(--brand)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <p className="text-center text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="font-medium hover:underline"
              style={{ color: 'var(--brand-accent)' }}
            >
              Create one
            </Link>
          </p>
        </div>

        {/* Dev shortcuts */}
        {process.env.NODE_ENV === 'development' && (
          <div
            className="mt-4 p-3 rounded-xl text-xs"
            style={{
              background: 'var(--bg-muted)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-body)',
            }}
          >
            <p className="font-medium mb-1">
              Dev accounts (from backend sample data):
            </p>
            <p>seller1@example.com / password123</p>
            <p>seller2@example.com / password123</p>
          </div>
        )}
      </div>
    </div>
  );
}
