// src/app/(auth)/register/page.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '@/store/services/authApi';
import { setCredentials } from '@/store/slices/authSlice';
import { useAppDispatch } from '@/store/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [register, { isLoading }] = useRegisterMutation();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterForm) {
    try {
      const result = await register(data as any).unwrap();
      if (result.success) {
        dispatch(setCredentials(result.data));
        router.push('/connect-shopify');
      }
    } catch (err: any) {
      const payload = err?.data;
      // Backend sends { error, message, details[] }
      // details contains field-level messages like "password: must be 8 characters"
      let description = payload?.message ?? 'Something went wrong. Please try again.';

      if (payload?.details?.length) {
        // Show the first field-level validation message clearly
        const detail = (payload.details as string[])[0];
        const fieldMsg = detail.includes(':') ? detail.split(':').slice(1).join(':').trim() : detail;
        description = fieldMsg.charAt(0).toUpperCase() + fieldMsg.slice(1);
      }

      toast({
        title: 'Registration failed',
        description,
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-20 px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <h1
            className="text-2xl font-bold"
            style={{ color: 'var(--text-heading)' }}
          >
            Create account
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Start selling across all platforms
          </p>
        </div>

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
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                {...registerField('fullName')}
                className={errors.fullName ? 'border-red-400' : ''}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500">
                  {errors.fullName.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seller@example.com"
                {...registerField('email')}
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
                placeholder="At least 8 characters"
                {...registerField('password')}
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
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          <p className="text-center text-sm mt-4" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium hover:underline"
              style={{ color: 'var(--brand-accent)' }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
