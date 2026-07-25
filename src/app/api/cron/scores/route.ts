import { NextResponse } from "next/server";
import { calculateAndStorePoints } from "@/services/sync";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await calculateAndStorePoints();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Score calculation failed", details: String(error) },
      { status: 500 }
    );
  }
}
