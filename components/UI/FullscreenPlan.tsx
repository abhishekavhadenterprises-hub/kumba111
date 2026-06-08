"use client";

import { useDashboard } from "@/lib/context/dashboard-context";
import { X, ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { useEffect } from "react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";

const Controls = () => {
  const { zoomIn, zoomOut, resetTransform } = useControls();
  return (
    <div className="absolute bottom-6 right-6 z-50 flex gap-2">
      <button 
        onClick={() => zoomIn()}
        className="bg-black/60 hover:bg-black/90 text-white rounded-full p-3 transition-colors duration-300 backdrop-blur-md border border-white/20 shadow-lg"
        title="Zoom In"
      >
        <ZoomIn className="w-6 h-6" />
      </button>
      <button 
        onClick={() => zoomOut()}
        className="bg-black/60 hover:bg-black/90 text-white rounded-full p-3 transition-colors duration-300 backdrop-blur-md border border-white/20 shadow-lg"
        title="Zoom Out"
      >
        <ZoomOut className="w-6 h-6" />
      </button>
      <button 
        onClick={() => resetTransform()}
        className="bg-black/60 hover:bg-black/90 text-white rounded-full p-3 transition-colors duration-300 backdrop-blur-md border border-white/20 shadow-lg"
        title="Reset Zoom"
      >
        <Maximize className="w-6 h-6" />
      </button>
    </div>
  );
};

export default function FullscreenPlan() {
  const { isPlanFullscreen, setIsPlanFullscreen } = useDashboard();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPlanFullscreen(false);
      }
    };
    if (isPlanFullscreen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlanFullscreen, setIsPlanFullscreen]);

  if (!isPlanFullscreen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex flex-col overflow-hidden">
      {/* Floating Close Button */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setIsPlanFullscreen(false)}
          className="pointer-events-auto bg-black/60 hover:bg-red-600/90 text-white rounded-full p-3 transition-colors duration-300 backdrop-blur-md border border-white/20 group shadow-lg"
          title="Close Plan (Esc)"
        >
          <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      <div className="absolute top-6 left-6 z-50">
         <div className="bg-black/60 text-white px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 shadow-lg font-bold">
           Core-1 DWG Plan (SVG Render)
         </div>
      </div>

      {/* Plan Viewer */}
      <div className="flex-1 w-full h-full bg-[#0a0a0a] relative cursor-grab active:cursor-grabbing">
        <TransformWrapper
          initialScale={1}
          minScale={0.1}
          maxScale={10}
          centerOnInit
          wheel={{ step: 0.1 }}
          panning={{ velocityMultiplier: 0.8 }}
          doubleClick={{ disabled: true }}
        >
          <Controls />
          <TransformComponent wrapperStyle={{ width: "100%", height: "100%", willChange: "transform" }} contentStyle={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", willChange: "transform" }}>
            {/* Render the SVG image directly from public folder */}
            {/* Added GPU acceleration styles to reduce lag */}
            <img 
              src="/svg/R3 Core-1 Plan (08-05-2026).svg" 
              alt="Core-1 Plan"
              className="max-w-none w-auto h-auto min-w-[1000px] pointer-events-none" 
              style={{ 
                willChange: "transform", 
                transform: "translateZ(0)", 
                backfaceVisibility: "hidden",
                WebkitFontSmoothing: "antialiased"
              }}
              draggable={false}
            />
          </TransformComponent>
        </TransformWrapper>
      </div>
    </div>
  );
}
