"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { SchemeLevel, MapLayerId, SelectedFeature, DashboardState } from "../types";

// ── Default visible layers ──────────────────────────────────
const DEFAULT_VISIBLE_LAYERS: MapLayerId[] = [];

// ── Context shape ───────────────────────────────────────────
interface DashboardContextValue {
  // Scheme
  activeScheme: SchemeLevel;
  setActiveScheme: (s: SchemeLevel) => void;

  // Layers
  visibleLayers: Set<MapLayerId>;
  toggleLayer: (id: MapLayerId) => void;
  setLayerVisible: (id: MapLayerId, visible: boolean) => void;
  showAllLayers: () => void;
  hideAllLayers: () => void;

  // Selection
  selectedFeature: SelectedFeature | null;
  selectFeature: (f: SelectedFeature | null) => void;

  // Akhada highlight
  highlightedAkhada: string | null;
  highlightAkhada: (id: string | null) => void;

  // Scenarios
  activeScenarios: string[];
  toggleScenario: (id: string) => void;
  clearScenarios: () => void;

  // Hierarchical KML Folders
  activeKmlFolders: string[];
  setActiveKmlFolders: (folders: string[]) => void;
  toggleKmlFolder: (pathId: string, isFolder?: boolean, childrenIds?: string[]) => void;
  expandedKmlNodes: string[];
  setExpandedKmlNodes: (nodes: string[]) => void;

  // Schedule
  selectedEvent: string | null;
  selectEvent: (id: string | null) => void;

  // Search
  searchLocation: { lat: number; lon: number; name: string } | null;
  setSearchLocation: (loc: { lat: number; lon: number; name: string } | null) => void;

  // Map Tile Style
  tileStyle: "roadmap" | "satellite" | "hybrid" | "terrain";
  setTileStyle: (style: "roadmap" | "satellite" | "hybrid" | "terrain") => void;

  // Labels & Procession Route
  showLabels: boolean;
  toggleLabels: () => void;
  selectedProcessionRoute: string | null;
  setSelectedProcessionRoute: (name: string | null) => void;

  // Sidebar
  leftTab: "scenarios" | "layers" | "akhadas" | "schedule" | "video";
  setLeftTab: (tab: "scenarios" | "layers" | "akhadas" | "schedule" | "video") => void;
  // Overlays
  activeOverlay: string | null;
  setActiveOverlay: (overlay: string | null) => void;

  // Video State
  isVideoFullscreen: boolean;
  setIsVideoFullscreen: (val: boolean) => void;

  // Plan State
  isPlanFullscreen: boolean;
  setIsPlanFullscreen: (val: boolean) => void;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined);

// ── Provider ────────────────────────────────────────────────
export function DashboardProvider({ children }: { children: ReactNode }) {
  const [activeScheme, setActiveScheme] = useState<SchemeLevel>("green");
  const [visibleLayers, setVisibleLayers] = useState<Set<MapLayerId>>(new Set(DEFAULT_VISIBLE_LAYERS));
  const [selectedFeature, setSelectedFeature] = useState<SelectedFeature | null>(null);
  const [highlightedAkhada, setHighlightedAkhada] = useState<string | null>(null);
  const [activeScenarios, setActiveScenarios] = useState<string[]>([]);
  const [activeKmlFolders, setActiveKmlFolders] = useState<string[]>([]);
  const [expandedKmlNodes, setExpandedKmlNodes] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lon: number; name: string } | null>(null);
  const [tileStyle, setTileStyle] = useState<"roadmap" | "satellite" | "hybrid" | "terrain">("roadmap");
  const [leftTab, setLeftTab] = useState<"scenarios" | "layers" | "akhadas" | "schedule" | "video">("scenarios");

  const [showLabels, setShowLabels] = useState(false);
  const [selectedProcessionRoute, setSelectedProcessionRoute] = useState<string | null>(null);
  const [activeOverlay, setActiveOverlay] = useState<string | null>(null);
  const [isVideoFullscreen, setIsVideoFullscreen] = useState<boolean>(true);
  const [isPlanFullscreen, setIsPlanFullscreen] = useState<boolean>(false);

  const toggleLabels = useCallback(() => setShowLabels((prev) => !prev), []);

  const toggleLayer = useCallback((id: MapLayerId) => {
    setVisibleLayers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const setLayerVisible = useCallback((id: MapLayerId, visible: boolean) => {
    setVisibleLayers(prev => {
      const next = new Set(prev);
      if (visible) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const showAllLayers = useCallback(() => {
    setVisibleLayers(new Set(["police-deployments", "infrastructure", "new-ghat"]));
  }, []);

  const hideAllLayers = useCallback(() => {
    setVisibleLayers(new Set());
  }, []);

  const selectFeature = useCallback((f: SelectedFeature | null) => {
    setSelectedFeature(f);
  }, []);

  const highlightAkhada = useCallback((id: string | null) => {
    setHighlightedAkhada(id);
    if (id) {
      setVisibleLayers(prev => {
        const next = new Set(prev);
        next.add("custom-map");
        next.add("procession-route");
        return next;
      });
    }
  }, []);

  const toggleScenario = useCallback((id: string) => {
    setActiveScenarios(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  }, []);

  const clearScenarios = useCallback(() => {
    setActiveScenarios([]);
  }, []);

  const toggleKmlFolder = useCallback((pathId: string, isFolder: boolean = false, childrenIds: string[] = []) => {
    setActiveKmlFolders(prev => {
      const isSelected = prev.includes(pathId);
      let next = new Set(prev);

      if (isSelected) {
        next.delete(pathId);
        if (isFolder && childrenIds) {
          childrenIds.forEach(id => next.delete(id));
        }
      } else {
        next.add(pathId);
        if (isFolder && childrenIds) {
          childrenIds.forEach(id => next.add(id));
        }
      }
      return Array.from(next);
    });
  }, []);

  const selectEvent = useCallback((id: string | null) => {
    setSelectedEvent(id);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        activeScheme,
        setActiveScheme,
        visibleLayers,
        toggleLayer,
        setLayerVisible,
        showAllLayers,
        hideAllLayers,
        selectedFeature,
        selectFeature,
        highlightedAkhada,
        highlightAkhada,
        activeScenarios,
        toggleScenario,
        clearScenarios,
        activeKmlFolders,
        setActiveKmlFolders,
        toggleKmlFolder,
        expandedKmlNodes,
        setExpandedKmlNodes,
        selectedEvent,
        selectEvent,
        searchLocation,
        setSearchLocation,
        tileStyle,
        setTileStyle,
        leftTab,
        setLeftTab,
        showLabels,
        toggleLabels,
        selectedProcessionRoute,
        setSelectedProcessionRoute,
        activeOverlay,
        setActiveOverlay,
        isVideoFullscreen,
        setIsVideoFullscreen,
        isPlanFullscreen,
        setIsPlanFullscreen,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

// ── Hook ────────────────────────────────────────────────────
export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}
