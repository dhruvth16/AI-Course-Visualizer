"use client";

import React from "react";
import Image from "next/image";
import { Cpu } from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      {/* Icon container */}
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-[#0d1117] border border-[rgba(99,179,237,0.2)] shadow-[0_0_12px_rgba(99,179,237,0.08)]">
        <Image
          src="/logo.png"
          alt="Logo"
          height={20}
          width={20}
          className="rounded-sm object-contain"
        />
        {/* Corner accent */}
        <span className="absolute -top-px -right-px w-1.5 h-1.5 rounded-full bg-[#63b3ed] opacity-70" />
      </div>

      {/* Wordmark */}
      <div className="flex items-baseline gap-0.5">
        <span className="font-black text-[15px] tracking-[-0.04em] text-[#e8edf5] leading-none font-[Syne,sans-serif]">
          AI
        </span>
        <span className="font-semibold text-[15px] tracking-[-0.03em] text-[#7a8a9e] leading-none font-[Syne,sans-serif]">
          Course
        </span>
        <span className="font-black text-[15px] tracking-[-0.04em] text-[#e8edf5] leading-none font-[Syne,sans-serif]">
          Viz
        </span>
      </div>

      {/* Status chip */}
      <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(99,179,237,0.06)] border border-[rgba(99,179,237,0.12)]">
        <span className="w-1 h-1 rounded-full bg-[#63b3ed] animate-pulse" />
        <span className="text-[9px] font-mono text-[#63b3ed] tracking-widest uppercase opacity-70">
          beta
        </span>
      </div>
    </div>
  );
}

export default Logo;
