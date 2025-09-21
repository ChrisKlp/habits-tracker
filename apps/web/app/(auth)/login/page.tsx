'use client';

import { useActionState, useEffect, useState } from 'react';
import Image from 'next/image';

import { toast } from 'sonner';

import { LoginForm } from '@/components/login-form';
import { Logo } from '@/components/logo';
import { login, LoginActionState } from '../actions';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [state, formAction] = useActionState<LoginActionState, FormData>(login, {});

  useEffect(() => {
    if (state.error) {
      toast.error(state.error, {
        position: 'top-right',
      });
    }
  }, [state.error]);

  function handleSubmit(formData: FormData) {
    setEmail(formData.get('email') as string);
    formAction(formData);
  }

  return (
    <main className="bg-primary grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo dark />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-xl bg-white p-8 sm:p-12">
            <LoginForm action={handleSubmit} defaultEmail={email} />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-white lg:block">
        <Image
          src="/images/habit-tracker-login.svg"
          width={1280}
          height={720}
          alt="Image"
          className="object-fit absolute inset-0 h-full w-full dark:brightness-[0.2]"
        />
      </div>
    </main>
  );
}
