import { cookies } from "next/headers";
import jwt, { JwtPayload } from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;

export interface AuthenticatedUser {
  userId: string;
  role: string;
}

interface AccessTokenPayload extends JwtPayload {
  userId: string;
  role: string;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  if (!ACCESS_TOKEN_SECRET) {
    throw new Error("ACCESS_TOKEN_SECRET is not configured");
  }

  try {
    const decoded = jwt.verify(
      accessToken,
      ACCESS_TOKEN_SECRET
    ) as unknown as AccessTokenPayload;

    if (
      typeof decoded.userId !== "string" ||
      typeof decoded.role !== "string"
    ) {
      throw new Error("Invalid authentication token");
    }

    return {
      userId: decoded.userId,
      role: decoded.role,
    };
  } catch (error) {
    console.error("Authentication error:", error);
    throw new Error("Unauthorized");
  }
}