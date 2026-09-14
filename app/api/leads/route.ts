import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/lib/mongodb";

import Lead from "@/models/Lead";
import { getAuthenticatedUser } from "@/lib/auth";

// ===============================
// GET /api/leads
// ===============================
export async function GET() {
  try {
    await connectDB();

    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const query =
      user.role === "admin"
        ? {}
        : {
            createdBy: user.userId,
          };

    const leads = await Lead.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      leads,
    });
  } catch (error: any) {
    console.error("GET /api/leads error:", error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch leads",
      },
      { status: 500 }
    );
  }
}

// ===============================
// POST /api/leads
// ===============================
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      company,
      category,
      state,
      district_city,
      location,
      reference,
      sourcingDate,
      startup,
      projection,
    } = body;

    // ===============================
    // Required fields
    // ===============================

    if (!company?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Company is required",
        },
        { status: 400 }
      );
    }

    if (!category?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Category is required",
        },
        { status: 400 }
      );
    }

    if (!state?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "State is required",
        },
        { status: 400 }
      );
    }

    if (!sourcingDate) {
      return NextResponse.json(
        {
          success: false,
          message: "Sourcing date is required",
        },
        { status: 400 }
      );
    }

    // ===============================
    // Date validation
    // ===============================

    if (!/^\d{4}-\d{2}-\d{2}$/.test(sourcingDate)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid sourcing date. Use YYYY-MM-DD",
        },
        { status: 400 }
      );
    }

    // ===============================
    // Startup validation
    // ===============================

    const allowedStartup = [
      "Yes",
      "No",
      "Master Union",
    ];

    if (!allowedStartup.includes(startup)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid startup value",
        },
        { status: 400 }
      );
    }

    // ===============================
    // Projection validation
    // ===============================

    const allowedProjection = [
      "Not Projected",
      "WP > 50",
      "WP < 50",
      "MP > 50",
      "MP < 50",
    ];

    if (!allowedProjection.includes(projection)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid projection value",
        },
        { status: 400 }
      );
    }

    // ===============================
    // User ID validation
    // ===============================

    if (!mongoose.Types.ObjectId.isValid(user.userId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid user ID",
        },
        { status: 400 }
      );
    }

    // ===============================
    // Create Lead
    // ===============================

    const lead = await Lead.create({
      company: company.trim(),
      category: category.trim(),
      state: state.trim(),

      district_city: district_city?.trim() || "",
      location: location?.trim() || "",
      reference: reference?.trim() || "",

      sourcingDate,

      startup,
      projection,

      // Default values
      status: "New",

      contact_person: "",
      contact_no: "",
      phone: "",
      email: "",
      remarks: "",

      nextFollowup: "",
      latestFollowup: sourcingDate,

      isSubmitted: false,
      everContractShare: false,

      createdBy: new mongoose.Types.ObjectId(user.userId),
      updatedBy: new mongoose.Types.ObjectId(user.userId),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Lead created successfully",
        lead,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/leads error:", error);

    // Mongoose validation error
    if (error?.name === "ValidationError") {
      const messages = Object.values(error.errors || {}).map(
        (err: any) => err.message
      );

      return NextResponse.json(
        {
          success: false,
          message: messages.join(", ") || "Validation failed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create lead",
      },
      { status: 500 }
    );
  }
}