'use client';

import Image from 'next/image';

import { LoadingIndicator } from '@/components/common';

export default function Loading() {
  return (
    <div className="flex-1 relative flex flex-col justify-center items-center bg-black">
      <LoadingIndicator />
      <Image
        fill
        src="/img/bg_pattern.png"
        alt="background grid"
        className="absolute inset-0 w-full h-full object-cover opacity-[0.1] pointer-events-none select-none"
        draggable={false}
        priority
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
