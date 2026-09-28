import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/services/availability/get-availability";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get("serviceId") || "";
    const date = searchParams.get("date") || "";
    const preferredStaffId = searchParams.get("preferredStaffId") || undefined;

    const result = await getAvailability({
      serviceId,
      date,
      preferredStaffId,
    });

    if (!result.available && result.reason === "INVALID_INPUT") {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return NextResponse.json(
      {
        available: false,
        reason: "NO_AVAILABILITY",
        error: errorMessage,
        staff: [],
        anyStaffSlots: [],
      },
      { status: 500 }
    );
  }
}
