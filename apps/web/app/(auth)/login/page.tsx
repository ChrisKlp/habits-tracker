import Image from 'next/image';

import { GalleryVerticalEnd } from 'lucide-react';

import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <div className="bg-primary grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium text-primary-foreground">
            <div className="bg-amber-300 text-black flex h-6 w-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Habit Tracker
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md bg-white p-12 rounded-xl">
            <LoginForm />
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
