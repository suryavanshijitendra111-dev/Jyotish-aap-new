# Implementation Plan — JeevanDarpan Upagraha Real Ascendant Integration (Option B)

## 1. Objective
Implement real astronomical Ascendant calculations for time-based upagrahas (Gulika, Mandi, Kaala, Mrityu, Yamaghantaka, Ardhaprahara) in `src/services/astrology/upagrahaEngine.ts` using `@kuntay/swisseph` via `getSwissEph()` without time-to-zodiac approximations (`timeDiff × rotation rate`).

## 2. Affected Files & Reasons
1. **`src/services/astrology/upagrahaEngine.ts`**
   - **Reason:** Add `calculateAsync(data: MasterKundliData): Promise<UpagrahaInfo[]>` which uses `getSwissEph()` from `../jyotish/transitEngine`, calculates exact Julian Day (JD) for each upagraha time in the correct IANA timezone, sets Lahiri Ayanamsa, and calls `swe.houses(jd, lat, lon)` to determine the precise astronomical Ascendant. If Ephemeris is unavailable or fails, returns explicit "Calculation Unavailable" for longitude.
   - **Signature changes:** Add `static async calculateAsync(data: MasterKundliData): Promise<UpagrahaInfo[]>` alongside `calculate(data)`.

2. **`src/components/kundli/UpagrahaView.tsx`**
   - **Reason:** Update to load upagrahas asynchronously using React `useEffect` and `useState`, displaying a loading spinner during ephemeris calculation and handling fallback/error states securely.
   - **Affected Callers:** Only `UpagrahaView.tsx` calls `UpagrahaEngine.calculate()`. No other components or modules call `UpagrahaEngine`.

## 3. Detailed Technical Steps
1. **Timezone & Julian Day Calculation for Upagraha Timings:**
   - For a given birth date, location (`lat`, `lon`), and `timezone` (e.g. `Asia/Kolkata`), compute sunrise and sunset using Luxon and solar declination.
   - For each time-based upagraha, compute the exact time (in hours/minutes from midnight).
   - Convert this upagraha datetime into UTC and decimal UT hours, then compute the exact Julian Day using `swe.julianDay(year, month, day, decimalHoursUt, Calendar.Gregorian)` (or fallback date math).
2. **Ayanamsa & Houses Calculation:**
   - Call `swe.setSiderealMode(Ayanamsa.Lahiri)` and `swe.ayanamsa(jd)` to get the exact Lahiri Ayanamsa.
   - Call `swe.houses(jd, lat, lon)` to get the tropical ascendant.
   - Subtract Ayanamsa and normalize to get the true sidereal Ascendant longitude for that upagraha moment.
3. **Fallback & Safety:**
   - If `getSwissEph()` returns null or `swe.houses()` throws an error, return `rashiName: 'Calculation Unavailable'` and explicit description with accurate timing. Never use approximations.

## 4. Loading & Error Handling in UI (`UpagrahaView.tsx`)
- State variables: `[upagrahas, setUpagrahas] = useState<UpagrahaInfo[]>([])`, `[loading, setLoading] = useState(true)`.
- In `useEffect`, invoke `UpagrahaEngine.calculateAsync(data).then(res => { setUpagrahas(res); setLoading(false); }).catch(...)`.
- Render a smooth cosmic loading state (`Loader2`) while calculating.

## 5. Validation & Testing Strategy
- Test cases to verify after implementation:
  - Indore, India — 24 June 1986, 06:20 AM IST
  - New Delhi, India — 15 August 1990, 10:30 AM IST
- Verify that Gulika and Mandi longitudes reflect real Swiss Ephemeris Ascendant at their respective Saturn-part times.

## 6. Rollback Plan
- Revert `upagrahaEngine.ts` and `UpagrahaView.tsx` to their previous state via git if any runtime issues occur.
