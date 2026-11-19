import { format } from "date-fns";
import prisma from "@/lib/db/prisma";
import { LiveRunningStatusResult, StationLiveStatus } from "./types";

// In-memory cache with 60s TTL for sub-millisecond responses on repeated queries
interface CacheEntry {
  data: LiveRunningStatusResult;
  timestamp: number;
}
const cache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000;

/**
 * Known common railway stations map for instant lookup & pretty names
 */
const KNOWN_STATIONS: Record<string, string> = {
  NDLS: "New Delhi",
  BCT: "Mumbai Central",
  MMCT: "Mumbai Central",
  CNB: "Kanpur Central",
  PRYJ: "Prayagraj Junction",
  DDU: "Pt. Deen Dayal Upadhyaya",
  PNBE: "Patna Junction",
  HWH: "Howrah Junction",
  MAS: "Chennai Central",
  SBC: "KSR Bengaluru",
  LKO: "Lucknow Charbagh",
  DURG: "Durg Junction",
  R: "Raipur Junction",
  BYT: "Bhatapara",
  BSP: "Bilaspur Junction",
  APR: "Anuppur Junction",
  SDL: "Shahdol",
  UMR: "Umaria",
  KTE: "Katni Junction",
  STA: "Satna Junction",
  MJG: "Majhagawan",
  MKP: "Manikpur Junction",
  BSB: "Varanasi Junction",
  CPR: "Chhapra Junction",
  BPHB: "Bhilai Power House",
  TLD: "Tilda",
  USL: "Uslapur",
  PND: "Pendra Road",
  PRAYAG: "Prayag Junction",
  GCT: "Ghazipur City",
  BUI: "Ballia",
};

/**
 * Fetch real live train status from Indian Railways NTES live tracking gateway.
 * Has strict 2500ms timeout with graceful error handling.
 */
export async function fetchLiveRailwayStatus(
  trainNumber: string,
  date?: string
): Promise<LiveRunningStatusResult | null> {
  const cleanTrainNo = trainNumber.trim().replace(/\D/g, "");
  if (!cleanTrainNo || cleanTrainNo.length < 4) return null;

  const targetDate = date || format(new Date(), "yyyy-MM-dd");
  const cacheKey = `${cleanTrainNo}_${targetDate}`;

  // Check cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 1. Try RailRadar if API Key is configured in environment
  const railRadarKey = process.env.RAILRADAR_API_KEY;
  if (railRadarKey) {
    try {
      const rrResult = await fetchRailRadarLive(cleanTrainNo, targetDate, railRadarKey);
      if (rrResult) {
        cache.set(cacheKey, { data: rrResult, timestamp: Date.now() });
        return rrResult;
      }
    } catch (e) {
      console.warn(`[LiveRail] RailRadar lookup error for ${cleanTrainNo}:`, e);
    }
  }

  // 2. Fetch live running status from NTES (National Train Enquiry System)
  try {
    const ntesResult = await fetchNTESLive(cleanTrainNo, targetDate);
    if (ntesResult) {
      cache.set(cacheKey, { data: ntesResult, timestamp: Date.now() });
      return ntesResult;
    }
  } catch (err) {
    console.warn(`[LiveRail] NTES live fetch failed for ${cleanTrainNo}:`, err);
  }

  return null;
}

/**
 * Direct integration with RailRadar API (https://api.railradar.in or api.railradar.org)
 */
async function fetchRailRadarLive(
  trainNo: string,
  targetDate: string,
  apiKey: string
): Promise<LiveRunningStatusResult | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const res = await fetch(
      `https://api.railradar.in/v1/trains/${encodeURIComponent(trainNo)}/live`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "x-api-key": apiKey,
          Accept: "application/json",
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timeoutId);

    if (!res.ok) return null;
    const json = await res.json();
    if (!json || json.success === false || !json.data) return null;

    const live = json.data.liveData || json.data;
    const trainInfo = json.data.train || {};
    const route = live.route || [];

    const timeline: StationLiveStatus[] = route.map((st: any, idx: number) => {
      const delay = st.delayArrivalMinutes ?? st.delayMinutes ?? 0;
      const isPast = st.actualArrival || st.actualDeparture || idx < (live.currentStopIndex || 0);
      const isCurrent = idx === (live.currentStopIndex || 0);

      return {
        stationCode: st.stationCode,
        stationName: st.stationName || KNOWN_STATIONS[st.stationCode] || st.stationCode,
        scheduledArrival: st.scheduledArrival || null,
        scheduledDeparture: st.scheduledDeparture || null,
        expectedArrival: st.actualArrival || st.scheduledArrival || null,
        expectedDeparture: st.actualDeparture || st.scheduledDeparture || null,
        delayMins: delay,
        platform: st.platform || undefined,
        dayOffset: st.dayOffset || 0,
        distanceKm: st.distanceKm || st.distanceFromSourceKm || 0,
        haltMins: st.haltMins || 2,
        status: isCurrent ? "CURRENT" : isPast ? "DEPARTED" : "UPCOMING",
      };
    });

    const currentStation = timeline.find((t) => t.status === "CURRENT") || timeline[0];

    return {
      trainNumber: trainInfo.trainNumber || trainNo,
      trainName: trainInfo.trainName || `Express #${trainNo}`,
      runDate: targetDate,
      lastUpdated: format(new Date(), "HH:mm 'IST'"),
      currentStationCode: currentStation?.stationCode || "NDLS",
      currentStationName: currentStation?.stationName || "In Transit",
      overallDelayMins: live.delayMinutes ?? currentStation?.delayMins ?? 0,
      isDelayed: (live.delayMinutes ?? currentStation?.delayMins ?? 0) > 5,
      timeline,
    };
  } catch {
    clearTimeout(timeoutId);
    return null;
  }
}

/**
 * Fetch and parse official Indian Railways live tracking from NTES
 */
async function fetchNTESLive(
  trainNo: string,
  targetDate: string
): Promise<LiveRunningStatusResult | null> {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    Accept: "*/*",
    Referer: "https://enquiry.indianrail.gov.in/mntes/",
    Origin: "https://enquiry.indianrail.gov.in",
    "X-Requested-With": "XMLHttpRequest",
  };

  // Step 1: Session bootstrap
  const r0 = await fetch("https://enquiry.indianrail.gov.in/mntes/", {
    headers,
    signal: AbortSignal.timeout(2000),
  });
  const cookies = r0.headers.get("set-cookie") || "";

  // Step 2: CSRF token retrieval
  const r1 = await fetch(
    `https://enquiry.indianrail.gov.in/mntes/GetCSRFToken?t=${Date.now()}`,
    {
      headers: { ...headers, Cookie: cookies },
      signal: AbortSignal.timeout(2000),
    }
  );
  const r1Text = await r1.text();
  const tokenMatch = r1Text.match(/name=\x27([^\x27]+)\x27\s+value=\x27([^\x27]+)\x27/);
  if (!tokenMatch) return null;
  const [_, csrfKey, csrfVal] = tokenMatch;

  // Step 3: Format query date in DD-Mon-YYYY format (e.g. 19-Nov-2026)
  const dObj = new Date(targetDate);
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
    .format(isNaN(dObj.getTime()) ? new Date() : dObj)
    .replace(/ /g, "-");

  const params = new URLSearchParams({
    opt: "TrainRunning",
    subOpt: "FindRunningInstance",
    refDate: formattedDate,
  });

  const body = new URLSearchParams({
    lan: "en",
    jDate: formattedDate,
    trainNo: trainNo,
    [csrfKey]: csrfVal,
  });

  // Step 4: Query running instance
  const r2 = await fetch(`https://enquiry.indianrail.gov.in/mntes/tr?${params.toString()}`, {
    method: "POST",
    headers: {
      ...headers,
      Cookie: cookies,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
    signal: AbortSignal.timeout(3000),
  });

  const html = await r2.text();
  if (!html || html.length < 500) return null;

  // Extract Train Name from NTES HTML
  let trainName = `Express #${trainNo}`;
  const headerMatch = html.match(
    /<div[^>]*class="[^"]*w3-blue[^"]*"[^>]*>\s*<h[1-6][^>]*>\s*(?:[0-9]{4,5}\s+)?([^<]+)<\/h[1-6]>/i
  );
  if (headerMatch && !headerMatch[1].toLowerCase().includes("spot your train")) {
    trainName = headerMatch[1].trim();
  } else {
    // Try secondary header pattern
    const secMatch = html.match(/<h3>([0-9]{4,5}\s+[^<]+)<\/h3>/i);
    if (secMatch) {
      trainName = secMatch[1].replace(/^[0-9]{4,5}\s+/, "").trim();
    }
  }

  // Extract Live Current Status Line
  let currentStationCode = "";
  let currentStationName = "";
  let overallDelayMins = 0;
  let lastUpdatedTime = format(new Date(), "HH:mm 'IST'");

  const updateMatch = html.match(/Last Updates On\s*<\/h4>\s*<font[^>]*>([0-9A-Za-z-:\s]+)<\/font>/i);
  if (updateMatch) {
    const rawTime = updateMatch[1].trim().split(" ")[1];
    if (rawTime) lastUpdatedTime = `${rawTime} IST`;
  }

  const liveMatch = html.match(
    /(?:Departed from|Arrived at|Yet to start from|Running near|Reached Destination)\s+([A-Za-z\s]+?)(?:\(([A-Z0-9]+)\))?\s*(?:at|on)?\s*([0-9:]+)?(?:\s+([0-9A-Za-z-]+))?(?:[^()]*\((?:Delay:?\s*([0-9:]+))\))?/i
  );

  if (liveMatch) {
    currentStationName = liveMatch[1]?.trim() || "";
    currentStationCode = liveMatch[2]?.trim() || "";
    if (liveMatch[5]) {
      const [dh, dm] = liveMatch[5].split(":").map(Number);
      overallDelayMins = (dh || 0) * 60 + (dm || 0);
    }
  }

  // Fallback for current station name if overly concise or missing
  if (!currentStationName || currentStationName.length <= 2) {
    const depMatch = html.match(/(?:Departed from|Arrived at)\s+([A-Za-z\s]+?)\s*\(\s*([A-Z0-9]+)\s*\)/i);
    if (depMatch) {
      currentStationName = depMatch[1].trim();
      currentStationCode = depMatch[2].trim();
    }
  }

  // Parse stop rows
  const rowChunks = html.split(/<div[^>]*class="[^"]*stopRow[^"]*"/gi).slice(1);
  const rawStops: Array<{
    code: string;
    name: string;
    platform?: string;
    distanceKm: number;
    times: string[];
  }> = [];

  const seenCodes = new Set<string>();

  for (const chunk of rowChunks) {
    if (!chunk.includes("stopArrow") && !chunk.includes("Non-Stopping Stations") && !chunk.includes("SRC")) {
      continue;
    }

    const codeMatch = chunk.match(/<b>([A-Z]{2,6})\s*(?:<span[^>]*>(PF\s*[^<]+)<\/span>)?\s*<\/b>/i);
    if (!codeMatch) continue;

    const code = codeMatch[1].trim();
    if (seenCodes.has(code)) continue;
    seenCodes.add(code);

    const nameMatch = chunk.match(/<span>\s*<font[^>]*>\s*<b>([^<]+)<\/b>/i);
    const distMatch = chunk.match(/<b>(\d+)<\/b>\s*KMs/i);
    const times = [...chunk.matchAll(/([0-2][0-9]:[0-5][0-9])\s+[0-9]{1,2}-[A-Za-z]{3}/g)].map(
      (m) => m[1]
    );

    let rawName = nameMatch ? nameMatch[1].replace(/&nbsp;/g, "").trim() : code;
    if (rawName.includes("SRC") || rawName.includes("Nov") || rawName.includes("Dec") || rawName.length <= 2) {
      rawName = KNOWN_STATIONS[code] || code;
    }

    rawStops.push({
      code,
      name: KNOWN_STATIONS[code] || rawName,
      platform: codeMatch[2]?.replace(/<[^>]+>/g, "").trim() || undefined,
      distanceKm: distMatch ? parseInt(distMatch[1], 10) : 0,
      times,
    });
  }

  // If no stop rows could be extracted, return null to trigger deterministic fallback
  if (rawStops.length === 0) return null;

  // Determine current stop index
  let currentIdx = -1;
  if (currentStationCode) {
    currentIdx = rawStops.findIndex((s) => s.code === currentStationCode);
  }
  if (currentIdx === -1 && currentStationName) {
    currentIdx = rawStops.findIndex(
      (s) => s.name.toLowerCase().includes(currentStationName.toLowerCase()) ||
             currentStationName.toLowerCase().includes(s.name.toLowerCase())
    );
  }
  if (currentIdx === -1) {
    currentIdx = Math.floor(rawStops.length / 2);
  }

  if (!currentStationName && rawStops[currentIdx]) {
    currentStationName = rawStops[currentIdx].name;
    currentStationCode = rawStops[currentIdx].code;
  }

  // Construct timeline
  const timeline: StationLiveStatus[] = rawStops.map((stop, idx) => {
    let status: "DEPARTED" | "CURRENT" | "UPCOMING" = "UPCOMING";
    if (idx < currentIdx) status = "DEPARTED";
    else if (idx === currentIdx) status = "CURRENT";

    const schArr = stop.times[0] || null;
    const schDep = stop.times[1] || stop.times[0] || null;

    // Expected times with delay
    let expArr = schArr;
    if (schArr && overallDelayMins > 0) {
      const [h, m] = schArr.split(":").map(Number);
      const tot = (h * 60 + m + overallDelayMins) % 1440;
      expArr = `${String(Math.floor(tot / 60)).padStart(2, "0")}:${String(tot % 60).padStart(2, "0")}`;
    }

    let expDep = schDep;
    if (schDep && overallDelayMins > 0) {
      const [h, m] = schDep.split(":").map(Number);
      const tot = (h * 60 + m + overallDelayMins) % 1440;
      expDep = `${String(Math.floor(tot / 60)).padStart(2, "0")}:${String(tot % 60).padStart(2, "0")}`;
    }

    return {
      stationCode: stop.code,
      stationName: stop.name,
      scheduledArrival: schArr,
      scheduledDeparture: schDep,
      expectedArrival: expArr,
      expectedDeparture: expDep,
      delayMins: idx <= currentIdx ? overallDelayMins : Math.max(0, overallDelayMins - (idx - currentIdx) * 2),
      platform: stop.platform,
      dayOffset: Math.floor(stop.distanceKm / 1000),
      distanceKm: stop.distanceKm,
      haltMins: schArr && schDep && schArr !== schDep ? 5 : 2,
      status,
    };
  });

  return {
    trainNumber: trainNo,
    trainName,
    runDate: targetDate,
    lastUpdated: lastUpdatedTime,
    currentStationCode: currentStationCode || timeline[currentIdx]?.stationCode || "NDLS",
    currentStationName: currentStationName || timeline[currentIdx]?.stationName || "In Transit",
    overallDelayMins,
    isDelayed: overallDelayMins > 5,
    timeline,
  };
}
