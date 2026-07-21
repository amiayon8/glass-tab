"use client";

import { useEffect, useState } from "react";

import Image from "next/image";
import { FaSearch } from "react-icons/fa";
import { FaPlus, FaTrash, FaX, FaPen, FaPencil, FaChevronDown, FaCheck } from "react-icons/fa6";

type FrequentlyVisited = {
  id: string;
  title: string;
  url: string;
  iconUrl: string;
};

const STORAGE_KEY = "frequentlyVisited";

type SearchEngine = {
  name: string;
  url: string;
  placeholder: string;
};

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
  tooltips: {
    loading: string;
    previous: string;
    next: string;
    walle: string;
    walls: string;
  }
}

const SEARCH_ENGINES: SearchEngine[] = [
  { name: "Google", url: "https://www.google.com/search?q=", placeholder: "Search Google..." },
  { name: "Bing", url: "https://www.bing.com/search?q=", placeholder: "Search Bing..." },
  { name: "DuckDuckGo", url: "https://duckduckgo.com/?q=", placeholder: "Search DuckDuckGo..." },
  { name: "Yahoo", url: "https://search.yahoo.com/search?p=", placeholder: "Search Yahoo..." },
  { name: "Ecosia", url: "https://www.ecosia.org/search?q=", placeholder: "Search Ecosia..." },
  { name: "Baidu", url: "https://www.baidu.com/s?wd=", placeholder: "Search Baidu..." },
  { name: "Yandex", url: "https://yandex.com/search/?text=", placeholder: "Search Yandex..." },
];

const defaultShortcuts = [
  {
    "id": "b02b99fe-cb14-4c01-bc74-296a65adf8f6",
    "title": "Instagram",
    "url": "https://instagram.com",
    "iconUrl": "https://www.google.com/s2/favicons?domain=instagram.com&sz=64"
  },
  {
    "id": "43c421ab-b785-47bd-b4a0-3184762acdd3",
    "title": "YouTube",
    "url": "https://youtube.com",
    "iconUrl": "https://www.google.com/s2/favicons?domain=youtube.com&sz=64"
  },
  {
    "id": "22e4cdbc-5497-4f4a-8450-61d069abf4b9",
    "title": "Slack",
    "url": "https://slack.com",
    "iconUrl": "https://www.google.com/s2/favicons?domain=slack.com&sz=64"
  },
  {
    "id": "5b146159-ced0-41e1-95e3-558d98f6bc66",
    "title": "Stardance",
    "url": "https://stardance.hackclub.com",
    "iconUrl": "https://www.google.com/s2/favicons?domain=stardance.hackclub.com&sz=64"
  },
  {
    "id": "8e4a3e20-4131-4422-aa3a-697e08a59c34",
    "title": "Gmail",
    "url": "https://gmail.com",
    "iconUrl": "https://ssl.gstatic.com/ui/v1/icons/mail/logo_loading_2x.png"
  },
  {
    "id": "b9febde0-f06a-4e32-8ea9-9295aaf34f9f",
    "title": "ChatGPT",
    "url": "https://chatgpt.com",
    "iconUrl": "https://www.google.com/s2/favicons?domain=chatgpt.com&sz=64"
  },
  {
    "id": "241ce6e1-796f-44af-82df-e74f3d26556c",
    "title": "Gemini",
    "url": "https://gemini.google.com",
    "iconUrl": "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=64"
  }
]

const wallpaperProviders = [
  "NASA", "Bing",
]

export default function Home() {
  const [wallpaperData, setWallpaperData] = useState<any>();
  const [wallpaperFetched, setWallpaperFetched] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [frequentlyVisited, setFrequentlyVisited] = useState<FrequentlyVisited[]>([]);
  const [addFrequentyVisited, setAddFrequentlyVisited] = useState<boolean>(false);
  const [customizing, setCustomizing] = useState<boolean>(false);
  const [addSiteData, setAddSiteData] = useState<FrequentlyVisited>({
    id: crypto.randomUUID(),
    title: "",
    url: "",
    iconUrl: "",
  });
  const [wallpaperProvider, setWallpaperProvider] = useState<string>(wallpaperProviders[0]);
  const [wallpaperDropdownOpen, setWallpaperDropdownOpen] = useState<boolean>(false);

  const [editingSite, setEditingSite] = useState<FrequentlyVisited | null>(
    null,
  );
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(SEARCH_ENGINES[0]);
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!stored) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultShortcuts));
        setFrequentlyVisited(defaultShortcuts);
        return;
      }

      setFrequentlyVisited(JSON.parse(stored));
    };

    load();

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        load();
      }
    };

    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const save = (data: FrequentlyVisited[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setFrequentlyVisited(data);
  };

  const addSite = (site: FrequentlyVisited) => {
    save([...frequentlyVisited, site]);
  };

  const editSite = (id: string, updates: Partial<FrequentlyVisited>) => {
    save(
      frequentlyVisited.map((site) =>
        site.id === id ? { ...site, ...updates } : site,
      ),
    );
  };

  const removeSite = (id: string) => {
    save(frequentlyVisited.filter((site) => site.id !== id));
  };

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      setDraggedIndex(index);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (
    e: React.DragEvent<HTMLDivElement>,
    targetIndex: number,
  ) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const updatedList = [...frequentlyVisited];
    const [draggedItem] = updatedList.splice(draggedIndex, 1);
    updatedList.splice(targetIndex, 0, draggedItem);

    setDraggedIndex(targetIndex);
    save(updatedList);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  useEffect(() => {
    const fetchWallpaper = async () => {
      try {
        const endpoint =
          wallpaperProvider === "Bing" ? "/bing-wallpaper" : "/nasa-feed";

        const res = await fetch(endpoint);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();

        setWallpaperData(data);
        setWallpaperFetched(true);
      } catch (err) {
        console.error("Failed to fetch wallpaper:", err);
      }
    };

    fetchWallpaper();
  }, [wallpaperProvider]);

  useEffect(() => {
    const storedEngineName = localStorage.getItem("searchEngine");
    if (storedEngineName) {
      const engine = SEARCH_ENGINES.find((e) => e.name === storedEngineName);
      if (engine) {
        setSelectedEngine(engine);
      }
    }
  }, []);

  useEffect(() => {
    const storedWallpaperProvider = localStorage.getItem("wallpaperProvider");
    if (storedWallpaperProvider) {
      const provider = wallpaperProviders.find((e) => e === storedWallpaperProvider);
      if (provider) {
        setWallpaperProvider(provider);
      }
    }
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim() !== "") {
      window.location.href = `${selectedEngine.url}${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="relative w-dvw h-dvh">
      <div className={`z-0 fixed inset-0 bg-black size-full transition-all`}>
        {wallpaperFetched && (
          <Image
            src={wallpaperData?.hdurl}
            alt="Background"
            fill
            className="opacity-75 object-cover"
          />
        )}
      </div>

      <div className="top-24 left-1/2 absolute -translate-x-1/2">
        <div className="relative hover:scale-103 transition-all duration-300">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
            name="search"
            className="hover:inset-shadow-md bg-white/5 hover:bg-white/10 shadow-lg backdrop-blur-sm px-4 py-2 pr-10 border border-white/15 focus:border-white/15 rounded-full focus:outline-0 focus:ring-0 md:min-w-md lg:min-w-lg text-white text-sm"
            placeholder={selectedEngine.placeholder}
          />
          <button
            disabled={searchQuery === ""}
            onClick={handleSearch}
            className={`top-0 right-0 absolute flex justify-center items-center rounded-r-full w-10 transition-all duration-300 hover:text-gray-100 group h-full ${searchQuery === "" ? "text-gray-300" : "text-white"}`}
          >
            <FaSearch className="size-sm group-hover:scale-105 transition-all duration-300" />
          </button>
        </div>
      </div>

      <div className="top-40 left-1/2 absolute flex flex-row flex-wrap justify-center items-center gap-4 text-center -translate-x-1/2">
        {frequentlyVisited.map((site, index) => (
          <div
            key={site.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, index)}
            onDragEnd={handleDragEnd}
            className={`cursor-grab active:cursor-grabbing transition-all duration-200 ${draggedIndex === index ? "opacity-25 scale-90" : ""
              }`}
          >
            <a
              href={site.url}
              target="_blank"
              className="group relative flex flex-col justify-center items-center gap-1 bg-white/5 hover:bg-white/10 shadow-lg backdrop-blur-sm border border-white/15 rounded-2xl size-12 text-gray-200 hover:text-white hover:scale-103 transition-all duration-300"
            >
              {site.iconUrl && (
                <img
                  className="size-8 object-contain pointer-events-none"
                  src={`${site.iconUrl}`}
                  alt=""
                />
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setEditingSite(site);
                }}
                className="hidden group-hover:block top-1 left-1 absolute hover:text-blue-400 transition-all duration-300 cursor-pointer"
              >
                <FaPen className="size-2.5" />
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeSite(site.id);
                }}
                className="hidden group-hover:block top-1 right-1 absolute hover:text-red-500 transition-all duration-300 cursor-pointer"
              >
                <FaTrash className="size-2.5" />
              </button>
            </a>
            <p className="text-[11px] select-none">{site.title}</p>
          </div>
        ))}
        {frequentlyVisited.length <= 14 && (
          <div>
            <button
              onClick={() => setAddFrequentlyVisited(true)}
              className="group flex flex-col justify-center items-center gap-1 bg-white/5 hover:bg-white/10 shadow-lg backdrop-blur-sm border border-white/15 rounded-2xl size-12 text-gray-200 hover:text-white hover:scale-103 transition-all duration-300"
            >
              <FaPlus className="size-5" />
            </button>

            <p className="text-[11px]">Add</p>
          </div>
        )}
      </div>

      {addFrequentyVisited && (
        <div className="top-28 right-5 z-50 absolute bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl border border-white/15 rounded-3xl w-96 transition-all duration-300">
          <div className="absolute inset-0 bg-linear-to-br from-white/20 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />

          <div className="relative space-y-5 p-6">
            <div className="flex flex-row justify-between items-center gap-4">
              <div>
                <h2 className="font-semibold text-white text-lg">
                  Add Shortcut
                </h2>
                <p className="mt-1 text-white/60 text-sm">
                  Add a website to your frequently visited list.
                </p>
              </div>

              <button
                className="text-gray-200 hover:text-white hover:scale-101 transition-all duration-300"
                onClick={() => setAddFrequentlyVisited(false)}
              >
                <FaX />
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={addSiteData?.url}
                onChange={(e) => {
                  const url = e.target.value;

                  let iconUrl = "";

                  try {
                    const hostname = new URL(url).hostname;
                    iconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
                  } catch {
                  }

                  setAddSiteData((prev) => ({
                    ...prev,
                    url,
                    iconUrl,
                  }));
                }}
                type="url"
                placeholder="https://example.com"
                className="bg-white/5 focus:bg-white/10 px-4 py-3 border border-white/15 focus:border-white/25 rounded-xl outline-none w-full text-white placeholder:text-white/40 transition"
              />

              <input
                onChange={(e) =>
                  setAddSiteData((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                value={addSiteData?.title}
                type="text"
                placeholder="Website Name"
                className="bg-white/5 focus:bg-white/10 px-4 py-3 border border-white/15 focus:border-white/25 rounded-xl outline-none w-full text-white placeholder:text-white/40 transition"
              />

              <input
                onChange={(e) =>
                  setAddSiteData((prev) => ({
                    ...prev,
                    iconUrl: e.target.value,
                  }))
                }
                value={addSiteData?.iconUrl}
                type="url"
                placeholder="https://example.com/favicon.ico"
                className="bg-white/5 focus:bg-white/10 px-4 py-3 border border-white/15 focus:border-white/25 rounded-xl outline-none w-full text-white placeholder:text-white/40 transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setAddFrequentlyVisited(false)}
                className="bg-white/5 hover:bg-white/10 px-4 py-2 border border-white/10 rounded-xl text-white/70 text-sm transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  addSite(addSiteData);
                  setAddSiteData({
                    id: crypto.randomUUID(),
                    title: "",
                    url: "",
                    iconUrl: "",
                  });
                  setAddFrequentlyVisited(false);
                }}
                className="bg-white/15 hover:bg-white/20 px-5 py-2 border border-white/20 rounded-xl font-medium text-white text-sm transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {editingSite && (
        <div className="top-28 right-5 z-50 absolute bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl border border-white/15 rounded-3xl w-96 transition-all duration-300">
          <div className="absolute inset-0 bg-linear-to-br from-white/20 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />

          <div className="relative space-y-5 p-6">
            <div className="flex flex-row justify-between items-center gap-4">
              <div>
                <h2 className="font-semibold text-white text-lg">
                  Edit Shortcut
                </h2>
                <p className="mt-1 text-white/60 text-sm">
                  Modify the website details.
                </p>
              </div>

              <button
                className="text-gray-200 hover:text-white hover:scale-101 transition-all duration-300"
                onClick={() => setEditingSite(null)}
              >
                <FaX />
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={editingSite.url}
                onChange={(e) => {
                  const url = e.target.value;

                  let iconUrl = editingSite.iconUrl;

                  try {
                    const hostname = new URL(url).hostname;
                    iconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
                  } catch {
                  }

                  setEditingSite((prev) =>
                    prev
                      ? {
                        ...prev,
                        url,
                        iconUrl,
                      }
                      : null,
                  );
                }}
                type="url"
                placeholder="https://example.com"
                className="bg-white/5 focus:bg-white/10 px-4 py-3 border border-white/15 focus:border-white/25 rounded-xl outline-none w-full text-white placeholder:text-white/40 transition"
              />

              <input
                onChange={(e) =>
                  setEditingSite((prev) =>
                    prev
                      ? {
                        ...prev,
                        title: e.target.value,
                      }
                      : null,
                  )
                }
                value={editingSite.title}
                type="text"
                placeholder="Website Name"
                className="bg-white/5 focus:bg-white/10 px-4 py-3 border border-white/15 focus:border-white/25 rounded-xl outline-none w-full text-white placeholder:text-white/40 transition"
              />

              <input
                onChange={(e) =>
                  setEditingSite((prev) =>
                    prev
                      ? {
                        ...prev,
                        iconUrl: e.target.value,
                      }
                      : null,
                  )
                }
                value={editingSite.iconUrl}
                type="url"
                placeholder="https://example.com/favicon.ico"
                className="bg-white/5 focus:bg-white/10 px-4 py-3 border border-white/15 focus:border-white/25 rounded-xl outline-none w-full text-white placeholder:text-white/40 transition"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setEditingSite(null)}
                className="bg-white/5 hover:bg-white/10 px-4 py-2 border border-white/10 rounded-xl text-white/70 text-sm transition"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  editSite(editingSite.id, editingSite);
                  setEditingSite(null);
                }}
                className="bg-white/15 hover:bg-white/20 px-5 py-2 border border-white/20 rounded-xl font-medium text-white text-sm transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
      {customizing && (
        <div className="top-18 right-5 z-50 absolute bg-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-2xl border border-white/15 rounded-3xl w-96 transition-all duration-300">
          <div className="absolute inset-0 bg-linear-to-br from-white/20 via-white/5 to-transparent rounded-t-3xl pointer-events-none" />

          <div className="relative space-y-5 p-6">
            <div className="flex flex-row justify-between items-center gap-4">
              <div>
                <h2 className="font-semibold text-white text-lg">
                  Customize GlassTab
                </h2>
              </div>

              <button
                className="text-gray-200 hover:text-white hover:scale-101 transition-all duration-300"
                onClick={() => setCustomizing(false)}
              >
                <FaX />
              </button>
            </div>

            <div className="space-y-3">
              <div className="relative space-y-2">
                <label className="block font-semibold text-white/70 text-xs uppercase tracking-wider">
                  Default Search Engine
                </label>
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex justify-between items-center bg-white/5 hover:bg-white/10 shadow-lg backdrop-blur-sm px-4 py-3 border border-white/15 focus:border-white/20 rounded-xl focus:outline-none w-full text-white text-sm text-left transition-all cursor-pointer"
                  >
                    <span>{selectedEngine.name}</span>
                    <FaChevronDown className={`size-3.5 transition-transform duration-300 ${dropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {dropdownOpen && (
                    <>
                      <div
                        className="z-40 fixed inset-0 cursor-default"
                        onClick={() => setDropdownOpen(false)}
                      />
                      <div className="right-0 left-0 z-50 absolute bg-[#171717]/85 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl mt-2 border border-white/15 rounded-2xl divide-y divide-white/5 max-h-60 overflow-y-auto no-scrollbar">
                        {SEARCH_ENGINES.map((engine) => (
                          <button
                            key={engine.name}
                            onClick={() => {
                              setSelectedEngine(engine);
                              localStorage.setItem("searchEngine", engine.name);
                              setDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm text-left first:rounded-t-2xl last:rounded-b-2xl cursor-pointer ${selectedEngine.name === engine.name ? "bg-white/5 font-medium" : ""
                              }`}
                          >
                            <span>{engine.name}</span>
                            {selectedEngine.name === engine.name && (
                              <span className="font-semibold text-blue-400 text-xs uppercase tracking-wider"><FaCheck /></span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="relative space-y-2">
                <label className="block font-semibold text-white/70 text-xs uppercase tracking-wider">
                  Wallpaper service
                </label>
                <div className="relative">
                  <button
                    onClick={() => setWallpaperDropdownOpen(!wallpaperDropdownOpen)}
                    className="flex justify-between items-center bg-white/5 hover:bg-white/10 shadow-lg backdrop-blur-sm px-4 py-3 border border-white/15 focus:border-white/20 rounded-xl focus:outline-none w-full text-white text-sm text-left transition-all cursor-pointer"
                  >
                    <span>{wallpaperProvider}</span>
                    <FaChevronDown className={`size-3.5 transition-transform duration-300 ${wallpaperDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {wallpaperDropdownOpen && (
                    <>
                      <div
                        className="z-40 fixed inset-0 cursor-default"
                        onClick={() => setWallpaperDropdownOpen(false)}
                      />
                      <div className="right-0 left-0 z-50 absolute bg-[#171717]/85 shadow-[0_12px_40px_rgba(0,0,0,0.5)] backdrop-blur-2xl mt-2 border border-white/15 rounded-2xl divide-y divide-white/5 max-h-60 overflow-y-auto no-scrollbar">
                        {wallpaperProviders.map((provider) => (
                          <button
                            key={provider}
                            onClick={() => {
                              setWallpaperProvider(provider);
                              localStorage.setItem("wallpaperProvider", provider);
                              setWallpaperDropdownOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm text-left first:rounded-t-2xl last:rounded-b-2xl cursor-pointer ${wallpaperProvider === provider ? "bg-white/5 font-medium" : ""
                              }`}
                          >
                            <span>{provider}</span>
                            {wallpaperProvider === provider && (
                              <span className="font-semibold text-blue-400 text-xs uppercase tracking-wider"><FaCheck /></span>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white/5 hover:bg-white/10 shadow-lg backdrop-blur-sm border border-white/15 hover:scale-103 transition-all duration-300"></div>

      <button
        onClick={() => setCustomizing(true)}
        className="top-5 right-5 fixed inset-shadow-sm flex flex-col justify-center items-end bg-white/5 hover:bg-white/10 backdrop-blur-sm p-3 border border-white/15 rounded-full text-white text-xs text-right hover:scale-105 transition-all duration-300"
      >
        <FaPencil className="size-4" />
      </button>

      <a
        href={wallpaperData?.link}
        target="_blank"
        className="right-5 bottom-5 fixed inset-shadow-sm flex flex-col justify-center items-end bg-white/5 hover:bg-white/10 backdrop-blur-sm px-4 py-2 border border-white/15 rounded-full text-white text-xs text-right hover:scale-105 transition-all duration-300"
      >
        <span className="text-gray-100">{wallpaperData?.title}</span>
        <span className="text-[10px] text-gray-200">
          {wallpaperData?.copyright}
        </span>
      </a>
    </div>
  );
}
