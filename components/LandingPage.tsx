"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Logo from "./Logo";
import Image from "next/image";
import { motion, cubicBezier } from "framer-motion";
import toast from "react-hot-toast";
import { initiateSignin } from "@/services/auth.service";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: cubicBezier(0.22, 1, 0.36, 1) },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8 } },
};

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await initiateSignin({ email: email.trim(), name });
      if (res?.status === 200) {
        toast.success("OTP sent successfully! Please check your email.");
        sessionStorage.setItem("email", email);
        sessionStorage.setItem("name", name);
        router.push("/verify-otp");
      }
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Font import — Playfair Display + DM Sans */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      <div className="relative flex w-full min-h-screen overflow-hidden bg-slate-950">
        {/* ─── Left Panel ─────────────────────────────── */}
        <div className="hidden lg:flex flex-col justify-between relative w-[52%] min-h-screen bg-slate-900 border-r border-white/5 px-14 py-12 overflow-hidden">
          {/* Ambient glow — top left */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"
          />
          {/* Ambient glow — bottom right */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-500/5 blur-3xl pointer-events-none"
          />

          {/* Subtle dot-grid texture */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.025]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Logo />
          </motion.div>

          {/* Hero copy */}
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={mounted ? "show" : "hidden"}
            className="max-w-md"
          >
            <motion.span
              variants={fadeUp}
              className="inline-block text-[10px] font-semibold tracking-[0.22em] uppercase text-amber-400/80 mb-6"
            >
              Intelligent Platform
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl xl:text-5xl font-medium leading-[1.18] text-white mb-6"
            >
              Where ideas
              <br />
              <span className="italic text-amber-300/90">
                meet intelligence.
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-sm leading-relaxed text-slate-400 max-w-sm"
            >
              A focused workspace built for those who think deeply and move
              deliberately. Sign in to begin.
            </motion.p>

            {/* Stat row */}
          </motion.div>

          {/* Floating AI image */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative self-end"
          >
            <div className="relative w-44 h-44 xl:w-52 xl:h-52">
              {/* Pulsing glow ring */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.55, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 via-amber-300/10 to-transparent blur-2xl"
              />
              <Image
                src="/bulb-ai.png"
                alt="AI visual"
                fill
                className="object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
          </motion.div>
        </div>

        {/* ─── Right Panel — Form ──────────────────────── */}
        <div className="flex flex-col items-center justify-center w-full lg:w-[48%] min-h-screen px-6 sm:px-10 bg-slate-950 relative">
          {/* Mobile ambient glows */}
          <div className="lg:hidden absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />
          <div className="lg:hidden absolute bottom-0 left-0 w-48 h-48 rounded-full bg-sky-500/5 blur-3xl pointer-events-none" />

          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 w-full max-w-sm">
            <Logo />
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            animate={mounted ? "show" : "hidden"}
            className="w-full max-w-sm"
          >
            {/* Form heading */}
            <motion.div variants={fadeUp} className="mb-8">
              <h2 className="font-display text-2xl font-medium text-white mb-1.5">
                Get started
              </h2>
              <p className="text-sm text-slate-500">
                Enter your details and we'll send a one-time passcode.
              </p>
            </motion.div>

            <motion.form
              variants={fadeUp}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-slate-400 mb-2 tracking-wide"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  value={email.trim()}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-amber-400/60 focus:bg-amber-400/[0.03] transition-all duration-200"
                />
              </div>

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-xs font-medium text-slate-400 mb-2 tracking-wide"
                >
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-slate-600 outline-none focus:border-amber-400/60 focus:bg-amber-400/[0.03] transition-all duration-200"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all duration-200 
                             disabled:opacity-40 disabled:cursor-not-allowed 
                             bg-gradient-to-r from-amber-400 to-amber-300 text-slate-900 
                             hover:from-amber-300 hover:to-amber-200 hover:-translate-y-0.5 
                             active:translate-y-0 shadow-lg shadow-amber-500/10"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        />
                      </svg>
                      Sending…
                    </span>
                  ) : (
                    "Send OTP →"
                  )}
                </button>
              </div>
            </motion.form>

            {/* Divider */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 my-7"
            >
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-[11px] text-slate-600 tracking-wider uppercase">
                Secure sign-in
              </span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
