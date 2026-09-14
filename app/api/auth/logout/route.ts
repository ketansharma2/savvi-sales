import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

export async function POST() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("refreshToken")?.value;

    // Invalidate refresh token in database
    if (token && REFRESH_TOKEN_SECRET) {
      try {
        const decoded = jwt.verify(
          token,
          REFRESH_TOKEN_SECRET
        ) as { userId: string };

        const refreshTokenHash = crypto
          .createHash("sha256")
          .update(token)
          .digest("hex");

        await User.findOneAndUpdate(
          {
            _id: decoded.userId,
            refreshTokenHash,
          },
          {
            $unset: {
              refreshTokenHash: 1,
              refreshTokenExpiresAt: 1,
            },
          }
        );
      } catch {
        // Token already invalid/expired.
        // Cookies will still be cleared.
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Logout successful",
    });

    // Clear access token
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
      maxAge: 0,
    });

    // Clear refresh token
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      expires: new Date(0),
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
      },
      { status: 500 }
    );
  }
}