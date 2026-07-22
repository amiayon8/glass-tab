import { getCachedData as getApodData } from "@/lib/apod";
import GlassTabClient, { WallpaperData } from "@/components/GlassTabClient";
import { cacheLife, cacheTag } from "next/cache";

export default async function Home() {
  "use cache";
  cacheLife("hours");
  cacheTag("home-page");

  let initialWallpaper: WallpaperData = {};
  try {
    const apod = await getApodData();
    if (apod) {
      initialWallpaper = {
        hdurl: apod.hdurl || apod.url,
        title: apod.title,
        copyright: apod.copyright,
        link: apod.link,
      };
    }
  } catch (err) {
    console.error("Failed to load initial wallpaper on server:", err);
  }

  return (
    <GlassTabClient
      initialWallpaperData={initialWallpaper}
      initialProvider="NASA"
    />
  );
}
