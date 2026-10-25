/**
 * JEEVANDARPAN — FUTURE TRANSIT VERIFICATION ENGINE (PHASE 3C.3)
 * 
 * High-resolution deterministic astronomical future transit scanner powered by Swiss Ephemeris.
 * Scans candidate Dasha timing windows [startDate, endDate] using planet-specific baseline
 * resolutions and deterministic binary subdivision refinement for exact boundary detection.
 * 
 * STRICT INTEGRITY CONSTRAINTS:
 * - NO fabricated coordinates or dates
 * - NO AI-generated planetary calculations
 * - DOES NOT modify or re-rank selected Dasha/KP timing windows
 * - NEVER substitutes current query transit as evidence for future windows
 * - Binary subdivision reaches <=30 min precision for Moon, <=60 min for other planets
 */

import { Calendar, Ayanamsa, Flag } from '@kuntay/swisseph';
import { MasterKundliData } from '../../types/kundli';
import { KPAnalysisResult } from './kpEngine';
import {
  FutureTransitCorroboration,
  FutureTransitEvent,
  FutureTransitStatus,
  FutureTransitBoundaryType
} from '../../types/jyotish/kpTiming';
import {
  TransitEvidenceRecord,
  TransitEvidenceLedger,
  TransitPrecision,
  TransitRejectionReason
} from '../../types/jyotish/transitEvidence';
import {
  createTransitEvidenceRecord,
  createTransitEvidenceLedger
} from './transitEvidenceLedger';
import {
  getSwissEph,
  BODIES,
  NAKSHATRA_NAMES,
  NAK_LORDS,
  RASHI_NAMES,
  RASHI_NAMES_HI,
  PLANET_NAMES_HI
} from './transitEngine';

export interface FutureScanOptions {
  latitude?: number;
  longitude?: number;
  timezone?: string;
  ayanamsa?: 'Lahiri' | 'Raman';
}

export interface SinglePlanetState {
  planet: string;
  timestampMs: number;
  siderealLongitude: number;
  rashiIdx: number;
  degInSign: number;
  nakNumber: number;
  nakName: string;
  nakLord: string;
  pada: number;
  isRetrograde: boolean;
  transitHouse: number;
  motionStatus: 'Direct' | 'Retrograde';
}

export const PLANET_INTERVAL_HOURS: Record<string, number> = {
  Moon: 6,      // 6 hours baseline for fast Moon motion
  Sun: 24,      // 1 day baseline
  Mercury: 24,  // 1 day baseline
  Venus: 24,    // 1 day baseline
  Mars: 48,     // 2 days baseline
  Jupiter: 72,  // 3 days baseline
  Saturn: 120,  // 5 days baseline
  Rahu: 120,    // 5 days baseline
  Ketu: 120     // 5 days baseline
};

export class FutureTransitEngine {
  /**
   * Scans a specific Dasha timing window using real Swiss Ephemeris calculations.
   */
  public async scanWindow(
    window: {
      id?: string;
      startDate: string;
      endDate: string;
      mahadashaLord: string;
      antardashaLord: string;
    },
    masterData: MasterKundliData | null | undefined,
    kpResult: KPAnalysisResult,
    targetHouses: number[],
    adverseHouses: number[],
    primaryCuspSubLord: string,
    options: FutureScanOptions = {}
  ): Promise<FutureTransitCorroboration> {
    const scanStart = window.startDate;
    const scanEnd = window.endDate;

    const startMs = new Date(scanStart).getTime();
    const endMs = new Date(scanEnd).getTime();

    if (isNaN(startMs) || isNaN(endMs) || startMs >= endMs) {
      return {
        status: 'CALCULATION_ERROR',
        isCorroborated: false,
        scanStart,
        scanEnd,
        timestampsEvaluatedCount: 0,
        candidateEventsCount: 0,
        verifiedEventsCount: 0,
        supportingPlanets: [],
        keyTransitEvents: [],
        summary: {
          hi: 'अमान्य समय-सीमा के कारण भविष्य गोचर गणना निष्पादित नहीं की जा सकी।',
          en: 'Future transit calculation could not be executed due to an invalid time interval.'
        },
        ephemerisSource: 'Swiss Ephemeris',
        evidenceLedger: createTransitEvidenceLedger({
          windowId: window.id || `${window.mahadashaLord}-${window.antardashaLord}`,
          category: 'event_timing',
          mahadashaLord: window.mahadashaLord,
          antardashaLord: window.antardashaLord,
          windowStart: scanStart,
          windowEnd: scanEnd,
          totalEvaluatedCount: 0,
          verifiedEvidence: [],
          rejectedEvidence: [],
          status: 'CALCULATION_ERROR'
        })
      };
    }

    const latitude = options.latitude ?? masterData?.birthProfile?.latitude ?? 22.7196;
    const longitude = options.longitude ?? masterData?.birthProfile?.longitude ?? 75.8577;
    const timezone = options.timezone || masterData?.birthProfile?.timezone || 'Asia/Kolkata';
    const ayanamsa = options.ayanamsa || (masterData?.ayanamsa as any) || 'Lahiri';
    const nativeLagnaRashi = masterData?.lagna?.rashi || 1;

    // 1. Try In-Process Swiss Ephemeris First
    try {
      const swe = await getSwissEph();
      if (swe) {
        return this.executeInProcessScan(
          swe,
          window,
          masterData,
          kpResult,
          targetHouses,
          adverseHouses,
          primaryCuspSubLord,
          {
            startMs,
            endMs,
            latitude,
            longitude,
            timezone,
            ayanamsa,
            nativeLagnaRashi
          }
        );
      }
    } catch (sweErr) {
      console.warn('Direct Sweph future scan failed, falling back to API:', sweErr);
    }

    // 2. Fallback to /api/future-transit Endpoint (Browser Web Environment)
    if (typeof fetch !== 'undefined') {
      try {
        const baseUrl = typeof window !== 'undefined' ? '' : 'http://localhost:3000';
        const res = await fetch(`${baseUrl}/api/future-transit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startDate: scanStart,
            endDate: scanEnd,
            mahadashaLord: window.mahadashaLord,
            antardashaLord: window.antardashaLord,
            latitude,
            longitude,
            timezone,
            ayanamsa,
            targetHouses,
            adverseHouses,
            primaryCuspSubLord,
            nativeLagnaRashi
          })
        });

        if (res.ok) {
          const apiData = await res.json();
          if (apiData && apiData.status) {
            return apiData as FutureTransitCorroboration;
          }
        }
      } catch (apiErr) {
        console.warn('API future-transit fetch exception:', apiErr);
      }
    }

    // 3. Truthful NOT_AVAILABLE Return
    return {
      status: 'NOT_AVAILABLE',
      isCorroborated: false,
      scanStart,
      scanEnd,
      timestampsEvaluatedCount: 0,
      candidateEventsCount: 0,
      verifiedEventsCount: 0,
      supportingPlanets: [],
      keyTransitEvents: [],
      summary: {
        hi: 'वास्तविक भविष्य गोचर गणना उपलब्ध नहीं है, इसलिए इस समय-खिड़की के लिए गोचर समर्थन की पुष्टि नहीं की जा सकती।',
        en: 'Real future transit calculation is unavailable, so transit corroboration cannot be confirmed for this window.'
      },
      ephemerisSource: 'Swiss Ephemeris',
      evidenceLedger: createTransitEvidenceLedger({
        windowId: window.id || `${window.mahadashaLord}-${window.antardashaLord}`,
        category: 'event_timing',
        mahadashaLord: window.mahadashaLord,
        antardashaLord: window.antardashaLord,
        windowStart: scanStart,
        windowEnd: scanEnd,
        totalEvaluatedCount: 0,
        verifiedEvidence: [],
        rejectedEvidence: [],
        status: 'UNAVAILABLE'
      })
    };
  }

  /**
   * Deterministic high-resolution interval scanning with binary subdivision refinement.
   */
  public executeInProcessScan(
    swe: any,
    window: { startDate: string; endDate: string; mahadashaLord: string; antardashaLord: string },
    _masterData: MasterKundliData | null | undefined,
    kpResult: KPAnalysisResult,
    targetHouses: number[],
    adverseHouses: number[],
    primaryCuspSubLord: string,
    params: {
      startMs: number;
      endMs: number;
      latitude: number;
      longitude: number;
      timezone: string;
      ayanamsa: string;
      nativeLagnaRashi: number;
    }
  ): FutureTransitCorroboration {
    const { startMs, endMs, timezone, ayanamsa, nativeLagnaRashi } = params;
    const scanStart = window.startDate;
    const scanEnd = window.endDate;

    // Set Ayanamsa once
    const isRaman = ayanamsa === 'Raman';
    swe.setSiderealMode(isRaman ? Ayanamsa.Raman : Ayanamsa.Lahiri);

    let totalTimestampsEvaluated = 0;
    let candidateCount = 0;
    const verifiedEvents: FutureTransitEvent[] = [];
    const verifiedRecords: TransitEvidenceRecord[] = [];
    const rejectedRecords: TransitEvidenceRecord[] = [];
    const supportingPlanetsSet = new Set<string>();

    const planetNames = ['Moon', 'Sun', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];

    // Session calc cache for identical timestamps (jd + planetName)
    const calcCache = new Map<string, SinglePlanetState>();

    const getStateAt = (pName: string, dtMs: number): SinglePlanetState => {
      const cacheKey = `${pName}-${dtMs}`;
      const cached = calcCache.get(cacheKey);
      if (cached) return cached;

      totalTimestampsEvaluated++;
      const st = this.calculateSinglePlanet(swe, pName, dtMs, timezone, nativeLagnaRashi);
      calcCache.set(cacheKey, st);
      return st;
    };

    // Scan each planet at its dedicated baseline resolution
    for (const pName of planetNames) {
      const intervalHours = PLANET_INTERVAL_HOURS[pName] || 24;
      const stepMs = intervalHours * 3600 * 1000;
      const targetPrecisionMs = pName === 'Moon' ? 30 * 60 * 1000 : 60 * 60 * 1000; // <=30m for Moon, <=60m for others

      let tCurr = startMs;
      let prevState = getStateAt(pName, tCurr);

      // Evaluate initial state at start boundary
      this.evaluateStateAndRecord(
        prevState,
        prevState.timestampMs,
        'PERIOD_SAMPLE',
        '≤60 min',
        window,
        kpResult,
        targetHouses,
        adverseHouses,
        primaryCuspSubLord,
        supportingPlanetsSet,
        verifiedEvents,
        verifiedRecords,
        rejectedRecords,
        ayanamsa,
        () => candidateCount++
      );

      while (tCurr < endMs) {
        const tNext = Math.min(tCurr + stepMs, endMs);
        const nextState = getStateAt(pName, tNext);

        // Boundary detection between tCurr and tNext
        const boundaryDetection = this.detectBoundary(prevState, nextState);
        if (boundaryDetection.hasBoundary) {
          // Perform Deterministic Binary Subdivision
          const refined = this.refineBoundary(
            swe,
            pName,
            tCurr,
            tNext,
            prevState,
            nextState,
            boundaryDetection.boundaryType,
            targetPrecisionMs,
            timezone,
            nativeLagnaRashi,
            getStateAt
          );

          this.evaluateStateAndRecord(
            refined.refinedState,
            tCurr,
            refined.boundaryType,
            refined.precisionStr,
            window,
            kpResult,
            targetHouses,
            adverseHouses,
            primaryCuspSubLord,
            supportingPlanetsSet,
            verifiedEvents,
            verifiedRecords,
            rejectedRecords,
            ayanamsa,
            () => candidateCount++
          );
        }

        tCurr = tNext;
        prevState = nextState;
      }

      // Evaluate state at end boundary
      this.evaluateStateAndRecord(
        prevState,
        prevState.timestampMs,
        'PERIOD_SAMPLE',
        '≤60 min',
        window,
        kpResult,
        targetHouses,
        adverseHouses,
        primaryCuspSubLord,
        supportingPlanetsSet,
        verifiedEvents,
        verifiedRecords,
        rejectedRecords,
        ayanamsa,
        () => candidateCount++
      );
    }

    // Determine Final Status
    const isCorroborated = supportingPlanetsSet.size > 0 && verifiedEvents.length >= 2;
    const finalStatus: FutureTransitStatus = isCorroborated
      ? 'SCANNED_CORROBORATED'
      : 'SCANNED_NO_CORROBORATION';

    const supportingList = Array.from(supportingPlanetsSet);
    const suppHindi = supportingList.map(p => PLANET_NAMES_HI[p] || p).join(', ');
    const suppEng = supportingList.join(', ');

    const summary = isCorroborated
      ? {
          hi: `स्विस एफिमेरिस द्वारा उच्च-सटीक स्कैन (चंद्रमा ≤30 मिनट, अन्य ग्रह ≤60 मिनट) में ${suppHindi} का संरेखण अनुकूल भावों [${targetHouses.join(', ')}] के साथ सत्यापित हुआ है।`,
          en: `Deterministic Swiss Ephemeris high-resolution scan (Moon ≤30 min, other planets ≤60 min) confirms qualifying transit alignment for ${suppEng} with target houses [${targetHouses.join(', ')}].`
        }
      : {
          hi: `समय-खिड़की (${this.formatIsoDate(scanStart, 'hi')} से ${this.formatIsoDate(scanEnd, 'hi')}) के उच्च-सटीक गोचर स्कैन में कोई निर्णायक सकारात्मक संरेखण प्राप्त नहीं हुआ।`,
          en: `Deterministic Swiss Ephemeris high-resolution scan of window (${this.formatIsoDate(scanStart, 'en')} to ${this.formatIsoDate(scanEnd, 'en')}) found no qualifying corroboration.`
        };

    const sampledEvents = this.selectRepresentativeEvents(verifiedEvents);

    const evidenceLedger = createTransitEvidenceLedger({
      windowId: `${window.mahadashaLord}-${window.antardashaLord}`,
      category: 'event_timing',
      mahadashaLord: window.mahadashaLord,
      antardashaLord: window.antardashaLord,
      windowStart: scanStart,
      windowEnd: scanEnd,
      totalEvaluatedCount: totalTimestampsEvaluated,
      verifiedEvidence: verifiedRecords,
      rejectedEvidence: rejectedRecords.slice(0, 100),
      status: isCorroborated ? 'VERIFIED' : 'REJECTED'
    });

    return {
      status: finalStatus,
      isCorroborated,
      scanStart,
      scanEnd,
      timestampsEvaluatedCount: totalTimestampsEvaluated,
      candidateEventsCount: candidateCount,
      verifiedEventsCount: verifiedEvents.length,
      supportingPlanets: supportingList,
      keyTransitEvents: sampledEvents,
      summary,
      ephemerisSource: 'Swiss Ephemeris',
      evidenceLedger
    };
  }

  /**
   * Calculates the exact astronomical state of a single planet at a given timestamp.
   */
  public calculateSinglePlanet(
    swe: any,
    planetName: string,
    timestampMs: number,
    timezone: string,
    nativeLagnaRashi: number
  ): SinglePlanetState {
    const dt = new Date(timestampMs);
    const jd = this.dateToJulianDay(swe, dt, timezone);
    const ayanamsaVal = swe.ayanamsa(jd);

    let sidLong = 0;
    let isRet = false;

    if (planetName === 'Ketu') {
      const resRahu = swe.calc(jd, BODIES['Rahu'], Flag.Speed);
      const sidRahu = ((resRahu.longitude - ayanamsaVal) % 360 + 360) % 360;
      sidLong = (sidRahu + 180) % 360;
      isRet = resRahu.longitudeSpeed < 0;
    } else {
      const body = BODIES[planetName];
      if (body != null) {
        const res = swe.calc(jd, body, Flag.Speed);
        sidLong = ((res.longitude - ayanamsaVal) % 360 + 360) % 360;
        isRet = res.longitudeSpeed < 0;
      }
    }

    const normLong = ((sidLong % 360) + 360) % 360;
    const rashiIdx = Math.floor(normLong / 30);
    const degInSign = normLong % 30;
    const nakNumber = Math.floor(normLong / (360 / 27)) + 1;
    const pada = Math.floor((normLong % (360 / 27)) / (360 / 108)) + 1;
    const nakIdx = nakNumber - 1;
    const nakName = NAKSHATRA_NAMES[nakIdx] || 'Unknown';
    const nakLord = NAK_LORDS[nakIdx % 9] || 'Unknown';
    const transitHouse = ((rashiIdx + 1 - nativeLagnaRashi + 12) % 12) + 1;

    return {
      planet: planetName,
      timestampMs,
      siderealLongitude: Number(normLong.toFixed(4)),
      rashiIdx,
      degInSign: Number(degInSign.toFixed(2)),
      nakNumber,
      nakName,
      nakLord,
      pada,
      isRetrograde: isRet,
      transitHouse,
      motionStatus: isRet ? 'Retrograde' : 'Direct'
    };
  }

  /**
   * Detects whether an event boundary occurred between two adjacent states.
   */
  public detectBoundary(
    state1: SinglePlanetState,
    state2: SinglePlanetState
  ): { hasBoundary: boolean; boundaryType: FutureTransitBoundaryType } {
    if (state1.isRetrograde !== state2.isRetrograde) {
      return {
        hasBoundary: true,
        boundaryType: state2.isRetrograde ? 'RETROGRADE_TRANSITION' : 'DIRECT_TRANSITION'
      };
    }
    if (state1.rashiIdx !== state2.rashiIdx) {
      return { hasBoundary: true, boundaryType: 'SIGN_INGRESS' };
    }
    if (state1.nakNumber !== state2.nakNumber) {
      return { hasBoundary: true, boundaryType: 'NAKSHATRA_INGRESS' };
    }
    if (state1.pada !== state2.pada) {
      return { hasBoundary: true, boundaryType: 'PADA_TRANSITION' };
    }
    if (state1.transitHouse !== state2.transitHouse) {
      return { hasBoundary: true, boundaryType: 'HOUSE_TRANSITION' };
    }

    return { hasBoundary: false, boundaryType: 'PERIOD_SAMPLE' };
  }

  /**
   * Deterministic Binary Subdivision to pinpoint event boundary timestamp to target precision.
   */
  public refineBoundary(
    swe: any,
    planetName: string,
    tLowMs: number,
    tHighMs: number,
    stateLow: SinglePlanetState,
    _stateHigh: SinglePlanetState,
    boundaryType: FutureTransitBoundaryType,
    targetPrecisionMs: number,
    _timezone: string,
    _nativeLagnaRashi: number,
    getStateAt: (pName: string, ms: number) => SinglePlanetState
  ): {
    refinedState: SinglePlanetState;
    boundaryType: FutureTransitBoundaryType;
    precisionStr: string;
    iterations: number;
  } {
    let low = tLowMs;
    let high = tHighMs;
    let iter = 0;
    const maxIter = 10;

    while (high - low > targetPrecisionMs && iter < maxIter) {
      iter++;
      const mid = Math.round((low + high) / 2);
      const stateMid = getStateAt(planetName, mid);

      let transitionInFirstHalf = false;

      switch (boundaryType) {
        case 'RETROGRADE_TRANSITION':
        case 'DIRECT_TRANSITION':
          transitionInFirstHalf = stateMid.isRetrograde !== stateLow.isRetrograde;
          break;
        case 'SIGN_INGRESS':
          transitionInFirstHalf = stateMid.rashiIdx !== stateLow.rashiIdx;
          break;
        case 'NAKSHATRA_INGRESS':
          transitionInFirstHalf = stateMid.nakNumber !== stateLow.nakNumber;
          break;
        case 'PADA_TRANSITION':
          transitionInFirstHalf = stateMid.pada !== stateLow.pada;
          break;
        case 'HOUSE_TRANSITION':
          transitionInFirstHalf = stateMid.transitHouse !== stateLow.transitHouse;
          break;
        default:
          transitionInFirstHalf = stateMid.nakNumber !== stateLow.nakNumber || stateMid.rashiIdx !== stateLow.rashiIdx;
      }

      if (transitionInFirstHalf) {
        high = mid;
      } else {
        low = mid;
      }
    }

    const refinedState = getStateAt(planetName, high);
    const actualDiffMinutes = (high - low) / (60 * 1000);
    const precisionStr =
      actualDiffMinutes <= 30
        ? '≤30 min'
        : actualDiffMinutes <= 60
        ? '≤60 min'
        : 'EVENT_TIME_UNRESOLVED';

    return {
      refinedState,
      boundaryType,
      precisionStr,
      iterations: iter
    };
  }

  /**
   * Helper to evaluate KP significations for a state and record qualifying verified events.
   */
  private evaluateStateAndRecord(
    state: SinglePlanetState,
    scanTimestampMs: number,
    boundaryType: FutureTransitBoundaryType,
    precisionStr: string,
    window: { id?: string; mahadashaLord: string; antardashaLord: string; startDate?: string; endDate?: string },
    kpResult: KPAnalysisResult,
    targetHouses: number[],
    adverseHouses: number[],
    primaryCuspSubLord: string,
    supportingPlanetsSet: Set<string>,
    verifiedEvents: FutureTransitEvent[],
    verifiedRecords: TransitEvidenceRecord[],
    rejectedRecords: TransitEvidenceRecord[],
    ayanamsa: string,
    onCandidateFound: () => void
  ) {
    const starLord = state.nakLord;
    const starLordSig = kpResult.significators?.byPlanet?.[starLord]?.allSignifiedHouses || [];
    const selfSig = kpResult.significators?.byPlanet?.[state.planet]?.allSignifiedHouses || [];

    const targetMatches = Array.from(new Set([
      ...(targetHouses.includes(state.transitHouse) ? [state.transitHouse] : []),
      ...starLordSig.filter(h => targetHouses.includes(h)),
      ...selfSig.filter(h => targetHouses.includes(h))
    ])).sort((a, b) => a - b);

    const adverseMatches = Array.from(new Set([
      ...(adverseHouses.includes(state.transitHouse) ? [state.transitHouse] : []),
      ...starLordSig.filter(h => adverseHouses.includes(h))
    ])).sort((a, b) => a - b);

    const isDashaLordRelated = state.planet === window.mahadashaLord || starLord === window.mahadashaLord;
    const isAntardashaLordRelated = state.planet === window.antardashaLord || starLord === window.antardashaLord;
    const isCuspSubLordRelated = state.planet === primaryCuspSubLord || starLord === primaryCuspSubLord;

    const isKeyPlanet =
      state.planet === window.antardashaLord ||
      state.planet === window.mahadashaLord ||
      state.planet === 'Sun' ||
      state.planet === 'Jupiter' ||
      state.planet === 'Moon' ||
      state.planet === primaryCuspSubLord;

    const isCandidate = targetMatches.length > 0 || isKeyPlanet;
    if (isCandidate) {
      onCandidateFound();
    }

    const isRel = isKeyPlanet || isAntardashaLordRelated || isDashaLordRelated || isCuspSubLordRelated;
    const isQualifying =
      targetMatches.length > 0 &&
      adverseMatches.length === 0 &&
      isRel;

    const refinedIso = new Date(state.timestampMs).toISOString();
    const scanIso = new Date(scanTimestampMs).toISOString();
    const precision: TransitPrecision =
      precisionStr === '≤30 min' ? '≤30 min' : precisionStr === '≤60 min' ? '≤60 min' : 'Exact';

    const relationshipDesc = this.buildRelationshipDescription(
      state.planet,
      state,
      window.mahadashaLord,
      window.antardashaLord,
      primaryCuspSubLord,
      targetMatches,
      boundaryType
    );

    if (isQualifying) {
      supportingPlanetsSet.add(state.planet);

      verifiedEvents.push({
        planet: state.planet,
        hindiName: PLANET_NAMES_HI[state.planet] || state.planet,
        timestamp: refinedIso,
        scanTimestamp: scanIso,
        boundaryTimestamp: refinedIso,
        precisionMinutes: precisionStr,
        boundaryType,
        exactLongitude: state.siderealLongitude,
        sign: RASHI_NAMES[state.rashiIdx],
        hindiSign: RASHI_NAMES_HI[state.rashiIdx],
        degree: state.degInSign,
        nakshatra: state.nakNumber,
        nakshatraName: state.nakName,
        nakshatraLord: state.nakLord,
        pada: state.pada,
        motionStatus: state.motionStatus,
        isRetrograde: state.isRetrograde,
        transitHouseFromLagna: state.transitHouse,
        kpRelationship: relationshipDesc,
        targetHousesSignified: targetMatches,
        adverseHousesSignified: adverseMatches,
        isDashaLordRelated,
        isAntardashaLordRelated,
        isCuspSubLordRelated,
        isQualifying: true
      });

      const rec = createTransitEvidenceRecord({
        category: 'event_timing',
        windowId: window.id || `${window.mahadashaLord}-${window.antardashaLord}`,
        mahadashaLord: window.mahadashaLord,
        antardashaLord: window.antardashaLord,
        windowStart: window.startDate || '',
        windowEnd: window.endDate || '',
        classification: 'FUTURE_TRANSIT',
        transitPlanet: state.planet,
        hindiName: PLANET_NAMES_HI[state.planet] || state.planet,
        evaluationTimestamp: scanIso,
        boundaryTimestamp: refinedIso,
        eventType: boundaryType,
        exactLongitude: state.siderealLongitude,
        sign: RASHI_NAMES[state.rashiIdx],
        hindiSign: RASHI_NAMES_HI[state.rashiIdx],
        degreeInSign: state.degInSign,
        nakshatra: state.nakNumber,
        nakshatraName: state.nakName,
        pada: state.pada,
        nakshatraLord: state.nakLord,
        motion: state.motionStatus,
        transitHouse: state.transitHouse,
        ayanamsaMode: ayanamsa,
        targetHouses,
        adverseHouses,
        natalSignificatorRelationship: relationshipDesc,
        dashaLordRelationship: isDashaLordRelated ? `Connected to Mahadasha Lord ${window.mahadashaLord}` : 'None',
        antardashaLordRelationship: isAntardashaLordRelated ? `Connected to Antardasha Lord ${window.antardashaLord}` : 'None',
        cuspSubLordRelationship: isCuspSubLordRelated ? `Connected to Cusp Sub-Lord ${primaryCuspSubLord}` : 'None',
        targetHouseMatch: targetMatches,
        adverseHouseMatch: adverseMatches,
        kpRuleId: 'KP-RULE-FUTURE-TRANSIT-QUALIFIED',
        result: 'QUALIFIED',
        precision,
        status: 'VERIFIED'
      });
      verifiedRecords.push(rec);
    } else if (isCandidate && rejectedRecords.length < 100) {
      let rejectionReason: TransitRejectionReason = 'TARGET_HOUSE_NOT_MATCHED';
      if (adverseMatches.length > 0) {
        rejectionReason = 'ADVERSE_HOUSE_MATCH';
      } else if (!isRel) {
        rejectionReason = 'NO_KP_RELATIONSHIP';
      }

      const rec = createTransitEvidenceRecord({
        category: 'event_timing',
        windowId: window.id || `${window.mahadashaLord}-${window.antardashaLord}`,
        mahadashaLord: window.mahadashaLord,
        antardashaLord: window.antardashaLord,
        windowStart: window.startDate || '',
        windowEnd: window.endDate || '',
        classification: 'FUTURE_TRANSIT',
        transitPlanet: state.planet,
        hindiName: PLANET_NAMES_HI[state.planet] || state.planet,
        evaluationTimestamp: scanIso,
        boundaryTimestamp: refinedIso,
        eventType: boundaryType,
        exactLongitude: state.siderealLongitude,
        sign: RASHI_NAMES[state.rashiIdx],
        hindiSign: RASHI_NAMES_HI[state.rashiIdx],
        degreeInSign: state.degInSign,
        nakshatra: state.nakNumber,
        nakshatraName: state.nakName,
        pada: state.pada,
        nakshatraLord: state.nakLord,
        motion: state.motionStatus,
        transitHouse: state.transitHouse,
        ayanamsaMode: ayanamsa,
        targetHouses,
        adverseHouses,
        natalSignificatorRelationship: relationshipDesc,
        dashaLordRelationship: isDashaLordRelated ? `Connected to Mahadasha Lord ${window.mahadashaLord}` : 'None',
        antardashaLordRelationship: isAntardashaLordRelated ? `Connected to Antardasha Lord ${window.antardashaLord}` : 'None',
        cuspSubLordRelationship: isCuspSubLordRelated ? `Connected to Cusp Sub-Lord ${primaryCuspSubLord}` : 'None',
        targetHouseMatch: targetMatches,
        adverseHouseMatch: adverseMatches,
        kpRuleId: 'KP-RULE-FUTURE-TRANSIT-REJECTED',
        result: 'REJECTED',
        rejectionReason,
        precision,
        status: 'REJECTED',
        lineageExplanation: {
          hi: `${state.planet} गोचर अस्वीकृत: ${rejectionReason === 'ADVERSE_HOUSE_MATCH' ? `प्रतिकूल भाव [${adverseMatches.join(', ')}] सक्रिय` : rejectionReason}`,
          en: `${state.planet} transit rejected: ${rejectionReason === 'ADVERSE_HOUSE_MATCH' ? `Adverse house(s) [${adverseMatches.join(', ')}] active` : rejectionReason}`
        }
      });
      rejectedRecords.push(rec);
    }
  }

  /**
   * Helper to format Julian Day from Date and Timezone.
   */
  private dateToJulianDay(swe: any, dt: Date, _timezone: string): number {
    const year = dt.getUTCFullYear();
    const month = dt.getUTCMonth() + 1;
    const day = dt.getUTCDate();
    const hourUT = dt.getUTCHours() + dt.getUTCMinutes() / 60 + dt.getUTCSeconds() / 3600;
    return swe.julianDay(year, month, day, hourUT, Calendar.Gregorian);
  }

  /**
   * Builds clear deterministic explanation of KP relationship.
   */
  private buildRelationshipDescription(
    planet: string,
    pData: SinglePlanetState,
    mahaLord: string,
    antarLord: string,
    cuspSubLord: string,
    targetHouses: number[],
    boundaryType: FutureTransitBoundaryType
  ): string {
    const parts: string[] = [];

    if (boundaryType === 'NAKSHATRA_INGRESS') {
      parts.push(`नक्षत्र प्रवेश (${pData.nakName})`);
    } else if (boundaryType === 'SIGN_INGRESS') {
      parts.push(`राशि प्रवेश (${RASHI_NAMES_HI[pData.rashiIdx]})`);
    } else if (boundaryType === 'PADA_TRANSITION') {
      parts.push(`पाद परिवर्तन (${pData.nakName} पाद ${pData.pada})`);
    } else if (boundaryType === 'RETROGRADE_TRANSITION') {
      parts.push(`वक्र गति प्रारंभ`);
    } else if (boundaryType === 'DIRECT_TRANSITION') {
      parts.push(`मार्गी गति प्रारंभ`);
    }

    if (planet === antarLord) {
      parts.push(`अंतर्दशा-नाथ (${planet}) भाव ${pData.transitHouse} में गोचर`);
    } else if (planet === mahaLord) {
      parts.push(`महादशा-नाथ (${planet}) भाव ${pData.transitHouse} में गोचर`);
    } else if (planet === cuspSubLord) {
      parts.push(`कस्प उप-स्वामी (${planet}) सक्रिय`);
    }

    if (pData.nakLord === antarLord) {
      parts.push(`अंतर्दशा-नाथ के नक्षत्र (${pData.nakName}) में संचार`);
    } else if (pData.nakLord === mahaLord) {
      parts.push(`महादशा-नाथ के नक्षत्र (${pData.nakName}) में संचार`);
    }

    parts.push(`संबद्ध भाव: [${targetHouses.join(', ')}]`);
    return parts.join(' | ');
  }

  /**
   * Selects clean, non-redundant representative events across the window.
   */
  private selectRepresentativeEvents(events: FutureTransitEvent[]): FutureTransitEvent[] {
    if (events.length <= 25) return events;

    const selected: FutureTransitEvent[] = [];
    const seen = new Set<string>();

    for (const ev of events) {
      const key = `${ev.planet}-${ev.sign}-${ev.nakshatra}-${ev.boundaryType}`;
      if (!seen.has(key)) {
        seen.add(key);
        selected.push(ev);
        if (selected.length >= 25) break;
      }
    }

    return selected.length > 0 ? selected : events.slice(0, 25);
  }

  /**
   * Localized date formatter.
   */
  private formatIsoDate(isoStr: string, lang: 'hi' | 'en'): string {
    try {
      const d = new Date(isoStr);
      if (isNaN(d.getTime())) return isoStr.slice(0, 10);
      const day = d.getDate();
      const monthNames = lang === 'hi'
        ? ['जनवरी', 'फ़रवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर']
        : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${day} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return isoStr.slice(0, 10);
    }
  }
}
