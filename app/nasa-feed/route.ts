import { NextResponse } from "next/server";
import { getCachedData } from "@/lib/apod";

export async function GET() {
    try {
        const data = await getCachedData();

        return NextResponse.json(data, {
            status: 200,
            headers: {
                "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
            },
        });
    } catch (error) {
        console.error("APOD route error:", error);

        return NextResponse.json(
            {
                error: "Failed to fetch Astronomy Picture of the Day.",
            },
            { status: 503 }
        );
    }
}