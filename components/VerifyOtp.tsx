"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Logo from "./Logo";
import Image from "next/image";
import { motion, cubicBezier } from "framer-motion";
import toast from "react-hot-toast";
import { verifyOtp } from "@/services/auth.service";

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

const OTP_LENGTH = 6;

export default function VerifyOtp() {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const storedEmail = sessionStorage.getItem("email");
    const storedName = sessionStorage.getItem("name");
    if (storedEmail && storedName) {
      setEmail(storedEmail);
      setName(storedName);
    } else {
      router.push("/");
    }
  }, [router]);

  const handleDigitChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    // Auto-advance
    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    const next = [...digits];
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);
    const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[lastFilled]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const otp = digits.join("");
    if (otp.length < OTP_LENGTH) {
      toast.error("Please enter the full OTP.");
      return;
    }
    try {
      setLoading(true);
      const res = await verifyOtp({ email: email.trim(), name, otp });
      if (res?.status === 200) {
        toast.success(res.data.message || "OTP verified successfully!");
        sessionStorage.setItem("user", JSON.stringify(res.data));
        router.push("/prompt-lesson");
      } else {
        toast.error(
          res?.data.error || "Failed to verify OTP. Please try again.",
        );
      }
    } catch (error) {
      toast.error("Failed to verify OTP. Please try again.");
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const maskedEmail = email
    ? email.replace(
        /(.{2})(.*)(@.*)/,
        (_, a, b, c) => a + "*".repeat(b.length) + c,
      )
    : "";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&family=Playfair+Display:ital,wght@0,500;0,600;1,500&display=swap');
        body { font-family: 'DM Sans', sans-serif; }
        .font-display { font-family: 'Playfair Display', Georgia, serif; }

        .otp-input {
          caret-color: #FBBF24;
        }
        .otp-input:focus {
          border-color: rgba(251,191,36,0.6) !important;
          background: rgba(251,191,36,0.04) !important;
        }
      `}</style>

      <div className="relative flex w-full min-h-screen overflow-hidden bg-slate-950">
        {/* ─── Left Panel ─────────────────────────────── */}
        <div className="hidden lg:flex flex-col justify-between relative w-[52%] min-h-screen bg-slate-900 border-r border-white/5 px-14 py-12 overflow-hidden">
          {/* Ambient glows */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/5 blur-3xl pointer-events-none"
          />
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="show"
            className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sky-500/5 blur-3xl pointer-events-none"
          />

          {/* Dot-grid texture */}
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

          {/* Copy */}
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
              Almost there
            </motion.span>

            <motion.h1
              variants={fadeUp}
              className="font-display text-4xl xl:text-5xl font-medium leading-[1.18] text-white mb-6"
            >
              Confirm your
              <br />
              <span className="italic text-amber-300/90">identity.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-sm leading-relaxed text-slate-400 max-w-sm"
            >
              We sent a secure one-time passcode to your email. Enter it to
              complete sign-in — it expires in 5 minutes.
            </motion.p>

            {/* Security callouts */}
            <motion.div variants={fadeUp} className="mt-10 space-y-3">
              {[
                {
                  icon: "🔒",
                  text: "Passcodes are single-use and time-limited",
                },
                {
                  icon: "📬",
                  text: "Check your spam folder if you don't see it",
                },
                {
                  icon: "🛡️",
                  text: "We'll never ask for this code over the phone",
                },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <span className="text-base leading-none mt-0.5">{icon}</span>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {text}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Floating AI image */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="relative self-end"
          >
            <div className="relative w-44 h-44 xl:w-52 xl:h-52">
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.55, 0.3] }}
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
            {/* Heading */}
            <motion.div variants={fadeUp} className="mb-8">
              <h2 className="font-display text-2xl font-medium text-white mb-1.5">
                Enter your code
              </h2>
              {maskedEmail && (
                <p className="text-sm text-slate-500">
                  Sent to{" "}
                  <span className="text-slate-300 font-medium">
                    {maskedEmail}
                  </span>
                </p>
              )}
            </motion.div>

            <motion.form
              variants={fadeUp}
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              {/* OTP digit boxes */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-3 tracking-wide">
                  One-time passcode
                </label>
                <div className="flex gap-2.5" onPaste={handlePaste}>
                  {digits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => {
                        inputRefs.current[i] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(i, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(i, e)}
                      className="otp-input w-full aspect-square text-center text-lg font-semibold text-white bg-white/[0.04] border border-white/10 rounded-xl outline-none transition-all duration-200 tracking-widest"
                    />
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || digits.join("").length < OTP_LENGTH}
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
                    Verifying…
                  </span>
                ) : (
                  "Verify & Continue →"
                )}
              </button>
            </motion.form>

            {/* Divider */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-3 my-7"
            >
              <div className="flex-1 h-px bg-white/[0.07]" />
              <span className="text-[11px] text-slate-600 tracking-wider uppercase">
                Didn't receive it?
              </span>
              <div className="flex-1 h-px bg-white/[0.07]" />
            </motion.div>

            {/* Resend + back */}
            <motion.div
              variants={fadeUp}
              className="flex items-center justify-between"
            >
              <button
                type="button"
                onClick={() => router.push("/")}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors duration-200"
              >
                ← Back to sign-in
              </button>
              <button
                type="button"
                className="text-xs text-amber-400/70 hover:text-amber-400 transition-colors duration-200 font-medium"
                onClick={() => toast("Resend feature coming soon.")}
              >
                Resend code
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
