import { NextResponse } from "next/server";
import { syncFixtures, syncLiveScores } from "@/services/sync";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = [];
    for (let matchday = 1; matchday <= 38; matchday++) {
      try {
        const result = await syncFixtures(matchday);
        results.push({ matchday, ...result });
      } catch (e) {
        results.push({ matchday, error: String(e) });
      }
    }

    const liveResult = await syncLiveScores();

    return NextResponse.json({
      success: true,
      fixtures: results,
      live: liveResult,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Sync failed", details: String(error) },
      { status: 500 }
    );
  }
}
