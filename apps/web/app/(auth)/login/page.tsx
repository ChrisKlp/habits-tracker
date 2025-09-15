'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';

import { GalleryVerticalEnd } from 'lucide-react';

import { LoginForm } from '@/components/login-form';
import { login, LoginActionState } from '../actions';

export default function LoginPage() {
  const [state, formAction] = useActionState<LoginActionState, FormData>(login, {
    status: 'idle',
  });

  return (
    <div className="bg-primary grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="text-primary-foreground flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-300 text-black">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Habit Tracker
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md rounded-xl bg-white p-12">
            <LoginForm action={formAction} />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-white lg:block">
        <Image
          src="/habit-tracker-login.svg"
          width={1280}
          height={720}
          alt="Image"
          className="object-fit absolute inset-0 h-full w-full dark:brightness-[0.2]"
        />
      </div>
    </div>
  );
}
