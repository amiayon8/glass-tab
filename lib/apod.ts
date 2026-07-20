type APOD = Awaited<ReturnType<typeof fetchApod>>;

let cache: APOD | null = null;
let expiresAt = 0;

async function fetchApod() {
    const apiKey = process.env.NASA_API_KEY!;

    const res = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error(`NASA API returned ${res.status}`);
    }

    const data = await res.json();

    if ("error" in data) {
        throw new Error(data.error.message);
    }

    return data;
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

export async function getCachedData() {
    const now = Date.now();

    if (!cache || now >= expiresAt) {
        try {
            const fresh = await fetchApod();

            cache = fresh;
            expiresAt = Number(getNextMidnightET());
        } catch (err) {
            console.error("Failed to refresh APOD cache:", err);

            if (cache) {
                return cache;
            }

            throw err;
        }
    }

    return cache;
}