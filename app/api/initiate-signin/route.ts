import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Redis } from "@upstash/redis";

type SignInRequest = {
  email: string;
  name: string;
};

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    const body: SignInRequest = await req.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // ✅ 1. Generate OTP
    const otp = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 10)
    ).join("");
    const expiry = Date.now() + 5 * 60 * 1000; // 5 min in ms

    await redis.set(
      `otp:${email}`,
      JSON.stringify({ otp, name, expires: expiry }),
      { ex: 300 }
    );

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Hi ${name},\n\nYour OTP is: ${otp}. It will expire in 5 minutes.\n\nRegards,\nTeam`,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: `OTP sent successfully to ${email}`,
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json(
      { error: "Failed to send OTP", details: String(error) },
      { status: 500 }
    );
  }
}
