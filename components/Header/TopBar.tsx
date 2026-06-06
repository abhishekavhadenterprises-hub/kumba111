"use client";

import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2, Clock, Languages, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useDashboard } from "@/lib/context/dashboard-context";
import { useLanguage } from "@/lib/context/language-context";
import { Language } from "@/lib/i18n/translations";
import { LANDMARKS } from "@/lib/data/trimbakeshwar-base";
import { AKHADAS } from "@/lib/data/schedule";

export default function TopBar() {
  const { setSearchLocation } = useDashboard();
  const { language, setLanguage, t } = useLanguage();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const dropdownRef = useRef<HTMLFormElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const skipSearchRef = useRef(false);
  const [geoIndex, setGeoIndex] = useState<any[]>([]);

  // Load pre-generated geojson index once
  useEffect(() => {
    fetch('/data/search-index.json')
      .then(res => res.json())
      .then(data => setGeoIndex(data))
      .catch(err => console.error("Failed to load search index", err));
  }, []);

  // Live clock
  useEffect(() => {
    setMounted(true);
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setShowLangDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Live Debounced Autocomplete — focused on Trimbakeshwar area
  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    if (skipSearchRef.current) {
      skipSearchRef.current = false;
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setShowDropdown(true);
      try {
        const q = query.toLowerCase();
        
        // 1. Local Search (Landmarks + Akhadas)
        const localLandmarks = Object.values(LANDMARKS)
          .filter(lm => lm.name.toLowerCase().includes(q))
          .map(lm => ({
            display_name: lm.name,
            name: lm.name,
            lat: lm.lat,
            lon: lm.lng,
            isLocal: true
          }));

        const localAkhadas = AKHADAS
          .filter(a => a.name.toLowerCase().includes(q) || (a.nameHindi && a.nameHindi.includes(q)))
          .map(a => ({
            display_name: a.name,
            name: a.name,
            lat: a.startPoint === "Main Akhada Assembly Ground" ? 19.9360 : 19.9340,
            lon: a.startPoint === "Main Akhada Assembly Ground" ? 73.5260 : 73.5230,
            isLocal: true
          }));
          
        const localGeo = geoIndex
          .filter(g => g.name.toLowerCase().includes(q))
          .map(g => ({
            display_name: g.display_name,
            name: g.name,
            lat: g.lat,
            lon: g.lon,
            isLocal: true
          }));
          
        const localResults = [...localLandmarks, ...localAkhadas, ...localGeo]
          .filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i)
          .slice(0, 4);

        // Only show local Trimbakeshwar data (Landmarks, Akhadas, GeoIndex)
        setResults(localResults.slice(0, 8));
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (results.length > 0) handleSelectResult(results[0]);
  };

  const handleSelectResult = (result: any) => {
    skipSearchRef.current = true;
    setQuery(result.display_name);
    setShowDropdown(false);
    setSearchLocation({
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
      name: result.name || result.display_name.split(",")[0],
    });
  };

  return (
    <div className="relative w-full h-14 bg-transparent border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.1)] flex items-center justify-between px-3 md:px-5 z-[2000] gap-2 md:gap-0">
      {/* Left: Branding */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
          <Image
            src="/images/kumbh-logo.png"
            alt="Sinhastha Kumbh Mela Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />
        </div>
        <div className="flex flex-col justify-center">
          <h1 className="text-white/95 font-extrabold text-[12px] md:text-[13px] leading-tight tracking-wide drop-shadow-md">
            {t("app.title") || "Simhastha Kumbh 2027"}
          </h1>
          <span className="text-[#D4AF37]/90 text-[8px] md:text-[10px] font-semibold tracking-widest uppercase">
            {t("app.subtitle") || "Trimbakeshwar Command Center"}
          </span>
        </div>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xl mx-2 md:mx-6 flex items-center gap-3 min-w-0">
        <form onSubmit={handleSearch} className="relative flex-1 group" ref={dropdownRef}>
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-3.5 w-3.5 text-gray-400 font-medium group-focus-within:text-white transition-colors" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
            className="block w-full pl-10 pr-4 py-2 border border-white/10 rounded-full leading-5 bg-white/5 backdrop-blur-md shadow-inner text-white font-medium placeholder-gray-400 focus:outline-none focus:bg-white/10 focus:border-white/20 focus:ring-1 focus:ring-white/10 text-[12px] transition-all"
            placeholder={t("search.placeholder")}
          />

          {/* Dropdown */}
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#111111]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[500]">
              {isSearching ? (
                <div className="p-4 flex items-center justify-center text-white/70">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-[12px] font-medium">Searching...</span>
                </div>
              ) : results.length > 0 ? (
                <ul className="max-h-60 overflow-y-auto">
                  {results.map((r, i) => (
                    <li
                      key={i}
                      onClick={() => handleSelectResult(r)}
                      className="px-4 py-2.5 hover:bg-white/10 cursor-pointer flex items-start gap-3 border-b border-white/5 last:border-0 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-[12px] text-white/90 font-bold font-medium line-clamp-1">
                          {r.isLocal && <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1 py-0.5 rounded mr-1.5 uppercase font-bold tracking-wider">Local</span>}
                          {r.name || r.display_name.split(",")[0]}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium line-clamp-1 mt-0.5">{r.display_name}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : query && (
                <div className="p-3 text-center text-[11px] text-gray-400 font-medium">
                  No locations found.
                </div>
              )}
            </div>
          )}
        </form>
      </div>

      {/* Right: Clock + Status + Language */}
      <div className="hidden md:flex items-center gap-4 flex-shrink-0">
        {/* Language Switcher */}
        <div className="relative" ref={langDropdownRef}>
          <button 
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="flex items-center gap-2 bg-white/5 backdrop-blur-md shadow-inner border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <Languages className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[11px] font-extrabold text-white/90 uppercase">{language}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>
          
          {showLangDropdown && (
            <div className="absolute top-full right-0 mt-2 w-36 bg-[#111111]/95 backdrop-blur-2xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden z-[500] py-1">
              {[
                { code: "en", label: "English" },
                { code: "hi", label: "हिन्दी" },
                { code: "mr", label: "मराठी" },
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code as Language); setShowLangDropdown(false); }}
                  className={`w-full text-left px-4 py-2 text-[12px] font-bold ${language === lang.code ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white/90'}`}
                >
                  {lang.label} ({lang.code.toUpperCase()})
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md shadow-inner border border-white/10 px-3 py-1.5 rounded-lg">
          <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
          <div className="text-right w-20">
            <div className="text-[12px] text-white/90 font-bold tracking-wide font-mono">
              {mounted ? currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }) : "--:--:--"}
            </div>
            <div className="text-[8px] text-gray-400 font-semibold uppercase tracking-widest">IST</div>
          </div>
        </div>

        {/* Nashik Police badge */}
        <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md shadow-inner border border-white/10 px-3 py-1.5 rounded-lg">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-500/80 to-blue-700/80 flex items-center justify-center text-[8px] font-black text-white font-extrabold border border-blue-400/30">
            NP
          </div>
          <span className="text-[10px] text-white/90 font-semibold">Nashik Gramin</span>
        </div>
      </div>
    </div>
  );
}
