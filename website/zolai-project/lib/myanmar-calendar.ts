/**
 * Myanmar (Burmese) calendar and date formatting utilities
 */

// Myanmar era starts from 638 AD (Buddhist era - 638)
const MYANMAR_ERA_OFFSET = 638;

// Myanmar months
export const myanmarMonths = [
  "တပေါက်တော့", // Tapauk (March-April)
  "ကဆုန်", // Kethoun (April-May) 
  "နယုန်", // Nayon (May-June)
  "ဝါဆို", // Wathoe (June-July)
  "ဝါခေါင်", // Wahkaung (July-August)
  "တော့သလင်း", // Tawathalin (August-September)
  "သီတင်းကျွတ်", // Thitinkut (September-October)
  "တန်ဆောင်းမုန်း", // Tanthongmun (October-November)
  "နတ်တော်", // Nataw (November-December)
  "ပြာသို", // Pyathoe (December-January)
  "တပုတ်ဆိုး", // Tapotethe (January-February)
  "တန်ခူး" // Tanku (February-March)
];

// Days of the week in Myanmar
export const myanmarDays = [
  "တနင်္ဂနွေ", // Sunday
  "တနင်္လာ", // Monday  
  "အင်္ဂါ", // Tuesday
  "ဗုဒ္ဓဟူး", // Wednesday
  "ကြာသပတေး", // Thursday
  "သောကြာ", // Friday
  "စနေ" // Saturday
];

/**
 * Convert Gregorian date to Myanmar date
 */
export function toMyanmarDate(date: Date): {
  year: number;
  month: number;
  day: number;
  monthName: string;
  dayName: string;
} {
  const gregorianYear = date.getFullYear();
  const gregorianMonth = date.getMonth() + 1;
  const gregorianDay = date.getDate();
  
  // Basic Myanmar year calculation
  // Note: This is a simplified calculation. A full implementation would need
  // to account for the complex Myanmar calendar system with intercalary months
  let myanmarYear = gregorianYear - MYANMAR_ERA_OFFSET;
  
  // Adjust for Myanmar new year (around April)
  if (gregorianMonth < 4 || (gregorianMonth === 4 && gregorianDay < 17)) {
    myanmarYear--;
  }
  
  // Simple month mapping (simplified)
  let myanmarMonth = (gregorianMonth + 8) % 12;
  if (myanmarMonth === 0) myanmarMonth = 12;
  
  const dayOfWeek = date.getDay();
  
  return {
    year: myanmarYear,
    month: myanmarMonth,
    day: gregorianDay,
    monthName: myanmarMonths[myanmarMonth - 1],
    dayName: myanmarDays[dayOfWeek]
  };
}

/**
 * Format date in Myanmar style
 */
export function formatMyanmarDate(date: Date, style: 'short' | 'long' = 'long'): string {
  const myanmar = toMyanmarDate(date);
  
  if (style === 'short') {
    return `${myanmar.day}/${myanmar.month}/${myanmar.year}`;
  }
  
  return `${myanmar.dayName}၊ ${myanmar.monthName} ${myanmar.day}ရက်၊ မြန်မာသက္ကရာဇ် ${myanmar.year}ခုနှစ်`;
}

/**
 * Convert Myanmar numerals to English numerals
 */
export function myanmarToEnglishNumerals(text: string): string {
  const myanmarNumerals = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = text;
  for (let i = 0; i < myanmarNumerals.length; i++) {
    result = result.replace(new RegExp(myanmarNumerals[i], 'g'), englishNumerals[i]);
  }
  return result;
}

/**
 * Convert English numerals to Myanmar numerals
 */
export function englishToMyanmarNumerals(text: string): string {
  const myanmarNumerals = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  const englishNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  
  let result = text;
  for (let i = 0; i < englishNumerals.length; i++) {
    result = result.replace(new RegExp(englishNumerals[i], 'g'), myanmarNumerals[i]);
  }
  return result;
}

/**
 * Get auspicious days for Myanmar culture
 */
export function isAuspiciousDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  const dayOfMonth = date.getDate();
  
  // Full moon days (approximation - 15th of month)
  if (dayOfMonth === 15) return true;
  
  // New moon days (approximation - 30th/1st of month)
  if (dayOfMonth === 1 || dayOfMonth === 30) return true;
  
  // Buddhist sabbath days (every 7-8 days)
  if ([8, 15, 23, 30].includes(dayOfMonth)) return true;
  
  // Sunday and Wednesday are generally considered auspicious
  if (dayOfWeek === 0 || dayOfWeek === 3) return true;
  
  return false;
}

/**
 * Get Myanmar zodiac sign based on day of week born
 */
export function getMyanmarZodiac(dayOfWeek: number): {
  animal: string;
  direction: string;
  planet: string;
} {
  const zodiacSigns = [
    { animal: "ဂရုဍ်", direction: "အရှေ့မြောက်", planet: "တနင်္ဂနွေ" }, // Sunday - Garuda
    { animal: "ကျား", direction: "အရှေ့", planet: "တနင်္လာ" }, // Monday - Tiger
    { animal: "ခြင်္သေ့", direction: "အရှေ့တောင်", planet: "အင်္ဂါ" }, // Tuesday - Lion
    { animal: "ဆင်စွယ်သွား", direction: "တောင်", planet: "ဗုဒ္ဓဟူး" }, // Wednesday - Elephant with tusks
    { animal: "ကြွက်", direction: "အနောက်တောင်", planet: "ကြာသပတေး" }, // Thursday - Rat
    { animal: "ပင်လယ်ဝက်", direction: "အနောက်", planet: "သောကြာ" }, // Friday - Guinea pig
    { animal: "နဂါး", direction: "အနောက်မြောက်", planet: "စနေ" }, // Saturday - Dragon
    { animal: "ဆင်စွယ်မဲ့", direction: "မြောက်", planet: "ဗုဒ္ဓဟူး" } // Wednesday evening - Elephant without tusks
  ];
  
  return zodiacSigns[dayOfWeek] || zodiacSigns[0];
}