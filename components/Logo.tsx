import React from "react";
import { playfair } from "../helper/fonts";
import Image from "next/image";

function Logo() {
  return (
    <div className="flex items-center justify-center gap-1">
      <div>
        <Image
          src={"/logo.png"}
          alt="Logo"
          height={32}
          width={40}
          className="bg-zinc-700 rounded-md"
        />
      </div>
      <div
        className={`text-2xl bg-gradient-to-b from-blue-400 to-purple-500 bg-clip-text font-black tracking-tighter text-transparent ${playfair.variable}`}
      >
        AICourseVisualizer
      </div>
    </div>
  );
}

export default Logo;
