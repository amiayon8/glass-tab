import { cacheLife, cacheTag } from "next/cache";

type APOD = {
    date: string;
    explanation?: string;
    hdurl?: string;
    media_type?: string;
    service_version?: string;
    title: string;
    url?: string;
    copyright?: string;
    link: string;
};

let memoryCache: APOD | null = null;
let expiresAt = 0;

async function fetchApod(): Promise<APOD> {
    const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";

    const res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`,
        {
            next: { revalidate: 3600 },
        }
    );

    if (!res.ok) {
        throw new Error(`NASA API returned ${res.status}`);
    }

    const data = await res.json();

    if ("error" in data) {
        throw new Error(data.error.message);
    }

    const dateStr = data.date || new Date().toISOString().split("T")[0];
    const link = `https://apod.nasa.gov/apod/ap${dateStr.replace(/-/g, "").slice(2)}.html`;

    return {
        ...data,
        hdurl: data.hdurl || data.url,
        link,
    };
}

function getNextMidnightET() {
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(now);

    const year = Number(parts.find((p) => p.type === "year")!.value);
    const month = Number(parts.find((p) => p.type === "month")!.value);
    const day = Number(parts.find((p) => p.type === "day")!.value);

    const tomorrow = new Date(Date.UTC(year, month - 1, day + 1));

    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: "America/New_York",
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
    });

    while (true) {
        const p = formatter.formatToParts(tomorrow);
        const hour = Number(p.find((x) => x.type === "hour")!.value);

        if (hour === 0) {
            return tomorrow.getTime();
        }

        tomorrow.setUTCMinutes(tomorrow.getUTCMinutes() + 30);
    }
}

export async function getCachedData(): Promise<APOD> {
    "use cache";
    cacheLife("hours");
    cacheTag("nasa-apod");

    const now = Date.now();

    if (!memoryCache || now >= expiresAt) {
        try {
            const fresh = await fetchApod();
            memoryCache = fresh;
            expiresAt = Number(getNextMidnightET());
        } catch (err) {
            console.error("Failed to refresh APOD cache:", err);
            if (memoryCache) {
                return memoryCache;
            }
            throw err;
        }
    }

    return memoryCache;
}