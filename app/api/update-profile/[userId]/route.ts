import { connectToDB } from "@/lib/db/db";
import userModel from "@/lib/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest) {
  const userId = req.nextUrl.pathname.split("/").pop();
  const body = await req.json();
  const { name } = body;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    await connectToDB();
    await userModel.findByIdAndUpdate(userId, { name });

    return NextResponse.json(
      { message: "Profile updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
