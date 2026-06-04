"use client";

import { useDashboard } from "@/lib/context/dashboard-context";
import { X } from "lucide-react";
import { useEffect } from "react";

export default function FullscreenVideo() {
  const { isVideoFullscreen, setIsVideoFullscreen } = useDashboard();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsVideoFullscreen(false);
      }
    };
    if (isVideoFullscreen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isVideoFullscreen, setIsVideoFullscreen]);

  if (!isVideoFullscreen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Floating Close Button */}
      <div className="absolute top-6 right-6 z-50">
        <button 
          onClick={() => setIsVideoFullscreen(false)}
          className="pointer-events-auto bg-black/60 hover:bg-red-600/90 text-white rounded-full p-3 transition-colors duration-300 backdrop-blur-md border border-white/20 group shadow-lg"
          title="Close Video (Esc)"
        >
          <X className="w-8 h-8 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Video Player */}
      <div className="flex-1 w-full h-full flex items-center justify-center bg-black relative">
        <div className="relative w-full aspect-video max-h-screen">
          {/* 
            This top gradient mask sits perfectly over the video (because of the aspect-video container)
            and completely hides the YouTube title/channel name without bleeding into the letterboxing.
          */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-black via-black/80 to-transparent z-20 pointer-events-auto"></div>
          
          <iframe 
            className="w-full h-full"
            src="https://www.youtube.com/embed/TxjKN6oF0c8?autoplay=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3&fs=0" 
            title="Introduction Video"
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}
