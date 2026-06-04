"use client";

import React, { useEffect, useState, useMemo } from "react";
import { ChevronRight, ChevronDown, CheckSquare, Square, Folder, MapPin } from "lucide-react";
import { useDashboard } from "@/lib/context/dashboard-context";
import { useLanguage } from "@/lib/context/language-context";

interface KmlNode {
  id: string;
  name: string;
  type: "folder" | "placemark";
  description?: string;
  children?: KmlNode[];
}

export function KmlHierarchyTree() {
  const [hierarchy, setHierarchy] = useState<KmlNode[]>([]);
  const { activeKmlFolders, toggleKmlFolder, expandedKmlNodes, setExpandedKmlNodes, selectFeature } = useDashboard();
  const { t } = useLanguage();

  useEffect(() => {
    Promise.all([
      fetch(`/data/trimbak-hierarchy.json?t=${Date.now()}`).then(res => res.ok ? res.json() : []),
      fetch(`/data/tunnel-hierarchy.json?t=${Date.now()}`).then(res => res.ok ? res.json() : []),
      fetch(`/data/newghat-hierarchy.json?t=${Date.now()}`).then(res => res.ok ? res.json() : []),
      fetch(`/data/dproads-hierarchy.json?t=${Date.now()}`).then(res => res.ok ? res.json() : [])
    ])
      .then(([trimbakData, tunnelData, newghatData, dproadsData]) => {
        setHierarchy([...trimbakData, ...tunnelData, ...newghatData, ...dproadsData]);
      })
      .catch((err) => console.error("Failed to load KML hierarchy", err));
  }, []);

  const toggleExpand = (id: string) => {
    if (expandedKmlNodes.includes(id)) {
      setExpandedKmlNodes(expandedKmlNodes.filter((p) => p !== id));
    } else {
      setExpandedKmlNodes([...expandedKmlNodes, id]);
    }
  };

  const getAllDescendantIds = (node: KmlNode): string[] => {
    let ids: string[] = [];
    if (node.children) {
      for (const child of node.children) {
        ids.push(child.id);
        ids = ids.concat(getAllDescendantIds(child));
      }
    }
    return ids;
  };

  const renderNode = (node: KmlNode, depth: number = 0) => {
    if (!node) return null;
    const isExpanded = expandedKmlNodes.includes(node.id);
    const isChecked = activeKmlFolders.includes(node.id);
    const hasChildren = node.children && node.children.length > 0;
    const isRoot = depth === 0;

    return (
      <div key={node.id} className="flex flex-col">
        <div
          className={`flex items-start py-2 px-3 hover:bg-gray-100 cursor-pointer transition-colors ${
            isRoot ? "border-b border-gray-200 bg-gray-50/50" : ""
          }`}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
        >
          {/* Expand/Collapse Icon */}
          <div
            className="w-5 h-5 flex items-center justify-center shrink-0 mr-1 cursor-pointer hover:bg-gray-200 rounded text-gray-500"
            onClick={(e) => {
              e.stopPropagation();
              if (hasChildren) toggleExpand(node.id);
            }}
          >
            {hasChildren ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <span className="w-4 h-4" /> // Spacing for leaf nodes
            )}
          </div>

          {/* Checkbox */}
          <div
            className={`w-5 h-5 flex items-center justify-center shrink-0 mr-2 cursor-pointer ${isChecked ? "text-[#9C7949]" : "text-gray-300"}`}
            onClick={(e) => {
              e.stopPropagation();
              const descendants = hasChildren ? getAllDescendantIds(node) : [];
              toggleKmlFolder(node.id, hasChildren, descendants);
            }}
          >
            {isChecked ? (
              <CheckSquare className="w-4 h-4" />
            ) : (
              <Square className="w-4 h-4" />
            )}
          </div>

          <div 
            className="flex flex-col flex-1 min-w-0"
            onClick={() => {
              if (hasChildren) {
                toggleExpand(node.id);
              } else {
                selectFeature({ layerId: 'trimbak-parsed', properties: { ...node, name: node.name }, geometry: null });
              }
            }}
          >
            <div className="flex items-center gap-2">
              {node.type === "folder" ? (
                <Folder className={`w-4 h-4 shrink-0 ${isChecked ? "text-[#9C7949]" : "text-gray-500"}`} />
              ) : (
                <MapPin className={`w-4 h-4 shrink-0 ${isChecked ? "text-emerald-500" : "text-gray-400"}`} />
              )}
              <span className={`text-[12px] font-medium truncate ${isChecked ? "text-gray-900 font-bold" : "text-gray-700 font-bold"}`}>
                {node.name === "Trimbak Parking & Routes as Per PC Sir" ? t("trimbak.parking") :
                 node.name === "tunnel location" ? t("tunnel.location") :
                 node.name === "New Ghat Trimbak" ? t("new.ghat") :
                 node.name === "DP Roads" ? t("dp.roads") : 
                 node.name || "Unnamed"}
              </span>
            </div>
            {node.description && (
              <span className="text-[10px] text-gray-500 mt-0.5 line-clamp-2 pl-6">
                {node.description.replace(/<[^>]+>/g, '')}
              </span>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {node.children!.map((child) => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!hierarchy.length) {
    return <div className="p-4 text-sm text-gray-500 text-center">Loading routes...</div>;
  }

  return (
    <div className="flex flex-col w-full border border-gray-300 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm mt-4">
      <div className="px-3 py-2.5 border-b border-gray-200 bg-[#f8f6f0]">
        <h3 className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em]">
          {t("routes.hierarchy")}
        </h3>
      </div>
      <div className="flex flex-col overflow-y-auto max-h-[400px] custom-scrollbar">
        {hierarchy.map((node) => renderNode(node))}
      </div>
    </div>
  );
}
