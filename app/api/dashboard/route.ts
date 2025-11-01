import { NextResponse } from "next/server";
import { getDashboardSnapshot } from "../../../lib/dashboard";

export async function GET() {
  try {
    const snapshot = await getDashboardSnapshot();
    return NextResponse.json(snapshot);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message ?? "Failed to load dashboard"
      },
      { status: 500 }
    );
  }
}
