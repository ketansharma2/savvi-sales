import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export async function POST() {
  try {
    if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
      return NextResponse.json(
        { success: false, message: "JWT secrets are not configured" },
        { status: 500 }
      );
    }

    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Refresh token not found" },
        { status: 401 }
      );
    }

    // 1. Verify refresh token
    let decoded: jwt.JwtPayload & { userId: string; type: string };
    try {
      decoded = jwt.verify(
        refreshToken,
        REFRESH_TOKEN_SECRET
      ) as jwt.JwtPayload & { userId: string; type: string };
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired refresh token" },
        { status: 401 }
      );
    }

    if (!decoded.userId || decoded.type !== "refresh") {
      return NextResponse.json(
        { success: false, message: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // 2. DB se user fetch karo — role aur hash verify karne ke liye
    await connectDB();

    const user = await User.findById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 401 }
      );
    }

    // 3. Refresh token hash verify karo — DB me stored hash se match
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    if (user.refreshTokenHash !== refreshTokenHash) {
      return NextResponse.json(
        { success: false, message: "Refresh token revoked" },
        { status: 401 }
      );
    }

    if (
      !user.refreshTokenExpiresAt ||
      new Date(user.refreshTokenExpiresAt) < new Date()
    ) {
      return NextResponse.json(
        { success: false, message: "Refresh token expired" },
        { status: 401 }
      );
    }

    // 4. Naya access token banao — DB se role lo
    const newAccessToken = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role,   // ✅ ab sahi role aayega
      },
      ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Access token refreshed",
    });

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    });

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);

    return NextResponse.json(
      { success: false, message: "Invalid or expired refresh token" },
      { status: 401 }
    );
  }
}