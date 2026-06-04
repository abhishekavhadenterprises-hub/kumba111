"use client";

import { ShieldCheck, Crosshair, Route, CircleParking, Shield, Activity, MapPin, Phone, Users, Clock, X, CalendarClock, Fuel, Bed, Timer, Navigation, Landmark, Play } from "lucide-react";
import { useDashboard } from "@/lib/context/dashboard-context";
import { getAkhadaById, PROCESSION_TIMINGS, ProcessionTiming } from "@/lib/data/schedule";
import { useLanguage } from "@/lib/context/language-context";
import { TranslationKey } from "@/lib/i18n/translations";
import { ChevronLeft, ChevronRight } from "lucide-react";

const GREEN_SCHEME_ROUTES = [
  "Nashik - Laddha Inner Parking - Trimabkeshwar - In and Out",
  "Pune Sangmner Sinnar Nashik Trimabkeshwar - In and Out",
  "Chh Sambhaji nagar Yeola Niffad Nashik Trimbak - In and Out",
  "Dhule Malegaon Nashik Trimbak - In and Out",
  "NAndurbar Stanaa Sogras phata Nashik Trimbak - In & Out",
  "Saputara Vani Dindori Nashik Trimbak - In and Out",
  "Dharampur Peth Karanjali Kohor Waghera Amboli Trimabkeshwar - In and Out",
  "Javhar Mokhada Amboli Trimabkeswar - In and Out",
  "Mumbai Igatpuri Vaitarana Phata Saturli Ahurli Pegalwadi Trimabakehswar - In and Out",
  "Inner Parking Hubs"
];

export default function OperationalDetail() {
  const { selectedFeature, selectFeature } = useDashboard();
  const { t } = useLanguage();

  // Empty state
  if (!selectedFeature) {
    return (
      <div className="h-full flex flex-col bg-transparent">
        <div className="h-14 border-b border-white/10 flex items-center px-5 bg-transparent flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] mr-2.5" />
          <h2 className="text-white/90 font-extrabold text-[12px] tracking-wide uppercase">Intelligence Panel</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 relative bg-transparent">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.04)_0%,transparent_70%)] pointer-events-none" />
          <div className="w-16 h-16 rounded-full border border-white/10 bg-white/5 flex items-center justify-center mb-5 relative shadow-[0_0_25px_rgba(212,175,55,0.1)] backdrop-blur-md">
            <Crosshair className="w-7 h-7 text-[#D4AF37]/50" />
            <div className="absolute inset-0 rounded-full border border-white/20 animate-ping opacity-15" />
          </div>
          <p className="text-gray-400 font-medium text-center text-[11px] font-medium leading-relaxed max-w-[200px] uppercase tracking-wider">
            Select any route, zone, post, or marker on the map to load tactical intelligence.
          </p>
        </div>
      </div>
    );
  }

  const { layerId, properties: props } = selectedFeature;

  const currentRouteIndex = GREEN_SCHEME_ROUTES.indexOf(props.name);
  const isGreenSchemeRoute = currentRouteIndex !== -1;

  // ── Detail rendering by layer type ────────────────────────
  const renderContent = () => {
    switch (layerId) {
      case "akhada-routes": {
        const akhada = getAkhadaById(props.akhadaId);
        const timing = PROCESSION_TIMINGS.find(t => t.akhadaId === props.akhadaId);

        return (
          <div className="space-y-4">
            <DetailSection title={t("procession.info")}>
              <DetailRow label={t("akhada")} value={props.name} />
              <DetailRow label="Hindi" value={props.nameHindi} />
              <DetailRow label="Tradition" value={props.tradition} badge badgeColor={props.color} />
              <DetailRow label={t("procession.group")} value={`#${props.sequence} of 13`} />
            </DetailSection>

            {timing && (
              <DetailSection title={t("schedule.timings")}>
                <div className="space-y-1.5 mt-2">
                  <TimingRow label={t("departure.akhada")} time={timing.departureFromAkhada} />
                  <TimingRow label={t("khanderao.mandir")} time={timing.arrivalKhanderao} />
                  <TimingRow label={t("procession.start")} time={timing.amrutSnanStart} highlight />
                  <TimingRow label={t("arrival.kushavart")} time={timing.arrivalKushavart} />
                  <TimingRow label={t("depart.kushavart")} time={timing.departureKushavart} />
                  <TimingRow label={t("trimbakeshwar.temple")} time={timing.arrivalTrimbakeshwar} />
                  <TimingRow label={t("depart.temple")} time={timing.departureTrimbakeshwar} />
                  {timing.hospitalPoint && <TimingRow label={t("hospital.point")} time={timing.hospitalPoint} />}
                  {timing.amrutSnanStart2 && <TimingRow label={t("amrut.snan.start")} time={timing.amrutSnanStart2} highlight />}
                  <TimingRow label={t("arrival.snanghat")} time={timing.arrivalSnanGhat} />
                  <TimingRow label={t("depart.snanghat")} time={timing.departureSnanGhat} />
                  <TimingRow label={t("return.akhada")} time={timing.returnToAkhada} />
                </div>
              </DetailSection>
            )}

            <DetailSection title="Deployment">
              <DetailRow label="Expected Crowd" value={`${(props.estimatedCrowd || 0).toLocaleString()} pilgrims`} icon={Users} />
              <DetailRow label="Police Assigned" value={`${props.assignedPolice} personnel`} icon={Shield} />
            </DetailSection>
            <DetailSection title={t("route.detail")}>
              <DetailRow label="Start Point" value={akhada?.startPoint || "Assembly Ground"} icon={MapPin} />
              <DetailRow label="End Point" value={akhada?.endPoint || "Kushavart Teerth"} icon={MapPin} />
            </DetailSection>
          </div>
        );
      }

      case "parking-zones":
        return (
          <div className="space-y-4">
            <DetailSection title="Parking Details">
              <DetailRow label="Zone" value={props.name} />
              <DetailRow label="Capacity" value={`${(props.capacity || 0).toLocaleString()} vehicles`} />
              <DetailRow label="Distance" value={props.distanceToTemple} />
              <DetailRow label="Shuttle" value={props.shuttleAvailable ? "✅ Available" : "❌ Not Available"} />
            </DetailSection>
            <DetailSection title="Access">
              <DetailRow label="Entry Point" value={props.entryPoint} icon={MapPin} />
              <DetailRow label="Vehicle Types" value={(props.vehicleTypes || []).join(", ")} />
            </DetailSection>
          </div>
        );

      case "police-deployments":
        return (
          <div className="space-y-4">
            <DetailSection title="Deployment Info">
              <DetailRow label="Post" value={props.name} />
              <DetailRow label="Type" value={props.type} badge />
              <DetailRow label="Strength" value={`${props.strength} personnel`} icon={Users} />
            </DetailSection>
            <DetailSection title="Command">
              <DetailRow label="In-Charge" value={props.inCharge} icon={Shield} />
              <DetailRow label="Contact" value={props.contact} icon={Phone} />
              <DetailRow label="Shift" value={props.shift} icon={Clock} />
            </DetailSection>
            <DetailSection title="Equipment">
              <div className="flex flex-wrap gap-1 mt-1">
                {(props.equipment || []).map((eq: string, i: number) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-gray-100 text-gray-900 font-bold border border-gray-300">
                    {eq}
                  </span>
                ))}
              </div>
            </DetailSection>
          </div>
        );

      case "infrastructure":
        return (
          <div className="space-y-4">
            <DetailSection title="Infrastructure">
              <DetailRow label="Name" value={props.name} />
              <DetailRow label="Type" value={props.type} badge />
              {props.capacity && <DetailRow label="Capacity" value={`${props.capacity}`} />}
              {props.contact && <DetailRow label="Contact" value={props.contact} icon={Phone} />}
            </DetailSection>
            <DetailSection title="Description">
              <p className="text-[11px] text-gray-900 font-bold leading-relaxed">{props.description}</p>
            </DetailSection>
          </div>
        );

      case "procession-route":
        const groupMatch = props.name?.match(/Procession\s+(\d+)/i);
        const groupNo = groupMatch ? parseInt(groupMatch[1]) : null;

        let timingsToRender: ProcessionTiming[] = [];
        if (groupNo) {
          timingsToRender = PROCESSION_TIMINGS.filter(t => t.processionNo === groupNo);
        } else {
          const singleTiming = PROCESSION_TIMINGS.find(t => {
            const searchId = t.akhadaId.toLowerCase().replace(/-/g, " ");
            return (props.name || "").toLowerCase().includes(searchId);
          });
          if (singleTiming) timingsToRender = [singleTiming];
        }

        if (timingsToRender.length === 0) {
          return (
            <div className="space-y-4">
              <DetailSection title="Route Detail">
                <DetailRow label="Name" value={props.name || "Procession Route"} />
              </DetailSection>
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <DetailSection title={t("procession.group")}>
              <DetailRow label={t("procession.group")} value={props.name || `Group ${groupNo}`} badge badgeColor="#f97316" />
            </DetailSection>

            {timingsToRender.map((timing, index) => (
              <DetailSection key={timing.akhadaId} title={`${index + 1}. ${timing.akhadaName}`}>
                <div className="space-y-1.5 mt-2 mb-4">
                  {timing.customTimings ? (
                    <>
                      {timing.customTimings.map((ct, i) => {
                        const labelKey = ct.label.toLowerCase().replace(/ /g, ".") as TranslationKey;
                        return <TimingRow key={i} label={t(labelKey) || ct.label} time={ct.time} highlight={ct.highlight} />;
                      })}
                      {timing.totalDistance && <TimingRow label={t("total.distance")} time={timing.totalDistance} highlight />}
                    </>
                  ) : (
                    <>
                      <TimingRow label={t("departure.akhada")} time={timing.departureFromAkhada} />
                      <TimingRow label={t("khanderao.mandir")} time={timing.arrivalKhanderao} />
                      <TimingRow label={t("procession.start")} time={timing.amrutSnanStart} highlight />
                      <TimingRow label={t("arrival.kushavart")} time={timing.arrivalKushavart} />
                      <TimingRow label={t("depart.kushavart")} time={timing.departureKushavart} />
                      <TimingRow label={t("trimbakeshwar.temple")} time={timing.arrivalTrimbakeshwar} />
                      <TimingRow label={t("depart.temple")} time={timing.departureTrimbakeshwar} />
                      {timing.hospitalPoint && <TimingRow label={t("hospital.point")} time={timing.hospitalPoint} />}
                      {timing.amrutSnanStart2 && <TimingRow label={t("amrut.snan.start")} time={timing.amrutSnanStart2} highlight />}
                      <TimingRow label={t("arrival.snanghat")} time={timing.arrivalSnanGhat} />
                      <TimingRow label={t("depart.snanghat")} time={timing.departureSnanGhat} />
                      <TimingRow label={t("return.akhada")} time={timing.returnToAkhada} />
                      {timing.totalDistance && <TimingRow label={t("total.distance")} time={timing.totalDistance} highlight />}
                    </>
                  )}
                </div>
              </DetailSection>
            ))}

            <RouteDetailPanel props={props} layerId={layerId} />
          </div>
        );

      case "green-corridor": {
        const isCheckpoint = props.name?.startsWith("Checkpoint:");
        const villageName = props.name?.replace("Checkpoint:", "").trim() || "Village";

        return (
          <div className="space-y-4">
            <DetailSection title="Live Surveillance">
              <div className="mt-2 mb-4 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                <div className="relative w-full h-32 cursor-pointer group" onClick={() => window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: villageName } }))}>
                  <img src="/images/village_placeholder.png" alt="Route Feed" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur rounded-full p-2.5 shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 text-emerald-600 ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse tracking-widest">LIVE CCTV</div>
                </div>
                <div className="p-3 bg-white flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-xs text-gray-900 truncate pr-2">{villageName} Feed</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5">Drone monitoring active</p>
                  </div>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: villageName } }))}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    Play Video
                  </button>
                </div>
              </div>
            </DetailSection>

            <DetailSection title="Route Timeline">
              <div className="space-y-1.5 mt-2 mb-4">
                <TimingRow label="Depart Ozar Airport" time="00:00" highlight />
                <TimingRow label="Adgaon Naka Checkpoint" time="00:08" />
                <TimingRow label="Panchavati Bypass" time="00:15" />
                <TimingRow label="CBS / Nashik City" time="00:22" />
                <TimingRow label="Trimbak Road Entry" time="00:28" />
                <TimingRow label="Anjaneri Foothills" time="00:36" />
                <TimingRow label="Trimbakeshwar Outskirts" time="00:41" />
                <TimingRow label="Arrival Raigadnagar" time="00:45" highlight />
              </div>
            </DetailSection>
            <RouteDetailPanel props={props} layerId={layerId} />
          </div>
        );
      }

      case "connecting-roads":
      case "regional-roads":
        return <RouteDetailPanel props={props} layerId={layerId} />;

      default:
        if (props.name && props.name.includes("Chh Sambhaji nagar Yeola Niffad Nashik Trimbak")) {
          const villageName = props.name.startsWith("Checkpoint:") ? props.name.replace("Checkpoint:", "").trim() : "Chhatrapati Sambhajinagar";

          return (
            <div className="space-y-4">
              <DetailSection title="Live Surveillance">
                <div className="mt-2 mb-4 bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
                  <div className="relative w-full h-32 cursor-pointer group" onClick={() => window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: villageName } }))}>
                    <img src="/images/village_placeholder.png" alt="Route Feed" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                      <div className="bg-white/90 backdrop-blur rounded-full p-2.5 shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 text-emerald-600 ml-1" />
                      </div>
                    </div>
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow-lg animate-pulse tracking-widest">LIVE CCTV</div>
                  </div>
                  <div className="p-3 bg-white flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-xs text-gray-900 truncate pr-2">{villageName} Feed</h4>
                      <p className="text-[10px] text-gray-500 mt-0.5">Drone monitoring active</p>
                    </div>
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: villageName } }))}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Play Video
                    </button>
                  </div>
                </div>
              </DetailSection>

              <DetailSection title="Route Timeline">
                <div className="space-y-1.5 mt-2 mb-4">
                  <TimingRow label="Depart Chh. Sambhajinagar" time="00:00" highlight />
                  <TimingRow label="Vaijapur" time="00:45" />
                  <TimingRow label="Yeola" time="01:15" />
                  <TimingRow label="Niphad" time="01:50" />
                  <TimingRow label="Arrival Trimbakeshwar" time="03:15" highlight />
                </div>
              </DetailSection>

              <RouteDetailPanel
                props={{
                  ...props,
                  distance: "175.4 km",
                  duration: "3 hrs 15 mins",
                  startPoint: "Chh. Sambhajinagar",
                  endPoint: "Trimbakeshwar",
                  petrolPumps: 12,
                  hospitals: 5,
                  hotels: 24,
                  parking: 3
                }}
                layerId={layerId}
              />
            </div>
          );
        }

        if (props.name === "Saputara Vani Dindori Nashik Trimbak - In and Out") {
          return (
            <div className="space-y-4">
              <DetailSection title="Route Overview">
                <p className="text-[11px] text-gray-900 font-bold leading-relaxed mb-3">
                  This route traces the journey downwards from the northern border at Saputara, passing through the ghat sections of Vani and Dindori before arriving at Nashik and proceeding to Trimbakeshwar.
                </p>
              </DetailSection>

              <DetailSection title="Live Surveillance Feed">
                <div className="bg-[#0f172a]/95 backdrop-blur-md rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 overflow-hidden relative group mt-2">
                  <div className="relative w-full h-[140px] bg-black">
                    <img src="/images/village_placeholder.png" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-blue-500/30 flex items-center gap-1">
                      <Crosshair className="w-2.5 h-2.5" /> CCTV GRID
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <button onClick={() => window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: 'Vani Ghat Section' } }))} className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/40 transition-colors backdrop-blur-sm border border-blue-400/30 hover:scale-110 duration-300">
                        <Play className="w-5 h-5 text-blue-400 ml-1 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 bg-black/40 border-t border-blue-500/20">
                    <h4 className="text-white font-bold text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      Vani Ghat Feed
                    </h4>
                    <p className="text-slate-400 text-[9px] mt-0.5">Monitoring mountain pass traffic density and convoy movement.</p>
                  </div>
                </div>
              </DetailSection>

              <DetailSection title="Route Timeline">
                <div className="space-y-1.5 mt-2">
                  <TimingRow label="Depart Saputara" time="00:00" highlight />
                  <TimingRow label="Vani" time="01:10" />
                  <TimingRow label="Dindori" time="02:00" />
                  <TimingRow label="Nashik City" time="02:45" />
                  <TimingRow label="Arrival Trimbakeshwar" time="03:30" highlight />
                </div>
              </DetailSection>

              <RouteDetailPanel
                props={{
                  ...props,
                  distance: "128.5 km",
                  duration: "3 hrs 30 mins",
                  startPoint: "Saputara",
                  endPoint: "Trimbakeshwar",
                  petrolPumps: 9,
                  hospitals: 4,
                  hotels: 15,
                  parking: 3
                }}
                layerId={layerId}
              />
            </div>
          );
        }

        if (props.name === "Mumbai Igatpuri Vaitarana Phata Saturli Ahurli Pegalwadi Trimabakehswar - In and Out") {
          return (
            <div className="space-y-4">
              <DetailSection title="Route Overview">
                <p className="text-[11px] text-gray-900 font-bold leading-relaxed mb-3">
                  This route covers the approach from the Mumbai direction via Igatpuri, winding past Vaitarna lake, Saturli, Ahurli, Pahine, and Bhilmal before arriving at Trimbakeshwar.
                </p>
              </DetailSection>

              <DetailSection title="Live Surveillance Feed">
                <div className="bg-[#0f172a]/95 backdrop-blur-md rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 overflow-hidden relative group mt-2">
                  <div className="relative w-full h-[140px] bg-black">
                    <img src="/images/village_placeholder.png" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-blue-500/30 flex items-center gap-1">
                      <Crosshair className="w-2.5 h-2.5" /> CCTV GRID
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <button onClick={() => window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: 'Vaitarna Dam View' } }))} className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/40 transition-colors backdrop-blur-sm border border-blue-400/30 hover:scale-110 duration-300">
                        <Play className="w-5 h-5 text-blue-400 ml-1 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 bg-black/40 border-t border-blue-500/20">
                    <h4 className="text-white font-bold text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      Vaitarna Dam Feed
                    </h4>
                    <p className="text-slate-400 text-[9px] mt-0.5">Monitoring lake approach road traffic and convoy density.</p>
                  </div>
                </div>
              </DetailSection>

              <DetailSection title="Route Timeline">
                <div className="space-y-1.5 mt-2">
                  <TimingRow label="Depart Igatpuri (Ghoti)" time="00:00" highlight />
                  <TimingRow label="Vaitarna Checkpoint" time="00:45" />
                  <TimingRow label="Pahine" time="01:15" />
                  <TimingRow label="Bhilmal" time="01:40" />
                  <TimingRow label="Arrival Trimbakeshwar" time="02:00" highlight />
                </div>
              </DetailSection>

              <RouteDetailPanel
                props={{
                  ...props,
                  distance: "72.4 km",
                  duration: "2 hrs 00 mins",
                  startPoint: "Igatpuri",
                  endPoint: "Trimbakeshwar",
                  petrolPumps: 6,
                  hospitals: 3,
                  hotels: 12,
                  parking: 4
                }}
                layerId={layerId}
              />
            </div>
          );
        }

        if (props.name === "Nashik - Laddha Inner Parking - Trimabkeshwar - In and Out") {
          return (
            <div className="space-y-4">
              <DetailSection title="Route Overview">
                <p className="text-[11px] text-gray-900 font-bold leading-relaxed mb-3">
                  This is the primary local route connecting Nashik City to Trimbakeshwar, passing through Khambale and the Anjaneri foothills before terminating at the Laddha Inner Parking.
                </p>
              </DetailSection>

              <DetailSection title="Live Surveillance Feed">
                <div className="bg-[#0f172a]/95 backdrop-blur-md rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 overflow-hidden relative group mt-2">
                  <div className="relative w-full h-[140px] bg-black">
                    <img src="/images/village_placeholder.png" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-blue-500/30 flex items-center gap-1">
                      <Crosshair className="w-2.5 h-2.5" /> CCTV GRID
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <button onClick={() => window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: 'Anjaneri Foothills' } }))} className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/40 transition-colors backdrop-blur-sm border border-blue-400/30 hover:scale-110 duration-300">
                        <Play className="w-5 h-5 text-blue-400 ml-1 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 bg-black/40 border-t border-blue-500/20">
                    <h4 className="text-white font-bold text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      Anjaneri Highway Feed
                    </h4>
                    <p className="text-slate-400 text-[9px] mt-0.5">Monitoring continuous flow of local commuter and pilgrim traffic.</p>
                  </div>
                </div>
              </DetailSection>

              <DetailSection title="Route Timeline">
                <div className="space-y-1.5 mt-2">
                  <TimingRow label="Depart Nashik City" time="00:00" highlight />
                  <TimingRow label="Khambale Point" time="00:20" />
                  <TimingRow label="Anjaneri Phata" time="00:35" />
                  <TimingRow label="Arrival Laddha Parking" time="00:55" highlight />
                </div>
              </DetailSection>

              <RouteDetailPanel
                props={{
                  ...props,
                  distance: "28.5 km",
                  duration: "55 mins",
                  startPoint: "Nashik",
                  endPoint: "Laddha Parking",
                  petrolPumps: 8,
                  hospitals: 5,
                  hotels: 25,
                  parking: 5
                }}
                layerId={layerId}
              />
            </div>
          );
        }

        if (
          props.name === "Dharampur Peth Karanjali Kohor Waghera Amboli Trimabkeshwar - In and Out" ||
          props.name === "Javhar Mokhada Amboli Trimabkeswar - In and Out"
        ) {
          return (
            <div className="space-y-4">
              <DetailSection title="Route Overview">
                <p className="text-[11px] text-gray-900 font-bold leading-relaxed mb-3">
                  This covers the western and north-western tribal belt routes coming from Peth and Mokhada regions. Both routes converge at Amboli before descending into Trimbakeshwar.
                </p>
              </DetailSection>

              <DetailSection title="Live Surveillance Feed">
                <div className="bg-[#0f172a]/95 backdrop-blur-md rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 overflow-hidden relative group mt-2">
                  <div className="relative w-full h-[140px] bg-black">
                    <img src="/images/village_placeholder.png" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-blue-500/30 flex items-center gap-1">
                      <Crosshair className="w-2.5 h-2.5" /> CCTV GRID
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <button onClick={() => window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: 'Amboli Phata Merge Point' } }))} className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/40 transition-colors backdrop-blur-sm border border-blue-400/30 hover:scale-110 duration-300">
                        <Play className="w-5 h-5 text-blue-400 ml-1 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 bg-black/40 border-t border-blue-500/20">
                    <h4 className="text-white font-bold text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      Amboli Phata Feed
                    </h4>
                    <p className="text-slate-400 text-[9px] mt-0.5">Monitoring the convergence point of all incoming western traffic.</p>
                  </div>
                </div>
              </DetailSection>

              <DetailSection title="Route Timeline">
                <div className="space-y-1.5 mt-2">
                  <TimingRow label="Depart Peth / Mokhada" time="00:00" highlight />
                  <TimingRow label="Tribal Belt Transit" time="00:50" />
                  <TimingRow label="Amboli Phata (Merge)" time="01:40" highlight />
                  <TimingRow label="Arrival Trimbakeshwar" time="02:15" highlight />
                </div>
              </DetailSection>

              <RouteDetailPanel
                props={{
                  ...props,
                  distance: "84.2 km",
                  duration: "2 hrs 15 mins",
                  startPoint: "Western Borders",
                  endPoint: "Trimbakeshwar",
                  petrolPumps: 4,
                  hospitals: 2,
                  hotels: 5,
                  parking: 2
                }}
                layerId={layerId}
              />
            </div>
          );
        }

        if (props.name === "Inner Parking Hubs") {
          return (
            <div className="space-y-4">
              <DetailSection title="Parking Overview">
                <p className="text-[11px] text-gray-900 font-bold leading-relaxed mb-3">
                  The Inner Parking Hubs act as the final vehicular checkpoints before the core pedestrian zones of Trimbakeshwar. These four strategic hubs absorb all incoming regional traffic and serve as transfer points for pilgrim shuttles.
                </p>
              </DetailSection>

              <DetailSection title="Live Surveillance Feed">
                <div className="bg-[#0f172a]/95 backdrop-blur-md rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-sky-500/30 overflow-hidden relative group mt-2">
                  <div className="relative w-full h-[140px] bg-black">
                    <img src="/images/village_placeholder.png" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-2 left-2 bg-sky-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-sky-400/50">PARKING CAM</div>
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-sky-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-sky-500/30 flex items-center gap-1">
                      <Crosshair className="w-2.5 h-2.5" /> HUB GRID
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <button onClick={() => window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: 'Laddha Inner Parking' } }))} className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center hover:bg-sky-500/40 transition-colors backdrop-blur-sm border border-sky-400/30 hover:scale-110 duration-300">
                        <Play className="w-5 h-5 text-sky-400 ml-1 drop-shadow-[0_0_8px_rgba(56,189,248,0.8)]" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 bg-black/40 border-t border-sky-500/20">
                    <h4 className="text-white font-bold text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                      Laddha Parking Capacity Feed
                    </h4>
                    <p className="text-slate-400 text-[9px] mt-0.5">Real-time drone monitoring of parking occupancy and shuttle boarding lines.</p>
                  </div>
                </div>
              </DetailSection>

              <DetailSection title="Hub Locations">
                <div className="space-y-1.5 mt-2">
                  <TimingRow label="Laddha Inner (East)" time="12,000 Capacity" highlight />
                  <TimingRow label="Sapgaon Inner (NW)" time="8,500 Capacity" />
                  <TimingRow label="BG Farm Inner (SW)" time="15,000 Capacity" />
                  <TimingRow label="Talwade Inner (North)" time="10,000 Capacity" highlight />
                </div>
              </DetailSection>
            </div>
          );
        }

        if (props.name === "Dhule Malegaon Nashik Trimbak - In and Out") {
          return (
            <div className="space-y-4">
              <DetailSection title="Route Overview">
                <p className="text-[11px] text-gray-900 font-bold leading-relaxed mb-3">
                  This route has two starting points: one from Dhule passing through Malegaon, and another from Satana. The two branches merge at Chandvad and continue as a single convoy through Nashik to Trimbakeshwar.
                </p>
              </DetailSection>

              <DetailSection title="Live Surveillance Feed">
                <div className="bg-[#0f172a]/95 backdrop-blur-md rounded-xl shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-blue-500/30 overflow-hidden relative group mt-2">
                  <div className="relative w-full h-[140px] bg-black">
                    <img src="/images/village_placeholder.png" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                    <div className="absolute top-2 left-2 bg-red-600/90 backdrop-blur-sm text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm animate-pulse tracking-widest border border-red-400/50">LIVE</div>
                    <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-blue-400 text-[8px] font-mono px-1.5 py-0.5 rounded border border-blue-500/30 flex items-center gap-1">
                      <Crosshair className="w-2.5 h-2.5" /> CCTV GRID
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">
                      <button onClick={() => window.dispatchEvent(new CustomEvent('playVillageVideo', { detail: { name: 'Chandvad Merge Point' } }))} className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center hover:bg-blue-500/40 transition-colors backdrop-blur-sm border border-blue-400/30 hover:scale-110 duration-300">
                        <Play className="w-5 h-5 text-blue-400 ml-1 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" fill="currentColor" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2.5 bg-black/40 border-t border-blue-500/20">
                    <h4 className="text-white font-bold text-[11px] flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                      Chandvad Merge Point
                    </h4>
                    <p className="text-slate-400 text-[9px] mt-0.5">Monitoring the convergence of Satana and Malegaon convoys.</p>
                  </div>
                </div>
              </DetailSection>

              <DetailSection title="Route Timeline">
                <div className="space-y-1.5 mt-2">
                  <TimingRow label="Depart Dhule" time="00:00" highlight />
                  <TimingRow label="Depart Satana" time="00:15" highlight />
                  <TimingRow label="Malegaon (Dhule Branch)" time="00:50" />
                  <TimingRow label="Merge at Chandvad" time="01:45" highlight />
                  <TimingRow label="Nashik City" time="02:30" />
                  <TimingRow label="Arrival Trimbakeshwar" time="03:10" highlight />
                </div>
              </DetailSection>

              <RouteDetailPanel
                props={{
                  ...props,
                  distance: "165.2 km",
                  duration: "3 hrs 10 mins",
                  startPoint: "Dhule",
                  endPoint: "Trimbakeshwar",
                  petrolPumps: 14,
                  hospitals: 6,
                  hotels: 18,
                  parking: 4
                }}
                layerId={layerId}
              />
            </div>
          );
        }

        return (
          <div className="space-y-4">
            <DetailSection title="Feature Details">
              <DetailRow label="Name" value={props.name || "Unknown"} />
              {props.description && (
                <p className="text-[11px] text-gray-900 font-bold leading-relaxed mt-2">{props.description}</p>
              )}
              {props.zone && <DetailRow label="Zone" value={props.zone} badge />}
              {props.restrictions && (
                <div className="mt-2">
                  <span className="text-[9px] text-gray-700 font-bold uppercase tracking-wider">Restrictions:</span>
                  <ul className="mt-1 space-y-1">
                    {(props.restrictions as string[]).map((r: string, i: number) => (
                      <li key={i} className="text-[10px] text-gray-900 font-bold flex items-start gap-1.5">
                        <span className="text-gray-600 mt-0.5">•</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </DetailSection>
          </div>
        );
    }
  };

  // Layer type label
  const layerLabels: Record<string, TranslationKey> = {
    "akhada-routes": "akhada.route",
    "parking-zones": "parking.zone",
    "police-deployments": "police.post",
    infrastructure: "infrastructure",
    scenarios: "scenario.feature",
    "movement-green": "movement.zone",
    "movement-orange": "movement.zone",
    "movement-red": "movement.zone",
    "custom-map": "custom.map",
    "procession-route": "shahi.marg.route",
  };



  return (
    <div className="h-full flex flex-col bg-[#111111]/80 backdrop-blur-2xl border-l border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.8)]">
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex items-center justify-between px-5 bg-black/40 flex-shrink-0">
        <div className="flex items-center">
          <ShieldCheck className="w-4 h-4 text-[#D4AF37] mr-2.5" />
          <div>
            <h2 className="text-white/95 font-extrabold text-[12px] tracking-wide uppercase leading-none drop-shadow-sm">
              {layerLabels[layerId] ? t(layerLabels[layerId]) : t("feature.detail")}
            </h2>
            <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">
              {props.name?.substring(0, 30) || t("selected")}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col custom-scrollbar">
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

// ── Helpers ─────────────────────────────────────────────────
function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-[0.2em] mb-2 pb-1 border-b border-white/10">
        {title}
      </div>
      {children}
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon: Icon,
  badge,
  badgeColor,
}: {
  label: string;
  value: string;
  icon?: any;
  badge?: boolean;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-start justify-between py-1.5 gap-2">
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {Icon && <Icon className="w-3 h-3 text-gray-400" />}
        <span className="text-[10px] text-gray-400 font-medium font-medium">{label}</span>
      </div>
      {badge ? (
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-md capitalize"
          style={{
            background: badgeColor ? `${badgeColor}20` : "rgba(255,255,255,0.1)",
            color: badgeColor || "#e5e7eb",
            border: `1px solid ${badgeColor ? `${badgeColor}30` : "rgba(255,255,255,0.2)"}`,
          }}
        >
          {value}
        </span>
      ) : (
        <span className="text-[11px] text-white/90 font-medium font-medium text-right">{value}</span>
      )}
    </div>
  );
}

function TimingRow({ label, time, highlight }: { label: string; time: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1.5 px-2 rounded-md ${highlight ? 'bg-[#D4AF37]/20 border border-[#D4AF37]/30' : 'bg-white/5 border border-white/10 hover:bg-white/10 transition-colors'}`}>
      <div className="flex items-center gap-2">
        <CalendarClock className={`w-3.5 h-3.5 ${highlight ? 'text-[#D4AF37]' : 'text-gray-400 font-medium'}`} />
        <span className={`text-[10.5px] font-medium ${highlight ? 'text-[#D4AF37] font-bold drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]' : 'text-white font-bold'}`}>{label}</span>
      </div>
      <span className={`text-[11px] font-bold ${highlight ? 'text-[#D4AF37]' : 'text-gray-300 font-bold'}`}>{time}</span>
    </div>
  );
}

function RouteDetailPanel({ props, layerId }: { props: any, layerId: string }) {
  // Generate pseudo-data for visual richness if not explicitly provided in props
  // Use deterministic pseudo-random based on name length to avoid React hydration/purity errors
  const seed = (props.name || "").length || 5;
  const distance = props.distance || ((seed % 40) + 10).toFixed(1) + " km";
  const duration = props.duration || ((seed * 7) % 60 + 30) + " mins";
  const startPoint = props.startPoint || (props.name?.includes(" to ") ? props.name.split(" to ")[0] : "Origin Point");
  const endPoint = props.endPoint || (props.name?.includes(" to ") ? props.name.split(" to ")[1].split(" ")[0] : "Destination");
  const petrol = props.petrolPumps || (seed % 5 + 1);
  const hospitals = props.hospitals || (seed % 3 + 1);
  const hotels = props.hotels || (seed % 10 + 2);
  const parking = props.parking || (seed % 4 + 1);

  return (
    <div className="space-y-4">
      <DetailSection title="Route Overview">
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col items-center justify-center shadow-inner hover:bg-white/10 transition-colors">
            <Route className="w-4 h-4 text-[#D4AF37] mb-1" />
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Distance</span>
            <span className="text-[12px] text-white font-extrabold">{distance}</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 flex flex-col items-center justify-center shadow-inner hover:bg-white/10 transition-colors">
            <Timer className="w-4 h-4 text-[#D4AF37] mb-1" />
            <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Est. Time</span>
            <span className="text-[12px] text-white font-extrabold">{duration}</span>
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Trajectory">
        <div className="relative border-l-2 border-[#D4AF37]/30 ml-2 pl-4 py-1 mt-2 flex flex-col gap-3">
          <div className="relative">
            <div className="absolute w-2.5 h-2.5 rounded-full bg-[#111111] -left-[21px] top-[2px] border-2 border-[#D4AF37] shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
            <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider leading-none">Start Point</span>
            <div className="text-[11px] font-bold text-white/90 leading-tight mt-0.5">{startPoint}</div>
          </div>
          <div className="relative">
            <div className="absolute w-2.5 h-2.5 rounded-full bg-[#D4AF37] -left-[21px] top-[2px] border-2 border-[#111111] shadow-[0_0_8px_rgba(212,175,55,0.5)]" />
            <span className="text-[9px] text-gray-400 block uppercase font-bold tracking-wider leading-none">End Point</span>
            <div className="text-[11px] font-bold text-white/90 leading-tight mt-0.5">{endPoint}</div>
          </div>
        </div>
      </DetailSection>

      <DetailSection title="Nearby Amenities">
        <div className="space-y-1.5 mt-2">
          <DetailRow label="Petrol Pumps" value={`${petrol} Stations`} icon={Fuel} />
          <DetailRow label="Hospitals & Clinics" value={`${hospitals} Facilities`} icon={Activity} />
          <DetailRow label="Hotels & Stays" value={`${hotels} Available`} icon={Bed} />
          <DetailRow label="Parking Zones" value={`${parking} Areas`} icon={CircleParking} />
        </div>
      </DetailSection>
    </div>
  );
}
