import { NextRequest, NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import userModel, { createToken, verifyToken } from "@/lib/models/user.model";
import { connectToDB } from "@/lib/db/db";
import Session from "@/lib/models/session.model";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function POST(req: NextRequest) {
  const { email, otp, name } = await req.json();

  if (!email || !otp) {
    return NextResponse.json(
      { error: "Email and OTP required" },
      { status: 400 }
    );
  }

  try {
    const data = await redis.get(`otp:${email}`);
    if (!data) {
      return NextResponse.json(
        { error: "No OTP found or expired" },
        { status: 400 }
      );
    }

    const {
      otp: storedOtp,
      name,
      expires,
    } = data as { otp: string; name: string; expires: number };

    if (Date.now() > expires) {
      await redis.del(`otp:${email}`);
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    if (otp !== storedOtp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    // ✅ OTP valid — remove it
    await redis.del(`otp:${email}`);
    await connectToDB();

    // Check if user already exists
    let existingUser = await userModel.findOne({ email });
    if (existingUser) {
      const token = await createToken(existingUser);

      const isTokenValid = await verifyToken(token);
      if (!isTokenValid) {
        return NextResponse.json(
          { error: "Token verification failed" },
          { status: 500 }
        );
      }

      const res = NextResponse.json({
        success: true,
        user: existingUser,
        token,
      });
      res.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
      });
      return res;
    }

    const newUser = await userModel.create({ email, name });

    const token = await createToken(newUser);
    const isTokenValid = await verifyToken(token);
    if (!isTokenValid) {
      return NextResponse.json(
        { error: "Token verification failed" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({ success: true, user: newUser, token });
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    return res;
  } catch (error) {
    console.error("Error in OTP verification:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
