"use client";

import { useState, useEffect } from "react";
import { useDashboard } from "@/lib/context/dashboard-context";
import { CheckCircle2, Circle, Eye, CircleParking, Shield, ShieldAlert, Activity, Plane, Flame, Building, Home, Users, Train, Square, Castle, ChevronDown, ChevronRight, Play } from "lucide-react";
import type { MapLayerId } from "@/lib/types";
import { KmlHierarchyTree } from "./KmlHierarchyTree";
import { useLanguage } from "@/lib/context/language-context";

interface KmlNode {
  id: string;
  name: string;
  type: "folder" | "placemark";
  description?: string;
  children?: KmlNode[];
}

interface LayerItem {
  id: MapLayerId | string;
  name: string;
  icon: any;
  color: string;
  glow: string;
  description: string;
  kmlFolderId?: string;
  children?: { id: string; name: string; geometry?: any }[];
}



export default function OperationalLayers() {
  const [expandedLayers, setExpandedLayers] = useState<string[]>([]);
  const [hierarchy, setHierarchy] = useState<KmlNode[]>([]);
  const { visibleLayers, toggleLayer, activeKmlFolders, toggleKmlFolder, showAllLayers, hideAllLayers, selectFeature } = useDashboard();
  const { t } = useLanguage();

  useEffect(() => {
    fetch(`/data/trimbak-hierarchy.json?t=${Date.now()}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => setHierarchy(data))
      .catch(err => console.error("Failed to load KML hierarchy", err));
  }, []);

  const getAllDescendantIds = (nodes: KmlNode[], targetId: string): string[] | null => {
    for (const node of nodes) {
      if (node.id === targetId) {
        let ids: string[] = [];
        const collectIds = (n: KmlNode) => {
          if (n.children) {
            for (const child of n.children) {
              ids.push(child.id);
              collectIds(child);
            }
          }
        };
        collectIds(node);
        return ids;
      }
      if (node.children) {
        const found = getAllDescendantIds(node.children, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  const LAYER_GROUPS: { title: string; layers: LayerItem[] }[] = [
    {
      title: t("operational.layers"),
      layers: [
        { id: "helipads", name: "Helipad", icon: Plane, color: "text-emerald-400", glow: "shadow-[0_0_10px_rgba(52,211,153,0.5)]", description: "Helipads for emergency & VIPs" },
        { id: "temp-police-sheds", name: "Temporary police chauki", icon: Shield, color: "text-sky-400", glow: "shadow-[0_0_10px_rgba(56,189,248,0.5)]", description: "Temporary shelters for police" },
        { id: "permanent-police-chauki", name: "Permanent police chauki", icon: ShieldAlert, color: "text-indigo-500", glow: "shadow-[0_0_10px_rgba(99,102,241,0.5)]", description: "Permanent police chaukis" },
        { id: "police-stations", name: "Police stations", icon: ShieldAlert, color: "text-blue-500", glow: "shadow-[0_0_10px_rgba(59,130,246,0.5)]", description: "Main police stations" },
        { id: "police-quarters", name: "Police accommodation", icon: Home, color: "text-blue-400", glow: "shadow-[0_0_10px_rgba(96,165,250,0.5)]", description: "Accommodation for police personnel" },
        { id: "permanent-watch-tower", name: "Permanent watch tower", icon: Eye, color: "text-fuchsia-500", glow: "shadow-[0_0_10px_rgba(217,70,239,0.5)]", description: "Permanent watch towers" },
        { id: "temporary-watch-tower", name: "Temporary watch tower", icon: Eye, color: "text-violet-500", glow: "shadow-[0_0_10px_rgba(139,92,246,0.5)]", description: "Temporary watch towers" },
        { id: "inner-parking", kmlFolderId: "Inner Parking_5", name: "Inner parking", icon: CircleParking, color: "text-orange-400", glow: "shadow-[0_0_10px_rgba(251,146,60,0.5)]", description: "Inner ring parking zones" },
        { id: "outer-parking", kmlFolderId: "Outer Parking_3", name: "Outer parking", icon: CircleParking, color: "text-yellow-500", glow: "shadow-[0_0_10px_rgba(234,179,8,0.5)]", description: "Outer ring parking zones" },
        { id: "holding-area", kmlFolderId: "Holding Area_13", name: "Holding Area", icon: Users, color: "text-pink-400", glow: "shadow-[0_0_10px_rgba(244,114,182,0.5)]", description: "Crowd holding areas" },
        { id: "main-temple", name: "Main trimbakeshwar temple", icon: Flame, color: "text-orange-600", glow: "shadow-[0_0_10px_rgba(234,88,12,0.5)]", description: "The Jyotirlinga temple" },
        { id: "all-akhada", name: "All Akhada", icon: Castle, color: "text-red-500", glow: "shadow-[0_0_10px_rgba(239,68,68,0.5)]", description: "Locations of all Akhadas" },
        { id: "other-temples", name: "All other temples", icon: Flame, color: "text-orange-400", glow: "shadow-[0_0_10px_rgba(251,146,60,0.5)]", description: "Other important temples & ashrams" },
        { id: "railway-stations", name: "Railway stations nearby", icon: Train, color: "text-gray-500", glow: "shadow-[0_0_10px_rgba(107,114,128,0.5)]", description: "Nearest railway stations" },
        { id: "airport", name: "Airport", icon: Plane, color: "text-sky-600", glow: "shadow-[0_0_10px_rgba(2,132,199,0.5)]", description: "Nearest airport (Ozar)" },
      ],
    },
  ];

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-2 pb-2 border-b border-white/10">
        <h2 className="text-white/90 font-medium text-lg tracking-tight">{t("map.layers")}</h2>
      </div>

      {/* Layer groups */}
      {LAYER_GROUPS.map((group) => (
        <div key={group.title} className="mb-6">
          <div className="text-[12px] text-gray-400 font-medium tracking-tight mb-2 px-3 uppercase tracking-wider">{group.title}</div>
          <div className="flex flex-col gap-1.5 px-2">
            {group.layers.map((layer) => {
              const isVisible = layer.kmlFolderId 
                ? activeKmlFolders.includes(layer.kmlFolderId)
                : visibleLayers.has(layer.id as MapLayerId);
                
              const isExpanded = expandedLayers.includes(layer.id);
              const Icon = layer.icon;

              const handleToggle = () => {
                if (layer.kmlFolderId) {
                  const descendants = getAllDescendantIds(hierarchy, layer.kmlFolderId) || [];
                  toggleKmlFolder(layer.kmlFolderId, true, descendants);
                } else {
                  toggleLayer(layer.id as MapLayerId);
                }
              };

              return (
                <div key={layer.id} className="flex flex-col">
                  <div
                    key={layer.id}
                    onClick={handleToggle}
                    className={`group cursor-pointer relative flex items-center justify-between p-2.5 rounded-[14px] transition-all duration-300 text-left border ${isVisible
                      ? "bg-white/[0.08] backdrop-blur-2xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] border-white/30 scale-[1.01] z-10"
                      : "bg-white/[0.03] backdrop-blur-md border-white/10 hover:bg-white/[0.06] hover:border-white/20"
                      }`}
                  >
                    <div className="flex items-center gap-3.5 overflow-hidden">
                      {layer.children && (
                        <div
                          className="w-5 h-5 flex items-center justify-center shrink-0 cursor-pointer hover:bg-white/10 rounded text-gray-400 hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isExpanded) {
                              setExpandedLayers(expandedLayers.filter(id => id !== layer.id));
                            } else {
                              setExpandedLayers([...expandedLayers, layer.id]);
                            }
                          }}
                        >
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </div>
                      )}
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-[10px] bg-white/5 border transition-all duration-300 shrink-0 ${isVisible
                          ? `border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.3)] scale-105 backdrop-blur-sm ${layer.glow}`
                          : "border-white/10 shadow-inner group-hover:border-white/20"
                          }`}
                      >
                        <Icon className={`w-4 h-4 ${isVisible ? layer.color : "text-gray-400 group-hover:text-gray-200 transition-colors"}`} />
                      </div>
                      <div className="min-w-0">
                        <span className={`text-[13px] block truncate transition-colors duration-300 tracking-tight ${isVisible ? "text-white font-medium drop-shadow-sm" : "text-gray-300 font-medium group-hover:text-white"}`}>
                          {layer.name}
                        </span>
                        <span className={`text-[11px] block truncate transition-colors duration-300 ${isVisible ? "text-white/70 font-normal" : "text-gray-400 font-normal group-hover:text-gray-300"}`}>{layer.description}</span>
                      </div>
                    </div>

                    <div className="w-5 flex justify-end flex-shrink-0">
                      {isVisible ? (
                        <CheckCircle2 className="w-5 h-5 text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500 group-hover:text-gray-300 transition-colors" />
                      )}
                    </div>
                  </div>
                  {layer.children && isExpanded && (
                    <div className="flex flex-col ml-8 mt-1 space-y-1 border-l border-white/10 pl-2">
                      {layer.children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between py-1.5 px-2 hover:bg-white/5 rounded cursor-pointer group/child transition-colors"
                          onClick={() => {
                            if (selectFeature) {
                              selectFeature({
                                layerId: 'trimbak-parsed',
                                properties: { name: child.name },
                                geometry: child.geometry || null
                              });
                            }
                          }}
                        >
                          <span className="text-[11px] font-medium text-gray-400 group-hover/child:text-white transition-colors">
                            {child.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Hierarchical KML Routes */}
      <KmlHierarchyTree />
    </div>
  );
}
