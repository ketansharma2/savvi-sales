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

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid lead ID",
        },
        { status: 400 }
      );
    }

    const query: Record<string, any> = {
      _id: id,
    };

    if (user.role !== "Admin") {
      query.createdBy = user.userId;
    }

    const lead = await Lead.findOne(query).lean();

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lead,
    });
  } catch (error: any) {
    console.error("GET lead error:", error);

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
        message: "Failed to fetch lead",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const allowedUpdates = {
      company: body.company,
      category: body.category,
      state: body.state,
      district_city: body.district_city,
      location: body.location,
      reference: body.reference,
      sourcingDate: body.sourcingDate,
      startup: body.startup,
      projection: body.projection,
    };

    const query: Record<string, any> = {
      _id: id,
    };

    if (user.role !== "Admin") {
      query.createdBy = user.userId;
    }

    const lead = await Lead.findOneAndUpdate(
      query,
      {
        $set: {
          ...allowedUpdates,
          updatedBy: user.userId,
        },
      },
      {
        new: true,
        runValidators: true,
      }
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

    return NextResponse.json({
      success: true,
      message: "Lead updated successfully",
      lead,
    });
  } catch (error: any) {
    console.error("PUT lead error:", error);

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
        message: "Failed to update lead",
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

    const query: Record<string, any> = {
      _id: id,
    };

    if (user.role !== "Admin") {
      query.createdBy = user.userId;
    }

    const lead = await Lead.findOne(query);

    if (!lead) {
      return NextResponse.json(
        {
          success: false,
          message: "Lead not found",
        },
        { status: 404 }
      );
    }

    // Submitted lead cannot be deleted
    if (lead.isSubmitted) {
      return NextResponse.json(
        {
          success: false,
          message: "Submitted lead cannot be deleted",
        },
        { status: 403 }
      );
    }

    await Interaction.deleteMany({
      leadId: lead._id,
    });

    await Lead.deleteOne({
      _id: lead._id,
    });

    return NextResponse.json({
      success: true,
      message: "Lead deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE lead error:", error);

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
        message: "Failed to delete lead",
      },
      { status: 500 }
    );
  }
}