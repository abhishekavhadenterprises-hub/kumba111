"use client";

import { useDashboard } from "@/lib/context/dashboard-context";
import { Play } from "lucide-react";

export default function VideoPanel() {
  const { setIsVideoFullscreen } = useDashboard();

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <h2 className="text-[#9C7949] font-bold uppercase tracking-wider text-sm mb-1">
          Introduction Video
        </h2>
        <p className="text-gray-600 text-xs leading-relaxed">
          Watch the full presentation video detailing the operational schemes and master plan.
        </p>
      </div>

      <div 
        className="relative w-full aspect-video rounded-xl overflow-hidden cursor-pointer group shadow-md border border-gray-200"
        onClick={() => setIsVideoFullscreen(true)}
      >
        <img 
          src="/images/village_placeholder.png" 
          alt="Video Thumbnail" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6 text-white fill-white ml-1" />
          </div>
        </div>
      </div>
      
      <button 
        onClick={() => setIsVideoFullscreen(true)}
        className="mt-4 w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Play className="w-4 h-4 fill-white" />
        PLAY FULLSCREEN
      </button>
    </div>
  );
}
