'use client';

import { Bell } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Logo } from './logo';

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex items-center justify-between">
        <Logo />

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-slate-600">
            <Bell className="h-4 w-4" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://avataaars.io/?avatarStyle=Circle&topType=WinterHat2&accessoriesType=Kurt&hatColor=Black&facialHairType=BeardLight&facialHairColor=Auburn&clotheType=ShirtScoopNeck&clotheColor=Gray02&eyeType=Dizzy&eyebrowType=FlatNatural&mouthType=Default&skinColor=Light" />
            <AvatarFallback className="bg-slate-200 text-sm text-slate-700">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
