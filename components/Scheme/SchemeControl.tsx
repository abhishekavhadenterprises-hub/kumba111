"use client";

import { useState, useEffect } from "react";
import { Route, ChevronUp, ChevronDown, Eye, EyeOff, X, Maximize2 } from "lucide-react";
import { useDashboard } from "@/lib/context/dashboard-context";
import { useLanguage } from "@/lib/context/language-context";
import { PROCESSION_GROUPS } from "@/lib/data/schedule";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function SchemeControl() {
  const { showLabels, toggleLabels, selectedProcessionRoute, setSelectedProcessionRoute, setLayerVisible, selectFeature, activeOverlay, setActiveOverlay } = useDashboard();
  const { t } = useLanguage();
  const isOpen = activeOverlay === "scheme";
  const setIsOpen = (open: boolean) => setActiveOverlay(open ? "scheme" : null);

  const [imgSrc, setImgSrc] = useState("/svg/R3%20Core-1%20Plan%20(08-05-2026).svg");

  useEffect(() => {
    if (selectedProcessionRoute) {
      setImgSrc(`/svg/procession-${selectedProcessionRoute}.svg`);
    } else {
      setImgSrc("/svg/R3%20Core-1%20Plan%20(08-05-2026).svg");
    }
  }, [selectedProcessionRoute]);

  const handleImgError = () => {
    if (imgSrc !== "/svg/R3%20Core-1%20Plan%20(08-05-2026).svg") {
      setImgSrc("/svg/R3%20Core-1%20Plan%20(08-05-2026).svg");
    }
  };

  return (
    <>
      <div className="absolute bottom-4 z-[450] pointer-events-none transition-all duration-300" style={{ left: "calc(var(--left-sidebar-width, 0px) + 12px)" }}>
        <div className="relative pointer-events-auto flex items-end gap-3">
          {/* Main Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`bg-white backdrop-blur-xl border border-[#D6D0C4] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] px-6 py-3 flex items-center gap-3 transition-all duration-300 hover:border-gray-400 hover:shadow-md hover:bg-gray-100 shrink-0 ${isOpen ? "border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]" : ""}`}
          >
            <Route className={`w-5 h-5 ${isOpen ? "text-orange-500" : "text-gray-900 font-bold"}`} />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-black tracking-wider text-black font-extrabold uppercase">{t("procession.route")}</div>
              <div className="text-[10px] text-gray-900 font-bold">{PROCESSION_GROUPS.find(r => r.id === selectedProcessionRoute)?.label || t("procession.route.select")}</div>
            </div>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-700 font-medium ml-2" />
            ) : (
              <ChevronUp className="w-4 h-4 text-gray-700 font-medium ml-2 rotate-180" />
            )}
          </button>

          {/* Labels Toggle Button */}
          <button
            onClick={toggleLabels}
            className={`bg-white backdrop-blur-xl border border-[#D6D0C4] rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-12 h-12 flex items-center justify-center transition-all duration-300 hover:border-gray-400 hover:shadow-md hover:bg-gray-100 shrink-0 ${!showLabels ? "border-red-500/50" : ""}`}
            title={showLabels ? "Hide Labels" : "Show Labels"}
          >
            {showLabels ? (
              <Eye className="w-5 h-5 text-gray-700 font-medium" />
            ) : (
              <EyeOff className="w-5 h-5 text-red-400" />
            )}
          </button>
        </div>
      </div>

      {/* Inline Modal Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] pointer-events-auto flex flex-col items-center justify-center animate-in fade-in duration-300"
          style={{
            paddingTop: '80px', // Clear top bar
            paddingLeft: 'calc(var(--left-sidebar-width, 0px) + 24px)', // Clear left sidebar
            paddingRight: 'calc(var(--right-sidebar-width, 0px) + 24px)', // Clear right sidebar
            paddingBottom: '90px' // Clear bottom controls completely
          }}
        >
          {/* Dark backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md -z-10 transition-opacity" onClick={() => setIsOpen(false)} />

          {/* Modal Container - Maximize space */}
          <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300">

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50/90 backdrop-blur-sm z-20 shadow-sm flex-shrink-0">
              <h3 className="font-extrabold text-gray-900 uppercase tracking-wider text-sm flex items-center gap-2">
                <div className="bg-orange-100 p-1.5 rounded-lg shadow-inner">
                  <Route className="w-4 h-4 text-orange-600" />
                </div>
                {t("procession.route")}
              </h3>
              <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors bg-white border border-gray-300 shadow-sm group">
                <X className="w-4 h-4 text-gray-600 group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Big SVG Map Area - Maximized & Zoomed */}
            <div className="flex-1 w-full bg-[#f8f9fa] relative overflow-hidden group">
              <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg text-[10px] font-black text-gray-800 border border-gray-200 z-10 uppercase tracking-wider flex items-center gap-2">
                <Maximize2 className="w-3 h-3 text-orange-500" />
                {selectedProcessionRoute ? PROCESSION_GROUPS.find(r => r.id === selectedProcessionRoute)?.label : "R3 Core-1 Plan"}
              </div>

              <div className="w-full h-full bg-[#f8f9fa] flex items-center justify-center cursor-move">
                <TransformWrapper
                  initialScale={1}
                  minScale={1}
                  maxScale={8}
                  centerOnInit={true}
                  limitToBounds={true}
                >
                  {({ zoomIn, zoomOut, resetTransform }) => (
                    <>
                      <div className="absolute top-14 left-3 flex flex-col gap-2 z-20">
                        <button onClick={() => zoomIn()} className="w-8 h-8 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50">+</button>
                        <button onClick={() => zoomOut()} className="w-8 h-8 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50">-</button>
                        <button onClick={() => resetTransform()} className="w-8 h-8 bg-white border border-gray-200 rounded-lg shadow-sm flex items-center justify-center text-gray-700 hover:bg-gray-50 text-[10px] font-bold">R</button>
                      </div>
                      <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }} contentStyle={{ width: "100%", height: "100%" }}>
                        <img
                          src={imgSrc}
                          alt="Procession Map"
                          onError={handleImgError}
                          className="w-full h-full object-contain drop-shadow-xl"
                        />
                      </TransformComponent>
                    </>
                  )}
                </TransformWrapper>
              </div>
            </div>

            {/* Bottom Buttons Row - Small & Compact */}
            <div className="w-full bg-white p-3 sm:p-4 overflow-x-auto flex-shrink-0 border-t border-gray-200 z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
              <div className="flex flex-row gap-2 min-w-max">
                {PROCESSION_GROUPS.map((route, i) => (
                  <button
                    key={i}
                    className={`px-3 py-2 text-xs font-bold rounded-xl transition-all border text-left flex items-center gap-2 ${selectedProcessionRoute === route.id
                        ? "bg-orange-50/80 text-orange-700 border-orange-500 shadow-sm ring-2 ring-orange-500/10 transform -translate-y-0.5"
                        : "text-gray-700 bg-white hover:bg-gray-50 hover:text-orange-600 border-gray-200 shadow-sm hover:border-orange-300 hover:shadow-md"
                      }`}
                    onClick={() => {
                      const newRoute = route.id === selectedProcessionRoute ? null : route.id;
                      setSelectedProcessionRoute(newRoute);
                      if (newRoute) {
                        setLayerVisible("procession-route", true);
                        setLayerVisible("custom-map", true);
                        selectFeature({ layerId: 'procession-route', properties: { name: route.label, akhadaId: route.id, sequence: route.id.split('-').length }, geometry: null });
                      } else {
                        setLayerVisible("procession-route", false);
                        setLayerVisible("custom-map", false);
                        selectFeature(null);
                      }
                    }}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shadow-inner flex-shrink-0 ${selectedProcessionRoute === route.id ? "bg-gradient-to-br from-orange-500 to-amber-600 text-white" : "bg-gray-100 border border-gray-200 text-gray-500"}`}>
                      {i + 1}
                    </div>
                    <span className="leading-tight truncate max-w-[150px]">{route.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
