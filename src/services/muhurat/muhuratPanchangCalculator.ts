/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * JEEVANDARPAN — MUHURAT PANCHANG & SOLAR TIMES CALCULATOR
 */

export interface SolarTimesResult {
  sunrise: string;
  sunset: string;
  sunriseMinutes: number;
  sunsetMinutes: number;
  dinmaanMinutes: number;
  ratrimanMinutes: number;
}

export class MuhuratPanchangCalculator {
  /**
   * Deterministically calculates local sunrise, sunset, Dinmaan, and Ratriman
   * based on date and geographical coordinates.
   */
  public static calculateSolarTimes(
    dateStr: string,
    latitude: number = 22.7196,
    longitude: number = 75.8577,
    timezone: string = 'Asia/Kolkata'
  ): SolarTimesResult {
    // Standard approximate astronomical solar calculation
    const d = new Date(dateStr);
    const dayOfYear = Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    
    // Declination approximation in radians
    const declination = 0.4095 * Math.sin(0.0172 * (dayOfYear - 79));
    const latRad = (latitude * Math.PI) / 180;
    
    // Hour angle at sunrise/sunset
    const cosHourAngle = -Math.tan(latRad) * Math.tan(declination);
    const clampedCos = Math.max(-1, Math.min(1, cosHourAngle));
    const hourAngle = Math.acos(clampedCos);
    
    // Half day in hours
    const halfDayHours = (hourAngle * 12) / Math.PI;
    
    // Solar noon roughly around 12:15 local standard time for Indian Standard Meridian
    const solarNoonHour = 12.25;
    const sunriseHour = Math.max(5, solarNoonHour - halfDayHours);
    const sunsetHour = Math.min(19.5, solarNoonHour + halfDayHours);

    const srH = Math.floor(sunriseHour);
    const srM = Math.floor((sunriseHour - srH) * 60);
    const ssH = Math.floor(sunsetHour);
    const ssM = Math.floor((sunsetHour - ssH) * 60);

    const sunriseStr = `${String(srH).padStart(2, '0')}:${String(srM).padStart(2, '0')}`;
    const sunsetStr = `${String(ssH).padStart(2, '0')}:${String(ssM).padStart(2, '0')}`;

    const sunriseMinutes = srH * 60 + srM;
    const sunsetMinutes = ssH * 60 + ssM;
    const dinmaanMinutes = Math.max(600, sunsetMinutes - sunriseMinutes);
    const ratrimanMinutes = 1440 - dinmaanMinutes;

    return {
      sunrise: sunriseStr,
      sunset: sunsetStr,
      sunriseMinutes,
      sunsetMinutes,
      dinmaanMinutes,
      ratrimanMinutes
    };
  }
}
