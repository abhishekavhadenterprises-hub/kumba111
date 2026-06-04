"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardProvider, useDashboard } from "@/lib/context/dashboard-context";
import TopBar from "@/components/Header/TopBar";
import StatusBanner from "@/components/Header/StatusBanner";
import SidebarLeft from "@/components/SidebarLeft/SidebarLeft";
import ScenariosPanel from "@/components/Scenarios/ScenariosPanel";
import OperationalDetail from "@/components/SidebarRight/OperationalDetail";
import SchemeControl from "@/components/Scheme/SchemeControl";
import GreenSchemeNavigation from "@/components/Map/GreenSchemeNavigation";
import OrangeSchemeNavigation from "@/components/Map/OrangeSchemeNavigation";
import RedSchemeNavigation from "@/components/Map/RedSchemeNavigation";
import GlobalScenarioNavigation from "@/components/Map/GlobalScenarioNavigation";
import FullscreenVideo from "@/components/Video/FullscreenVideo";

// Dynamically import map to avoid SSR issues
const MapComponent = dynamic(() => import("@/components/Map/MapComponent"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#FDFBF7] animate-pulse" />,
});

function DashboardContent() {
  const { selectedFeature, activeOverlay, setActiveOverlay } = useDashboard();

  // Sidebar states
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(false);

  useEffect(() => {
    if (selectedFeature) {
      setIsRightOpen(true);
      if (typeof window !== "undefined" && window.innerWidth < 768) {
        setIsLeftOpen(false);
        setActiveOverlay(null);
      }
    } else {
      setIsRightOpen(false);
    }
  }, [selectedFeature, setActiveOverlay]);

  useEffect(() => {
    if (activeOverlay && typeof window !== "undefined" && window.innerWidth < 768) {
      setIsLeftOpen(false);
      setIsRightOpen(false);
    }
  }, [activeOverlay]);

  // Resize states
  const [leftWidth, setLeftWidth] = useState(320);
  const [rightWidth, setRightWidth] = useState(320);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingLeft) {
        setLeftWidth(Math.max(260, Math.min(e.clientX, 500)));
      } else if (isDraggingRight) {
        setRightWidth(Math.max(260, Math.min(window.innerWidth - e.clientX, 500)));
      }
    };

    const handleMouseUp = () => {
      setIsDraggingLeft(false);
      setIsDraggingRight(false);
      document.body.style.cursor = "default";
    };

    if (isDraggingLeft || isDraggingRight) {
      document.body.style.cursor = "col-resize";
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingLeft, isDraggingRight]);

  return (
    <main 
      className="w-full h-screen flex flex-col overflow-hidden bg-[#0a0a0a] selection:bg-[#D4AF37]/30 font-sans relative"
      style={{
        "--left-sidebar-width": isLeftOpen ? `${leftWidth}px` : "0px",
        "--right-sidebar-width": isRightOpen ? `${rightWidth}px` : "0px"
      } as React.CSSProperties}
    >
      {/* Center Canvas (Map) - Positioned absolutely to fill the ENTIRE screen behind everything */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0a]">
        <MapComponent />
        <SchemeControl />
        <GreenSchemeNavigation />
        <OrangeSchemeNavigation />
        <RedSchemeNavigation />
        <GlobalScenarioNavigation />
      </div>

      <div className="relative z-40 w-full pointer-events-none px-4 pt-4 flex flex-col gap-0 items-center justify-center">
        <div className="pointer-events-auto w-full rounded-t-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.8)] border border-white/20 bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-[40px] bg-[#050505]/80 relative before:absolute before:inset-0 before:rounded-t-3xl before:border before:border-white/5 before:pointer-events-none">
          <TopBar />
        </div>
        <div className="pointer-events-auto w-full rounded-b-3xl overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.8)] border border-white/20 border-t-0 backdrop-blur-[40px] bg-[#050505]/80 relative before:absolute before:inset-0 before:rounded-b-3xl before:border before:border-white/5 before:pointer-events-none">
          <StatusBanner />
        </div>
      </div>

      <div 
        className="flex-1 flex min-h-0 relative overflow-hidden pointer-events-none"
      >

        {/* Left Sidebar */}
        <div
          style={{ width: isLeftOpen ? leftWidth : 0, maxWidth: "calc(100vw - 32px)" }}
          className={`transition-[width] duration-300 ease-in-out h-full z-30 flex-shrink-0 relative pointer-events-auto ${isLeftOpen ? "py-4 pl-4 pr-1" : "overflow-hidden"} ${isDraggingLeft ? "transition-none" : ""}`}
        >
          <div className="w-full h-full overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-br from-white/[0.08] to-transparent backdrop-blur-[40px] bg-[#050505]/80 shadow-[0_8px_32px_rgba(0,0,0,0.8)] relative before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/5 before:pointer-events-none">
            <SidebarLeft />
          </div>
        </div>

        {/* Left Toggle */}
        <div
          style={{ left: isLeftOpen ? leftWidth : 0 }}
          className={`absolute top-0 bottom-0 w-4 z-40 md:z-20 cursor-col-resize group transition-[left] duration-300 ease-in-out pointer-events-auto ${isDraggingLeft ? "transition-none" : ""}`}
          onMouseDown={() => { if (isLeftOpen) setIsDraggingLeft(true); }}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-cyan-500/50 transition-colors" />
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              const nextState = !isLeftOpen;
              setIsLeftOpen(nextState);
              if (nextState && typeof window !== "undefined" && window.innerWidth < 768) {
                setIsRightOpen(false);
                setActiveOverlay(null);
              }
            }}
            className="absolute -left-[1px] top-8 bg-[#050505]/90 backdrop-blur-2xl border border-white/20 border-l-0 py-4 px-1.5 rounded-r-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 shadow-[4px_4px_20px_rgba(0,0,0,0.8)] cursor-pointer hover:shadow-[4px_4px_25px_rgba(212,175,55,0.4)] flex items-center justify-center z-50 group-hover:border-[#D4AF37]/80"
          >
            {isLeftOpen ? <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" /> : <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />}
          </button>
        </div>

        {/* Spacer to push Right Sidebar if needed, or just let Right Sidebar be absolute if we want, but since it's flex, let's use flex spacer */}
        <div className="flex-1 pointer-events-none z-10" />

        {/* Right Toggle */}
        <div
          style={{ right: isRightOpen ? rightWidth : 0 }}
          className={`absolute top-0 bottom-0 w-4 z-40 md:z-20 cursor-col-resize group transition-[right] duration-300 ease-in-out pointer-events-auto ${isDraggingRight ? "transition-none" : ""}`}
          onMouseDown={() => { if (isRightOpen) setIsDraggingRight(true); }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-[2px] bg-transparent group-hover:bg-cyan-500/50 transition-colors" />
          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              const nextState = !isRightOpen;
              setIsRightOpen(nextState);
              if (nextState && typeof window !== "undefined" && window.innerWidth < 768) {
                setIsLeftOpen(false);
                setActiveOverlay(null);
              }
            }}
            className="absolute -right-[1px] top-8 bg-[#050505]/90 backdrop-blur-2xl border border-white/20 border-r-0 py-4 px-1.5 rounded-l-2xl text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-300 shadow-[-4px_4px_20px_rgba(0,0,0,0.8)] cursor-pointer hover:shadow-[-4px_4px_25px_rgba(212,175,55,0.4)] flex items-center justify-center z-50 group-hover:border-[#D4AF37]/80"
          >
            {isRightOpen ? <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" /> : <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />}
          </button>
        </div>

        {/* Right Sidebar */}
        <div
          style={{ width: isRightOpen ? rightWidth : 0, maxWidth: "calc(100vw - 32px)" }}
          className={`transition-[width] duration-300 ease-in-out h-full z-30 flex-shrink-0 relative pointer-events-auto ${isRightOpen ? "py-4 pr-4 pl-1" : "overflow-hidden"} ${isDraggingRight ? "transition-none" : ""}`}
        >
          <div className="w-full h-full overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-bl from-white/[0.08] to-transparent backdrop-blur-[40px] bg-[#050505]/80 shadow-[0_8px_32px_rgba(0,0,0,0.8)] relative before:absolute before:inset-0 before:rounded-3xl before:border before:border-white/5 before:pointer-events-none">
            <OperationalDetail />
          </div>
        </div>
      </div>
      
      {/* Fullscreen Overlays */}
      <FullscreenVideo />
    </main>
  );
}

export default function Home() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
