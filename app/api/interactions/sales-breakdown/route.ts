import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getAuthenticatedUser } from "@/lib/auth";
import Interaction from "@/models/Interaction";
import Lead from "@/models/Lead";
import { Types } from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const fromDate = searchParams.get("fromDate") || "";
    const toDate = searchParams.get("toDate") || "";
    const isAllData = searchParams.get("isAllData") === "true";

    // 1. User ke leads ka filter
    const leadQuery: Record<string, any> = {};
    if (user.role !== "Admin") {
      leadQuery.createdBy = new Types.ObjectId(user.userId);
    }

    const userLeads = await Lead.find(leadQuery).select("_id").lean();
    const leadIds = userLeads.map((l) => l._id);

    // 2. Interaction filter
    const interactionQuery: Record<string, any> = {
      leadId: { $in: leadIds },
    };

    // Date filter (interaction.date is a string YYYY-MM-DD)
    if (!isAllData && (fromDate || toDate)) {
      interactionQuery.date = {};
      if (fromDate) interactionQuery.date.$gte = fromDate;
      if (toDate) interactionQuery.date.$lte = toDate;
    }

    // 3. Aggregate material-wise
    const breakdown = await Interaction.aggregate([
      { $match: interactionQuery },
      {
        $group: {
          _id: {
            $cond: [
              {
                $or: [
                  { $eq: ["$material", null] },
                  { $eq: ["$material", ""] },
                ],
              },
              "Other",
              "$material",
            ],
          },
          count: { $sum: 1 },
          total: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$sale_amount", null] },
                    { $eq: ["$sale_amount", ""] },
                    { $eq: [{ $type: "$sale_amount" }, "missing"] },
                  ],
                },
                0,
                { $toDouble: "$sale_amount" },
              ],
            },
          },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const formatted = breakdown.map((item) => ({
      material: item._id,
      count: item.count,
      total: item.total,
    }));

    const grandTotal = formatted.reduce(
      (sum, item) => sum + item.total,
      0
    );

    return NextResponse.json({
      success: true,
      breakdown: formatted,
      grandTotal,
    });
  } catch (error: any) {
    console.error("Sales breakdown error:", error);

    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, message: "Failed to fetch breakdown" },
      { status: 500 }
    );
  }
}