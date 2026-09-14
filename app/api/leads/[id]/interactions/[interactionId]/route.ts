import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";
import Lead from "@/models/Lead";
import Interaction from "@/models/Interaction";

type Params = {
  params: Promise<{
    id: string;
    interactionId: string;
  }>;
};

async function getLead(
  id: string,
  userId: string,
  role: string
) {
  const query: Record<string, any> = {
    _id: id,
  };

  if (role !== "Admin") {
    query.createdBy = userId;
  }

  return Lead.findOne(query);
}

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const user = await getAuthenticatedUser();

    await connectDB();

    const { id, interactionId } = await params;

    if (
      !Types.ObjectId.isValid(id) ||
      !Types.ObjectId.isValid(interactionId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ID",
        },
        { status: 400 }
      );
    }

    const lead = await getLead(
      id,
      user.userId,
      user.role
    );

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found",
        },
        { status: 404 }
      );
    }

    const body = await request.json();

    const interaction = await Interaction.findOne({
      _id: interactionId,
      leadId: id,
    });

    if (!interaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Interaction not found",
        },
        { status: 404 }
      );
    }

    const {
      date,
      contact_person,
      contact_no,
      email,
      status,
      material,
      remarks,
      next_follow_up,
    } = body;

    if (
      !date ||
      !contact_person?.trim() ||
      !contact_no?.trim() ||
      !status ||
      !material ||
      !remarks?.trim() ||
      !next_follow_up
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Required fields are missing",
        },
        { status: 400 }
      );
    }

    interaction.date = date;
    interaction.contact_person = contact_person.trim();
    interaction.contact_no = contact_no.trim();
    interaction.email = email?.trim() || "";
    interaction.status = status;
    interaction.material = material;
    interaction.remarks = remarks.trim();
    interaction.next_follow_up = next_follow_up;
    interaction.updatedBy = new Types.ObjectId(user.userId);

    await interaction.save();

    // Update Lead with latest interaction
    lead.status = status;
    lead.contact_person = contact_person.trim();
    lead.contact_no = contact_no.trim();
    lead.phone = contact_no.trim();
    lead.email = email?.trim() || lead.email;
    lead.remarks = remarks.trim();
    lead.nextFollowup = next_follow_up;
    lead.latestFollowup = date;
    lead.updatedBy = new Types.ObjectId(user.userId);

    await lead.save();

    return NextResponse.json({
      success: true,
      message: "Interaction updated successfully",
      interaction,
      lead,
    });
  } catch (error: any) {
    console.error("PUT interaction error:", error);

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
        message: "Failed to update interaction",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: Params
) {
  try {
    const user = await getAuthenticatedUser();

    await connectDB();

    const { id, interactionId } = await params;

    if (
      !Types.ObjectId.isValid(id) ||
      !Types.ObjectId.isValid(interactionId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid ID",
        },
        { status: 400 }
      );
    }

    const lead = await getLead(
      id,
      user.userId,
      user.role
    );

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found",
        },
        { status: 404 }
      );
    }

    const interaction = await Interaction.findOne({
      _id: interactionId,
      leadId: id,
    });

    if (!interaction) {
      return NextResponse.json(
        {
          success: false,
          message: "Interaction not found",
        },
        { status: 404 }
      );
    }

    await Interaction.deleteOne({
      _id: interactionId,
    });

    return NextResponse.json({
      success: true,
      message: "Interaction deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE interaction error:", error);

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
        message: "Failed to delete interaction",
      },
      { status: 500 }
    );
  }
}