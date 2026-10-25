/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterKundliData } from '../../types/kundli';

export interface SphutaData {
  name: string;
  hindiName: string;
  definition: string;
  longitude: number;
  rashi: number;
  degree: number;
  minutes: number;
  seconds: number;
  formatted: string;
}

export interface SphutasResult {
  sphutas: SphutaData[];
  yogi: {
    planet: string;
    nakshatra: string;
    isYogi: boolean;
  };
  avayogi: {
    planet: string;
    nakshatra: string;
    isAvayogi: boolean;
  };
}

export class SphutasEngine {
  static calculate(data: MasterKundliData): SphutasResult {
    const lagna = data.lagna.siderealLongitude;
    const moon = data.planets['Moon']?.siderealLongitude || 0;
    const sun = data.planets['Sun']?.siderealLongitude || 0;
    const rahu = data.planets['Rahu']?.siderealLongitude || 0;
    const venus = data.planets['Venus']?.siderealLongitude || 0;
    const jupiter = data.planets['Jupiter']?.siderealLongitude || 0;
    const mars = data.planets['Mars']?.siderealLongitude || 0;
    
    // Gulika calculation (Simplified fallback if not provided)
    // In JH, Gulika is the start of the Saturn's segment in the 8-part division of day/night.
    const gulika = data.planets['Gulika']?.siderealLongitude || this.calculateGulikaFallback(data);

    const sphutas: SphutaData[] = [];

    // 1. Tri Sphuta
    const triSphuta = this.normalize(lagna + moon + gulika);
    sphutas.push(this.createSphuta('Tri Sphuta', 'त्रि स्फुट', 'Moon + Lagna + Gulika', triSphuta));

    // 2. Chatur Sphuta
    const chaturSphuta = this.normalize(sun + triSphuta);
    sphutas.push(this.createSphuta('Chatur Sphuta', 'चतुः स्फुट', 'Sun + Tri Sphuta', chaturSphuta));

    // 3. Pancha Sphuta
    const panchaSphuta = this.normalize(rahu + chaturSphuta);
    sphutas.push(this.createSphuta('Pancha Sphuta', 'पञ्च स्फुट', 'Rahu + Chatur Sphuta', panchaSphuta));

    // 4. Prana Sphuta
    const pranaSphuta = this.normalize((lagna * 5) + gulika);
    sphutas.push(this.createSphuta('Prana Sphuta', 'प्राण स्फुट', '(Lagna × 5) + Gulika', pranaSphuta));

    // 5. Deha Sphuta
    const dehaSphuta = this.normalize((moon * 8) + gulika);
    sphutas.push(this.createSphuta('Deha Sphuta', 'देह स्फुट', '(Moon × 8) + Gulika', dehaSphuta));

    // 6. Mrityu Sphuta
    const mrityuSphuta = this.normalize((gulika * 7) + sun);
    sphutas.push(this.createSphuta('Mrityu Sphuta', 'मृत्यु स्फुट', '(Gulika × 7) + Sun', mrityuSphuta));

    // 7. Sookshma Tri Sphuta
    const sookshmaTri = this.normalize(triSphuta + lagna);
    sphutas.push(this.createSphuta('Sookshma Tri Sphuta', 'सूक्ष्म त्रि स्फुट', 'Tri Sphuta + Lagna', sookshmaTri));

    // 8. Beeja Sphuta
    const beejaSphuta = this.normalize(sun + venus + jupiter);
    sphutas.push(this.createSphuta('Beeja Sphuta', 'बीज स्फुट', 'Sun + Venus + Jupiter (Male Progeny)', beejaSphuta));

    // 9. Kshetra Sphuta
    const kshetraSphuta = this.normalize(jupiter + moon + mars);
    sphutas.push(this.createSphuta('Kshetra Sphuta', 'क्षेत्र स्फुट', 'Jupiter + Moon + Mars (Female Progeny)', kshetraSphuta));

    // 10. Tithi Sphuta
    const tithiSphuta = this.normalize(moon - sun + lagna);
    sphutas.push(this.createSphuta('Tithi Sphuta', 'तिथि स्फुट', 'Moon - Sun + Lagna', tithiSphuta));

    // 11. Yoga Sphuta
    const yogaSphuta = this.normalize(moon + sun + lagna);
    sphutas.push(this.createSphuta('Yoga Sphuta', 'योग स्फुट', 'Moon + Sun + Lagna', yogaSphuta));

    // 12. Rahu Tithi Sphuta
    const rahuTithiSphuta = this.normalize(moon - rahu + lagna);
    sphutas.push(this.createSphuta('Rahu Tithi Sphuta', 'राहु तिथि स्फुट', 'Moon - Rahu + Lagna', rahuTithiSphuta));

    // 13. Yogi Sphuta
    const yogiSphuta = this.normalize(sun + moon + 93.333333); // 93° 20'
    sphutas.push(this.createSphuta('Yogi Sphuta', 'योगी स्फुट', 'Sun + Moon + 93° 20\'', yogiSphuta));

    // 14. Avayogi Sphuta
    const avayogiSphuta = this.normalize(yogiSphuta + 186.666666); // 186° 40'
    sphutas.push(this.createSphuta('Avayogi Sphuta', 'अवयोगी स्फुट', 'Yogi Sphuta + 186° 40\'', avayogiSphuta));

    // Yogi/Avayogi Analysis
    const yogiNak = Math.floor(yogiSphuta / (360 / 27));
    const avayogiNak = Math.floor(avayogiSphuta / (360 / 27));
    
    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
    const yogiPlanet = this.getNakshatraLord(yogiNak);
    const avayogiPlanet = this.getNakshatraLord(avayogiNak);

    return {
      sphutas,
      yogi: {
        planet: yogiPlanet,
        nakshatra: this.getNakshatraName(yogiNak),
        isYogi: true
      },
      avayogi: {
        planet: avayogiPlanet,
        nakshatra: this.getNakshatraName(avayogiNak),
        isAvayogi: true
      }
    };
  }

  private static normalize(deg: number): number {
    return ((deg % 360) + 360) % 360;
  }

  private static createSphuta(name: string, hindiName: string, def: string, long: number): SphutaData {
    const rashi = Math.floor(long / 30) + 1;
    const rem = long % 30;
    const deg = Math.floor(rem);
    const minRem = (rem - deg) * 60;
    const min = Math.floor(minRem);
    const sec = Math.round((minRem - min) * 60);

    return {
      name,
      hindiName,
      definition: def,
      longitude: long,
      rashi,
      degree: deg,
      minutes: min,
      seconds: sec,
      formatted: `${rashi}R ${deg}° ${min}' ${sec}"`
    };
  }

  private static calculateGulikaFallback(data: MasterKundliData): number {
    // Simplified: Gulika usually moves around 1.5 to 2 rashis from Lagna depending on birth time
    // We will return a placeholder value derived from Saturn if not available
    return this.normalize((data.planets['Saturn']?.siderealLongitude || 0) + 180);
  }

  private static getNakshatraLord(index: number): string {
    const lords = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
    return lords[index % 9];
  }

  private static getNakshatraName(index: number): string {
    const naks = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
      'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
      'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ];
    return naks[index % 27];
  }
}
