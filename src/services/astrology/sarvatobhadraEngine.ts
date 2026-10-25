/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MasterKundliData, PlanetData } from '../../types/kundli';

export interface VedhaImpact {
  planet: string;
  type: 'Benefic' | 'Malefic';
  lineType: 'Front' | 'Left' | 'Right';
  pointName: string; // The grid content that is being hit
}

export interface GridCell {
  row: number;
  col: number;
  content: string;
  type: 'Nakshatra' | 'Swara' | 'Rashi' | 'Tithi' | 'Varna' | 'Corner' | 'Center';
  vedhas: VedhaImpact[];
}

export interface SBCResult {
  grid: GridCell[][];
  specialNakshatraVedhas: {
    name: string;
    nakshatra: string;
    impacts: VedhaImpact[];
  }[];
}

export class SarvatobhadraEngine {
  private static NAKSHATRAS = [
    'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha',
    'Anuradha', 'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Abhijit',
    'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati', 'Ashwini', 'Bharani'
  ];

  static calculate(data: MasterKundliData): SBCResult {
    const grid: GridCell[][] = Array.from({ length: 9 }, (_, r) =>
      Array.from({ length: 9 }, (_, c) => ({
        row: r,
        col: c,
        content: '',
        type: 'Center',
        vedhas: []
      }))
    );

    this.initializeGrid(grid);
    
    // Map planets to grid positions
    const planets = Object.values(data.planets);
    planets.forEach(p => {
      const nakIndex = this.getNakshatraIndex(p);
      const pos = this.findNakshatraPosition(nakIndex, grid);
      if (pos) {
        this.calculateVedhasForPlanet(p, pos.row, pos.col, grid);
      }
    });

    const specialNakshatras = this.getSpecialNakshatras(data);
    const specialVedhas = specialNakshatras.map(sn => {
      const pos = this.findNakshatraPositionByName(sn.nakshatra, grid);
      return {
        name: sn.name,
        nakshatra: sn.nakshatra,
        impacts: pos ? grid[pos.row][pos.col].vedhas : []
      };
    });

    return { grid, specialNakshatraVedhas: specialVedhas };
  }

  private static initializeGrid(grid: GridCell[][]) {
    // 1. Layer 1: Nakshatras & Corners
    // Top Row (0)
    grid[0][0] = { row: 0, col: 0, content: 'Nanda', type: 'Corner', vedhas: [] };
    grid[0][1] = { row: 0, col: 1, content: 'Krittika', type: 'Nakshatra', vedhas: [] };
    grid[0][2] = { row: 0, col: 2, content: 'Rohini', type: 'Nakshatra', vedhas: [] };
    grid[0][3] = { row: 0, col: 3, content: 'Mriga', type: 'Nakshatra', vedhas: [] };
    grid[0][4] = { row: 0, col: 4, content: 'Ardra', type: 'Nakshatra', vedhas: [] };
    grid[0][5] = { row: 0, col: 5, content: 'Punar', type: 'Nakshatra', vedhas: [] };
    grid[0][6] = { row: 0, col: 6, content: 'Pushya', type: 'Nakshatra', vedhas: [] };
    grid[0][7] = { row: 0, col: 7, content: 'Ashle', type: 'Nakshatra', vedhas: [] };
    grid[0][8] = { row: 0, col: 8, content: 'Bhadra', type: 'Corner', vedhas: [] };

    // Right Col (8)
    grid[1][8] = { row: 1, col: 8, content: 'Magha', type: 'Nakshatra', vedhas: [] };
    grid[2][8] = { row: 2, col: 8, content: 'P.Phal', type: 'Nakshatra', vedhas: [] };
    grid[3][8] = { row: 3, col: 8, content: 'U.Phal', type: 'Nakshatra', vedhas: [] };
    grid[4][8] = { row: 4, col: 8, content: 'Hasta', type: 'Nakshatra', vedhas: [] };
    grid[5][8] = { row: 5, col: 8, content: 'Chitra', type: 'Nakshatra', vedhas: [] };
    grid[6][8] = { row: 6, col: 8, content: 'Swati', type: 'Nakshatra', vedhas: [] };
    grid[7][8] = { row: 7, col: 8, content: 'Vishak', type: 'Nakshatra', vedhas: [] };

    // Bottom Row (8)
    grid[8][8] = { row: 8, col: 8, content: 'Jaya', type: 'Corner', vedhas: [] };
    grid[8][7] = { row: 8, col: 7, content: 'Anura', type: 'Nakshatra', vedhas: [] };
    grid[8][6] = { row: 8, col: 6, content: 'Jyesh', type: 'Nakshatra', vedhas: [] };
    grid[8][5] = { row: 8, col: 5, content: 'Mula', type: 'Nakshatra', vedhas: [] };
    grid[8][4] = { row: 8, col: 4, content: 'P.Ash', type: 'Nakshatra', vedhas: [] };
    grid[8][3] = { row: 8, col: 3, content: 'U.Ash', type: 'Nakshatra', vedhas: [] };
    grid[8][2] = { row: 8, col: 2, content: 'Shravan', type: 'Nakshatra', vedhas: [] };
    grid[8][1] = { row: 8, col: 1, content: 'Abhijit', type: 'Nakshatra', vedhas: [] };
    grid[8][0] = { row: 8, col: 0, content: 'Rikta', type: 'Corner', vedhas: [] };

    // Left Col (0)
    grid[7][0] = { row: 7, col: 0, content: 'Dhanis', type: 'Nakshatra', vedhas: [] };
    grid[6][0] = { row: 6, col: 0, content: 'Shata', type: 'Nakshatra', vedhas: [] };
    grid[5][0] = { row: 5, col: 0, content: 'P.Bhad', type: 'Nakshatra', vedhas: [] };
    grid[4][0] = { row: 4, col: 0, content: 'U.Bhad', type: 'Nakshatra', vedhas: [] };
    grid[3][0] = { row: 3, col: 0, content: 'Revati', type: 'Nakshatra', vedhas: [] };
    grid[2][0] = { row: 2, col: 0, content: 'Ashwini', type: 'Nakshatra', vedhas: [] };
    grid[1][0] = { row: 1, col: 0, content: 'Bharani', type: 'Nakshatra', vedhas: [] };

    // 2. Inner Layers: Tithis, Rashis, Swara, Varna
    // (Simplified placeholder mapping for these complex inner grids)
    const rashis = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
    rashis.forEach((r, i) => {
      const row = 3 + Math.floor(i / 4);
      const col = 3 + (i % 4);
      grid[row][col].content = r;
      grid[row][col].type = 'Rashi';
    });

    const vowels = ['A', 'AA', 'I', 'II', 'U', 'UU', 'E', 'AI', 'O', 'AU'];
    vowels.forEach((v, i) => {
      const r = 2;
      const c = 2 + i;
      if (c <= 6) {
         grid[r][c].content = v;
         grid[r][c].type = 'Swara';
      }
    });

    grid[4][4].content = 'Soul';
    grid[4][4].type = 'Center';
  }

  private static getNakshatraIndex(p: PlanetData): number {
    // Assuming standard 27 nakshatras, need to adjust for Abhijit (28)
    // Abhijit is after Uttara Ashadha (21)
    let idx = p.nakshatra - 1; // 0-26
    if (idx >= 20) { // After Uttara Ashadha
       // In SBC logic, Abhijit is inserted
       // This is a simplification.
    }
    // Return Krittika based index (Krittika is 3rd in standard list usually)
    // Let's assume input nakshatra is 1-27 starting from Ashwini
    // SBC starts from Krittika (3)
    const krittikaStart = (p.nakshatra + 24) % 27;
    return krittikaStart;
  }

  private static findNakshatraPosition(nakIdx: number, grid: GridCell[][]) {
    // nakIdx 0-27 mapping to the outer square
    const mapping = [
      {row:0,col:1},{row:0,col:2},{row:0,col:3},{row:0,col:4},{row:0,col:5},{row:0,col:6},{row:0,col:7}, // East
      {row:1,col:8},{row:2,col:8},{row:3,col:8},{row:4,col:8},{row:5,col:8},{row:6,col:8},{row:7,col:8}, // South
      {row:8,col:7},{row:8,col:6},{row:8,col:5},{row:8,col:4},{row:8,col:3},{row:8,col:2},{row:8,col:1}, // West
      {row:7,col:0},{row:6,col:0},{row:5,col:0},{row:4,col:0},{row:3,col:0},{row:2,col:0},{row:1,col:0}  // North
    ];
    return mapping[nakIdx % 28];
  }

  private static findNakshatraPositionByName(name: string, grid: GridCell[][]) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c].content.toLowerCase().includes(name.substring(0,3).toLowerCase())) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  private static calculateVedhasForPlanet(p: PlanetData, row: number, col: number, grid: GridCell[][]) {
    const isMalefic = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'].includes(p.name);
    const impact: VedhaImpact = {
      planet: p.name,
      type: isMalefic ? 'Malefic' : 'Benefic',
      lineType: 'Front',
      pointName: ''
    };

    // 1. Front Vedha (Horizontal/Vertical)
    if (row === 0 || row === 8) { // Top or Bottom -> Vertical Vedha
      for (let r = 0; r < 9; r++) {
        this.addVedha(grid[r][col], { ...impact, lineType: 'Front' });
      }
    } else if (col === 0 || col === 8) { // Left or Right -> Horizontal Vedha
      for (let c = 0; c < 9; c++) {
        this.addVedha(grid[row][c], { ...impact, lineType: 'Front' });
      }
    }

    // 2. Diagonal Vedha (Simplified logic)
    // In SBC, diagonals go across the 9x9 grid
    // Diag 1: Top-Left to Bottom-Right
    // Diag 2: Top-Right to Bottom-Left
    // This is a geometric abstraction of SBC Vedha
    for (let i = -8; i <= 8; i++) {
       const r1 = row + i, c1 = col + i;
       if (r1 >= 0 && r1 < 9 && c1 >= 0 && c1 < 9) {
         this.addVedha(grid[r1][c1], { ...impact, lineType: 'Right' });
       }
       const r2 = row + i, c2 = col - i;
       if (r2 >= 0 && r2 < 9 && c2 >= 0 && c2 < 9) {
         this.addVedha(grid[r2][c2], { ...impact, lineType: 'Left' });
       }
    }
  }

  private static addVedha(cell: GridCell, impact: VedhaImpact) {
    if (!cell.vedhas.find(v => v.planet === impact.planet && v.lineType === impact.lineType)) {
      cell.vedhas.push({ ...impact, pointName: cell.content });
    }
  }

  private static getSpecialNakshatras(data: MasterKundliData) {
    const moonNak = data.planets['Moon']?.nakshatra || 1;
    const nakNames = [
      'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
      'Magha', 'P.Phal', 'U.Phal', 'Hasta', 'Chitra', 'Swati', 'Vishak', 'Anura', 'Jyesh',
      'Mula', 'P.Ash', 'U.Ash', 'Shravan', 'Dhanis', 'Shata', 'P.Bhad', 'U.Bhad', 'Revati'
    ];
    
    const getNak = (offset: number) => nakNames[(moonNak + offset - 2) % 27];

    return [
      { name: 'Janma (Birth)', nakshatra: getNak(1) },
      { name: 'Karma (Action)', nakshatra: getNak(10) },
      { name: 'Sanghatika', nakshatra: getNak(16) },
      { name: 'Samudayika', nakshatra: getNak(18) },
      { name: 'Naidhana', nakshatra: getNak(23) },
      { name: 'Desha', nakshatra: getNak(25) },
      { name: 'Jati', nakshatra: getNak(26) },
      { name: 'Abhisheka', nakshatra: getNak(27) }
    ];
  }
}
