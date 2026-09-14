import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";
import Lead from "@/models/Lead";
import Interaction from "@/models/Interaction";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const user = await getAuthenticatedUser();

    await connectDB();

    const { id } = await params;

    console.log("GET interactions - leadId:", id);
    console.log("GET interactions - user:", user);

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lead ID",
        },
        { status: 400 }
      );
    }

    const leadQuery: Record<string, unknown> = {
      _id: id,
    };

    if (user.role !== "Admin") {
      leadQuery.createdBy = user.userId;
    }

    const lead = await Lead.findOne(leadQuery).lean();

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found",
        },
        { status: 404 }
      );
    }

    const interactions = await Interaction.find({
      leadId: id,
    })
      .sort({ date: -1, createdAt: -1 })
      .lean();

    console.log("Interactions found:", interactions.length);

    return NextResponse.json({
      success: true,
      interactions,
    });

  } catch (error: unknown) {
    console.error("GET interactions error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown error";

    if (message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message,
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: Params
) {
  try {
    const user = await getAuthenticatedUser();

    await connectDB();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lead ID",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const {
      date,
      status,
      material,
      sale_amount,
      remarks,
      next_follow_up,
      contact_person,
      contact_no,
      email,
    } = body;

    if (
      !date ||
      !status ||
      !material ||
      !remarks?.trim() ||
      !next_follow_up ||
      !contact_person?.trim() ||
      !contact_no?.trim()
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required interaction fields are missing",
        },
        { status: 400 }
      );
    }

    const leadQuery: Record<string, any> = {
      _id: id,
    };

    if (user.role !== "Admin") {
      leadQuery.createdBy = user.userId;
    }

    const lead = await Lead.findOne(leadQuery);

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found",
        },
        { status: 404 }
      );
    }

    const interaction = await Interaction.create({
      leadId: lead._id,

      date,

      contact_person: contact_person.trim(),
      contact_no: contact_no.trim(),
      email: email?.trim() || "",
      sale_amount:
        sale_amount !== undefined &&
        sale_amount !== null &&
        sale_amount !== ""
          ? Number(sale_amount)
          : null,

      status,
      material,

      remarks: remarks.trim(),
      next_follow_up,

      createdBy: user.userId,
    });

    // Latest interaction becomes current Lead information
    lead.status = status;
    lead.contact_person = contact_person.trim();
    lead.contact_no = contact_no.trim();
    lead.phone = contact_no.trim();

    if (email?.trim()) {
      lead.email = email.trim();
    }

    lead.remarks = remarks.trim();
    lead.nextFollowup = next_follow_up;
    lead.latestFollowup = date;

    // 👇 YEH ADD KIYA — sale_amount lead me bhi save karo
    lead.sale_amount =
      sale_amount !== undefined &&
      sale_amount !== null &&
      sale_amount !== ""
        ? Number(sale_amount)
        : null;

    // 👇 YEH ADD KIYA — material lead me bhi save karo
    lead.material = material || "";

    lead.updatedBy = new Types.ObjectId(user.userId);

    await lead.save();

    return NextResponse.json(
      {
        success: true,
        message: "Interaction saved successfully",
        interaction,
        lead,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST interaction error:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to save interaction",
      },
      { status: 500 }
    );
  }
}