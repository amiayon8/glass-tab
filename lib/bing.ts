type BingWallpaper = {
    title: string;
    copyright: string;
    hdurl: string;
    link: string;
};

let cache: BingWallpaper | null = null;
let expiresAt = 0;

type BingData = {
    images: {
        startdate: string;
        fullstartdate: string;
        enddate: string;
        url: string;
        urlbase: string;
        copyright: string;
        copyrightlink: string;
        title: string;
        quiz: string;
        wp: boolean;
        hsh: string;
        drk: number;
        top: number;
        bot: number;
        hs: [];
    }[];
};

async function fetchBing(): Promise<BingWallpaper> {
    const res = await fetch(
        "https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1",
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error(`Bing API returned ${res.status}`);
    }

    const data: BingData = await res.json();

    const image = data.images[0];

    return {
        title: image.title,
        copyright: image.copyright,
        hdurl: `https://www.bing.com${image.url}`,
        link: `${image.copyrightlink}`,
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

export async function getCachedData(): Promise<BingWallpaper> {
    const now = Date.now();

    if (!cache || now >= expiresAt) {
        try {
            cache = await fetchBing();
            expiresAt = getNextMidnightET();
        } catch (err) {
            console.error("Failed to refresh Bing cache:", err);

            if (cache) return cache;
            throw err;
        }
    }

    return cache;
}