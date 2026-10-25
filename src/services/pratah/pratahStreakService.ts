/**
 * Pratah Sanskar Streak & Local Storage Backup Service (प्रातः संस्कार स्ट्रीक एवं बैकअप सेवा)
 * Manages the authentic 5-step morning routine:
 * 1. करदर्शन (Kara Darshanam)
 * 2. भूमिवंदन (Bhumi Vandanam)
 * 3. सूर्य अर्घ्य (Surya Arghya)
 * 4. संकल्प (Sankalpa)
 * 5. प्राणायाम (Pranayama)
 * 
 * Provides:
 * - Real-time streak tracking (current streak, longest streak, total sessions)
 * - 30-day streak activity matrix / calendar
 * - Milestone achievements
 * - Robust JSON export/import backup system with schema validation
 */

export type SacredFiveStepId = 
  | 'kara_darshan'
  | 'bhumi_vandan'
  | 'surya_arghya'
  | 'sankalpa'
  | 'pranayama';

export interface SacredStepInfo {
  id: SacredFiveStepId;
  order: number;
  titleHindi: string;
  titleEnglish: string;
  icon: string;
  mantraSanskrit: string;
  mantraTransliteration: string;
  meaningHindi: string;
  significance: string;
  durationEstimate: string;
}

export const SACRED_FIVE_STEPS: SacredStepInfo[] = [
  {
    id: 'kara_darshan',
    order: 1,
    titleHindi: 'करदर्शन',
    titleEnglish: 'Kara Darshanam',
    icon: '🤲',
    mantraSanskrit: 'कराग्रे वसते लक्ष्मीः करमध्ये सरस्वती । करमूले तु गोविन्दः प्रभाते करदर्शनम् ॥',
    mantraTransliteration: 'Karāgre Vasate Lakṣmīḥ Karamadhye Sarasvatī | Karamūle Tu Govindaḥ Prabhāte Karadarśanam ||',
    meaningHindi: 'हथेली के अग्रभाग में महालक्ष्मी, मध्य में भगवती सरस्वती तथा मूल भाग में श्री गोविंद (ब्रह्म) का वास है। प्रातःकाल अपनी दोनों हथेलियों का दर्शन कर दिन का शुभारंभ करें।',
    significance: 'अपनी कार्य-इंद्रियों में पुरुषार्थ, विवेक और देवत्व का स्मरण।',
    durationEstimate: '1 मिनट'
  },
  {
    id: 'bhumi_vandan',
    order: 2,
    titleHindi: 'भूमिवंदन',
    titleEnglish: 'Bhumi Vandanam',
    icon: '🌱',
    mantraSanskrit: 'समुद्रवसने देवि पर्वतस्तनमण्डले । विष्णुपत्नि नमस्तुभ्यं पादस्पर्शं क्षमस्व मे ॥',
    mantraTransliteration: 'Samudra-Vasane Devi Parvata-Stana-Maṇḍale | Viṣṇu-Patni Namas-Tubhyaṁ Pāda-Sparśaṁ Kṣamasva Me ||',
    meaningHindi: 'हे समुद्ररूपी वस्त्र धारण करने वाली और पर्वतरूपी वक्षस्थल वाली माँ पृथ्वी, श्रीविष्णु की अर्धांगिनी! मैं आपको नमन करता हूँ। धरती पर पैर रखने के लिए कृपया मुझे क्षमा करें।',
    significance: 'मातृभूमि और प्रकृति के प्रति कृतज्ञता, विनम्रता और भू-तत्व से ऊर्जा संतुलन।',
    durationEstimate: '1 मिनट'
  },
  {
    id: 'surya_arghya',
    order: 3,
    titleHindi: 'सूर्य अर्घ्य',
    titleEnglish: 'Surya Arghya & Gayatri',
    icon: '☀️',
    mantraSanskrit: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥',
    mantraTransliteration: 'Oṁ Bhūr Bhuvaḥ Svaḥ Tat-Savitur Vareṇyaṁ Bhargo Devasya Dhīmahi Dhiyo Yo Naḥ Pracodayāt ||',
    meaningHindi: 'तांबे के पात्र में पवित्र जल, अक्षत और रोली लेकर पूर्व दिशा में भगवान सूर्य को अर्घ्य समर्पित करें। वे हमारे अंतःकरण को सद्बुद्धि और ज्ञान से आलोकित करें।',
    significance: 'सौर ऊर्जा, आत्मबल, एकाग्रता और जैविक क्लॉक (Circadian Rhythm) का संतुलन।',
    durationEstimate: '3 मिनट'
  },
  {
    id: 'sankalpa',
    order: 4,
    titleHindi: 'संकल्प',
    titleEnglish: 'Sankalpa & Karma',
    icon: '🙏',
    mantraSanskrit: 'ॐ तत्सत्। अद्य अहं मनसा वाचा कर्मणा सत्यं धर्मं च पालयिष्यामि।',
    mantraTransliteration: 'Oṁ Tat Sat | Adya Ahaṁ Manasā Vācā Karmaṇā Satyaṁ Dharmaṁ Ca Pālayiṣyāmi ||',
    meaningHindi: 'आज के दिन सत्य, धैर्य, निष्काम कर्म और सेवा का दृढ संकल्प लें। अपने मुख्य लक्ष्य और एक परोपकारी कर्म का चयन करें।',
    significance: 'दिन भर के विचारों और कर्मों को सात्विक दिशा देना तथा आत्मसंयम स्थापित करना।',
    durationEstimate: '2 मिनट'
  },
  {
    id: 'pranayama',
    order: 5,
    titleHindi: 'प्राणायाम',
    titleEnglish: 'Pranayama & Dhyana',
    icon: '🧘',
    mantraSanskrit: 'प्राणानां नियमनं प्राणायामः। ॐ शान्तिः शान्तिः शान्तिः ॥',
    mantraTransliteration: 'Prāṇānāṁ Niyamanaṁ Prāṇāyāmaḥ | Oṁ Śāntiḥ Śāntiḥ Śāntiḥ ||',
    meaningHindi: 'सुखासन में बैठकर अनुलोम-विलोम, कपालभाति अथवा नाड़ीशोधन का अभ्यास करें। 5 मिनट मौन में ॐ का मानसिक जप करें।',
    significance: 'प्राणवायु का प्रवाह, तनाव मुक्ति, मानसिक स्थिरता और प्राण-कोश का नवजीवन।',
    durationEstimate: '5 मिनट'
  }
];

export interface SacredDailyRecord {
  date: string; // YYYY-MM-DD
  completedSteps: SacredFiveStepId[];
  isFullyCompleted: boolean;
  completedAt?: string;
  sankalpaText?: string;
  notes?: string;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalSessionsCompleted: number;
  lastCompletedDate: string | null;
  history30Days: { date: string; dayOfMonth: number; isCompleted: boolean; stepCount: number }[];
  milestones: { id: string; nameHindi: string; daysTarget: number; achieved: boolean; icon: string }[];
}

export interface PratahBackupData {
  version: string;
  exportedAt: string;
  records: Record<string, SacredDailyRecord>;
  stats: {
    currentStreak: number;
    longestStreak: number;
    totalSessions: number;
  };
  checksum?: string;
}

const STORAGE_VAULT_KEY = 'jeevandarpan_pratah_sacred_vault_v1';
const memoryStore: Record<string, string> = {};

export class PratahStreakService {
  /**
   * Retrieves all sacred daily records
   */
  public static getAllRecords(): Record<string, SacredDailyRecord> {
    if (typeof window === 'undefined' || !window.localStorage) {
      const cached = memoryStore[STORAGE_VAULT_KEY];
      return cached ? JSON.parse(cached) : {};
    }
    try {
      const stored = localStorage.getItem(STORAGE_VAULT_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading pratah sacred vault:', e);
    }
    return {};
  }

  /**
   * Saves records to local storage
   */
  public static saveAllRecords(records: Record<string, SacredDailyRecord>): void {
    const serialized = JSON.stringify(records);
    if (typeof window === 'undefined' || !window.localStorage) {
      memoryStore[STORAGE_VAULT_KEY] = serialized;
      return;
    }
    try {
      localStorage.setItem(STORAGE_VAULT_KEY, serialized);
    } catch (e) {
      console.warn('Error saving pratah sacred vault:', e);
    }
  }

  /**
   * Gets or initializes record for a specific date
   */
  public static getDailyRecord(dateStr: string): SacredDailyRecord {
    const all = this.getAllRecords();
    if (all[dateStr]) {
      return all[dateStr];
    }
    return {
      date: dateStr,
      completedSteps: [],
      isFullyCompleted: false
    };
  }

  /**
   * Updates and saves a daily record
   */
  public static saveDailyRecord(record: SacredDailyRecord): void {
    const all = this.getAllRecords();
    const isFull = record.completedSteps.length >= 5;
    const updated: SacredDailyRecord = {
      ...record,
      isFullyCompleted: isFull,
      completedAt: isFull && !record.completedAt ? new Date().toISOString() : record.completedAt
    };
    all[record.date] = updated;
    this.saveAllRecords(all);
  }

  /**
   * Toggles or marks a specific step as complete for a given date
   */
  public static toggleStep(dateStr: string, stepId: SacredFiveStepId): SacredDailyRecord {
    const current = this.getDailyRecord(dateStr);
    let steps = [...current.completedSteps];
    if (steps.includes(stepId)) {
      steps = steps.filter(s => s !== stepId);
    } else {
      steps.push(stepId);
    }
    const updated: SacredDailyRecord = {
      ...current,
      completedSteps: steps
    };
    this.saveDailyRecord(updated);
    return this.getDailyRecord(dateStr);
  }

  /**
   * Calculates comprehensive streak statistics and 30-day activity matrix
   */
  public static getStreakStats(referenceDate: Date = new Date()): StreakStats {
    const all = this.getAllRecords();
    const refStr = referenceDate.toISOString().split('T')[0];

    // Compute 30 days history array
    const history30Days: StreakStats['history30Days'] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(referenceDate);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const rec = all[dStr];
      const count = rec ? rec.completedSteps.length : 0;
      history30Days.push({
        date: dStr,
        dayOfMonth: d.getDate(),
        isCompleted: Boolean(rec && (rec.isFullyCompleted || count >= 3)),
        stepCount: count
      });
    }

    // Calculate current streak
    let currentStreak = 0;
    const checkDate = new Date(referenceDate);
    // If today is not completed yet, check if yesterday was completed to keep streak alive
    const todayRec = all[refStr];
    const isTodayDone = todayRec && (todayRec.isFullyCompleted || todayRec.completedSteps.length >= 3);

    if (isTodayDone) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      // Check yesterday
      checkDate.setDate(checkDate.getDate() - 1);
    }

    // Traverse backward for consecutive days
    while (true) {
      const dateStr = checkDate.toISOString().split('T')[0];
      const rec = all[dateStr];
      if (rec && (rec.isFullyCompleted || rec.completedSteps.length >= 3)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Total sessions completed ever
    const allDates = Object.keys(all);
    const completedDates = allDates.filter(d => all[d].isFullyCompleted || all[d].completedSteps.length >= 3);
    const totalSessions = completedDates.length;

    // Longest streak calculation
    let longestStreak = currentStreak;
    let tempStreak = 0;
    const sortedDates = [...completedDates].sort();
    
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    }

    if (longestStreak < currentStreak) {
      longestStreak = currentStreak;
    }

    // Find last completed date
    let lastCompletedDate: string | null = null;
    if (completedDates.length > 0) {
      const sorted = [...completedDates].sort();
      lastCompletedDate = sorted[sorted.length - 1];
    }

    // Milestones definition
    const milestones = [
      { id: 'm1', nameHindi: 'आरंभिक साधक', daysTarget: 3, achieved: (longestStreak >= 3 || currentStreak >= 3), icon: '🌱' },
      { id: 'm2', nameHindi: 'सप्ताह सिद्धि', daysTarget: 7, achieved: (longestStreak >= 7 || currentStreak >= 7), icon: '🌿' },
      { id: 'm3', nameHindi: 'नियमनिष्ठ तपस्वी', daysTarget: 21, achieved: (longestStreak >= 21 || currentStreak >= 21), icon: '🔥' },
      { id: 'm4', nameHindi: 'मासिक अनुशासन', daysTarget: 30, achieved: (longestStreak >= 30 || currentStreak >= 30), icon: '🏆' },
      { id: 'm5', nameHindi: 'शतम् साधक', daysTarget: 108, achieved: (longestStreak >= 108 || currentStreak >= 108), icon: '👑' }
    ];

    return {
      currentStreak,
      longestStreak,
      totalSessionsCompleted: totalSessions,
      lastCompletedDate,
      history30Days,
      milestones
    };
  }

  /**
   * Exports full vault data as a clean JSON backup string
   */
  public static exportBackup(): string {
    const records = this.getAllRecords();
    const stats = this.getStreakStats();

    const backupPayload: PratahBackupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      records,
      stats: {
        currentStreak: stats.currentStreak,
        longestStreak: stats.longestStreak,
        totalSessions: stats.totalSessionsCompleted
      },
      checksum: `VAULT-${Object.keys(records).length}-${Date.now().toString(36).toUpperCase()}`
    };

    return JSON.stringify(backupPayload, null, 2);
  }

  /**
   * Imports and validates backup JSON data, returning import statistics
   */
  public static importBackup(jsonString: string): { success: boolean; count: number; message: string } {
    try {
      const parsed: PratahBackupData = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object' || !parsed.records) {
        return { success: false, count: 0, message: 'अमान्य बैकअप फ़ाइल: रिकॉर्ड्स अनुपलब्ध हैं।' };
      }

      const existing = this.getAllRecords();
      let importedCount = 0;

      for (const [dateKey, record] of Object.entries(parsed.records)) {
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateKey) && record && Array.isArray(record.completedSteps)) {
          existing[dateKey] = {
            date: dateKey,
            completedSteps: record.completedSteps,
            isFullyCompleted: record.completedSteps.length >= 5,
            completedAt: record.completedAt,
            sankalpaText: record.sankalpaText,
            notes: record.notes
          };
          importedCount++;
        }
      }

      this.saveAllRecords(existing);
      return {
        success: true,
        count: importedCount,
        message: `सफलतापूर्वक ${importedCount} दिनों के प्रातः संस्कार रिकॉर्ड पुनर्स्थापित किए गए!`
      };
    } catch (e: any) {
      return {
        success: false,
        count: 0,
        message: `पुनर्स्थापना में त्रुटि: ${e.message || 'फ़ाइल पार्स नहीं हो सकी'}`
      };
    }
  }

  /**
   * Resets local vault after user confirmation
   */
  public static resetVault(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(STORAGE_VAULT_KEY);
    }
    delete memoryStore[STORAGE_VAULT_KEY];
  }
}
