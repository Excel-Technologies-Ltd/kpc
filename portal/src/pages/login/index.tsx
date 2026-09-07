import { ModeToggle } from '@/components/mode-toggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { extractFrappeError } from '@/lib/frappe-error';
import { URLOverview } from '@/router/routes.url';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FrappeError } from 'frappe-react-sdk';
import { useFrappeAuth } from 'frappe-react-sdk';
import { Eye, EyeOff, Loader2, LockIcon, UserIcon } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().trim().min(1, { message: 'Username or Email is required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login: userLogin } = useFrappeAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginValues) => {
    setSubmitError(undefined);
    try {
      await userLogin({ username: data.username, password: data.password });
      toast.success('Login successful');
      navigate(URLOverview());
    } catch (error) {
      setSubmitError(extractFrappeError(error as FrappeError));
    }
  };

  return (
    <div className='relative flex min-h-dvh items-center justify-center bg-[#f4f7fc] px-4 py-10 dark:bg-[#0b1220]'>
      <div className='absolute top-4 right-4'>
        <ModeToggle />
      </div>

      <Card className='w-full max-w-md border-[#e6edf7] bg-white shadow-[0_18px_50px_-28px_rgba(38,64,120,0.45)] dark:border-[#233252] dark:bg-[#0f1728]'>
        <CardHeader className='border-b border-[#e6edf7] pb-5 dark:border-[#233252]'>
          <CardTitle className='text-2xl font-semibold tracking-tight text-[#132038] dark:text-foreground'>
            KPC Portal
          </CardTitle>
          <CardDescription className='text-[#5c6b85]'>
            Sign in to Petroleum Operations
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form id='login-form' onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
            <FieldGroup className='gap-5'>
              <Controller
                control={control}
                name='username'
                render={({ field }) => (
                  <Field data-invalid={!!errors.username}>
                    <FieldLabel htmlFor='form-username'>Username or Email</FieldLabel>
                    <div className='relative'>
                      <UserIcon className='pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[#93a2bd]' />
                      <Input
                        {...field}
                        id='form-username'
                        type='text'
                        autoComplete='username'
                        placeholder='user@example.com'
                        className='h-11 pl-9'
                        aria-invalid={!!errors.username}
                        onChange={(event) => {
                          if (submitError) setSubmitError(undefined);
                          field.onChange(event);
                        }}
                      />
                    </div>
                    <FieldError errors={[errors.username]} />
                  </Field>
                )}
              />

              <Controller
                control={control}
                name='password'
                render={({ field }) => (
                  <Field data-invalid={!!errors.password}>
                    <FieldLabel htmlFor='form-password'>Password</FieldLabel>
                    <div className='relative'>
                      <LockIcon className='pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[#93a2bd]' />
                      <Input
                        {...field}
                        id='form-password'
                        type={showPassword ? 'text' : 'password'}
                        autoComplete='current-password'
                        placeholder='••••••••'
                        className='h-11 pr-10 pl-9'
                        aria-invalid={!!errors.password}
                        onChange={(event) => {
                          if (submitError) setSubmitError(undefined);
                          field.onChange(event);
                        }}
                      />
                      <button
                        type='button'
                        className='absolute top-1/2 right-2.5 -translate-y-1/2 text-[#93a2bd] hover:text-[#132038] dark:hover:text-foreground'
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className='size-4' /> : <Eye className='size-4' />}
                      </button>
                    </div>
                    <FieldError errors={[errors.password]} />
                  </Field>
                )}
              />
            </FieldGroup>

            {submitError ? (
              <p className='text-sm text-destructive' role='alert'>
                {submitError}
              </p>
            ) : null}

            <Button
              type='submit'
              form='login-form'
              disabled={isSubmitting}
              className='h-11 w-full bg-[#4361ee] text-white hover:bg-[#3451d1]'
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='size-4 animate-spin' />
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
