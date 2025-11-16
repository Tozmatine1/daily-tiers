// src/data/dailyPuzzle.ts
import type { Puzzle } from "../types/puzzle";

// Format a Date into local "YYYY-MM-DD"
function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`; // e.g. "2025-11-16"
}

/**
 * All daily puzzles live here.
 * Key = "YYYY-MM-DD"
 * Value = Puzzle
 */
const DAILY_PUZZLES: Record<string, Puzzle> = {
  // 2025-11-16 – Career Points
"2025-11-16": {
  id: "2025-11-16",
  category: {
    id: "nba-career-points",
    name: "NBA Career Points",
    units: "points",
    tiers: [
      { id: "S", label: "S", minValue: 30000, maxValue: null },
      { id: "A", label: "A", minValue: 20000, maxValue: 29999 },
      { id: "B", label: "B", minValue: 15000, maxValue: 19999 },
      { id: "C", label: "C", minValue: 10000, maxValue: 14999 },
      { id: "D", label: "D", minValue: null, maxValue: 9999 },
    ],
  },
  items: [
    // S tier – spread from low 30Ks up to high 30Ks
    { id: "kareem",  name: "Kareem Abdul-Jabbar", value: 38387, trueTier: "S" },
    { id: "malone",  name: "Karl Malone",         value: 36928, trueTier: "S" },
    { id: "kobe",    name: "Kobe Bryant",         value: 33643, trueTier: "S" },
    { id: "dirk",    name: "Dirk Nowitzki",       value: 31560, trueTier: "S" },

    // A tier – high 20Ks, mid, and lower 20Ks
    { id: "carmelo", name: "Carmelo Anthony",     value: 28289, trueTier: "A" },
    { id: "garnett", name: "Kevin Garnett",       value: 26071, trueTier: "A" },
    { id: "rayallen",name: "Ray Allen",           value: 24505, trueTier: "A" },

    // B tier – upper and mid part of B band
    { id: "pippen",  name: "Scottie Pippen",      value: 18940, trueTier: "B" },
    { id: "parker",  name: "Tony Parker",         value: 19473, trueTier: "B" },

    // C tier – solid 10K–14K scorer
    { id: "ginobili",name: "Manu Ginóbili",       value: 14043, trueTier: "C" },
  ],
},

"2025-11-17": {
  id: "2025-11-17",
  category: {
    id: "nba-career-assists",
    name: "NBA Career Assists",
    units: "assists",
    tiers: [
      { id: "S", label: "S", minValue: 10000, maxValue: null },
      { id: "A", label: "A", minValue: 8000,  maxValue: 9999 },
      { id: "B", label: "B", minValue: 6000,  maxValue: 7999 },
      { id: "C", label: "C", minValue: 4000,  maxValue: 5999 },
      { id: "D", label: "D", minValue: null,  maxValue: 3999 },
    ],
  },
  items: [
    // S – spread from low 10Ks up through mid-teens
    { id: "stockton", name: "John Stockton",    value: 15806, trueTier: "S" },
    { id: "kidd",     name: "Jason Kidd",       value: 12091, trueTier: "S" },
    { id: "markjack", name: "Mark Jackson",     value: 10334, trueTier: "S" },
    { id: "nash",     name: "Steve Nash",       value: 10335, trueTier: "S" },

    // A – high 9Ks down into low 8Ks
    { id: "oscar",    name: "Oscar Robertson",  value: 9887,  trueTier: "A" },
    { id: "isiah",    name: "Isiah Thomas",     value: 9061,  trueTier: "A" },
    { id: "payton",   name: "Gary Payton",      value: 8966,  trueTier: "A" },

    // B – upper and lower part of 6–7.9K band
    { id: "rondo",    name: "Rajon Rondo",      value: 7900,  trueTier: "B" },
    { id: "lowry",    name: "Kyle Lowry",       value: 7000,  trueTier: "B" },
    { id: "lillard",  name: "Damian Lillard",   value: 6200,  trueTier: "B" },
  ],
},

"2025-11-18": {
  id: "2025-11-18",
  category: {
    id: "mlb-career-hr",
    name: "MLB Career Home Runs",
    units: "HR",
    tiers: [
      { id: "S", label: "S", minValue: 600, maxValue: null },
      { id: "A", label: "A", minValue: 500, maxValue: 599 },
      { id: "B", label: "B", minValue: 400, maxValue: 499 },
      { id: "C", label: "C", minValue: 300, maxValue: 399 },
      { id: "D", label: "D", minValue: null, maxValue: 299 },
    ],
  },
  items: [
    // S – from low 600s up through 760+
    { id: "bonds",   name: "Barry Bonds",       value: 762, trueTier: "S" },
    { id: "aaron",   name: "Hank Aaron",        value: 755, trueTier: "S" },
    { id: "ruth",    name: "Babe Ruth",         value: 714, trueTier: "S" },
    { id: "pujols",  name: "Albert Pujols",     value: 703, trueTier: "S" },
    { id: "thome",   name: "Jim Thome",         value: 612, trueTier: "S" },

    // A – good spread in 500s
    { id: "mantle",  name: "Mickey Mantle",     value: 536, trueTier: "A" },
    { id: "foxx",    name: "Jimmie Foxx",       value: 534, trueTier: "A" },
    { id: "manny",   name: "Manny Ramirez",     value: 555, trueTier: "A" },

    // B – upper and lower part of 400s
    { id: "sheffield",name: "Gary Sheffield",   value: 509, trueTier: "A" },
    { id: "mcgriff", name: "Fred McGriff",      value: 493, trueTier: "B" },
  ],
},

"2025-11-19": {
  id: "2025-11-19",
  category: {
    id: "movie-box-office",
    name: "Worldwide Box Office Gross",
    units: "USD",
    tiers: [
      { id: "S", label: "S", minValue: 2_000_000_000, maxValue: null },
      { id: "A", label: "A", minValue: 1_500_000_000, maxValue: 1_999_999_999 },
      { id: "B", label: "B", minValue: 1_000_000_000, maxValue: 1_499_999_999 },
      { id: "C", label: "C", minValue: 800_000_000,  maxValue: 999_999_999 },
      { id: "D", label: "D", minValue: null,         maxValue: 799_999_999 },
    ],
  },
  items: [
    // S – 2B+ spread
    { id: "avatar",      name: "Avatar",                    value: 2_923_000_000, trueTier: "S" },
    { id: "endgame",     name: "Avengers: Endgame",         value: 2_799_000_000, trueTier: "S" },
    { id: "titanic",     name: "Titanic",                   value: 2_264_000_000, trueTier: "S" },
    { id: "forceawakens",name: "Star Wars: The Force Awakens", value: 2_071_000_000, trueTier: "S" },

    // A – mid/high 1.5–1.9B
    { id: "infinitywar", name: "Avengers: Infinity War",    value: 2_048_000_000, trueTier: "S" },
    { id: "jurassic",    name: "Jurassic World",            value: 1_671_000_000, trueTier: "A" },
    { id: "lionking19",  name: "The Lion King (2019)",      value: 1_663_000_000, trueTier: "A" },

    // B – within 1.0–1.49B, varied
    { id: "frozen2",     name: "Frozen II",                 value: 1_450_000_000, trueTier: "B" },
    { id: "fate",        name: "The Fate of the Furious",   value: 1_238_000_000, trueTier: "B" },
    { id: "minions",     name: "Minions",                   value: 1_159_000_000, trueTier: "B" },
  ],
},

"2025-11-20": {
  id: "2025-11-20",
  category: {
    id: "nfl-pass-yards",
    name: "NFL Career Passing Yards",
    units: "yards",
    tiers: [
      { id: "S", label: "S", minValue: 70_000, maxValue: null },
      { id: "A", label: "A", minValue: 60_000, maxValue: 69_999 },
      { id: "B", label: "B", minValue: 50_000, maxValue: 59_999 },
      { id: "C", label: "C", minValue: 40_000, maxValue: 49_999 },
      { id: "D", label: "D", minValue: null,  maxValue: 39_999 },
    ],
  },
  items: [
    // S – full spread 70K–89K
    { id: "brady",   name: "Tom Brady",        value: 89_214, trueTier: "S" },
    { id: "brees",   name: "Drew Brees",       value: 80_358, trueTier: "S" },
    { id: "manning", name: "Peyton Manning",   value: 71_940, trueTier: "S" },
    { id: "favre",   name: "Brett Favre",      value: 71_838, trueTier: "S" },

    // A – 60–69K, high and low ends
    { id: "marino",  name: "Dan Marino",       value: 61_361, trueTier: "A" },
    { id: "ryan",    name: "Matt Ryan",        value: 62_792, trueTier: "A" },
    { id: "rivers",  name: "Philip Rivers",    value: 63_440, trueTier: "A" },

    // B – solid 50–59K variety
    { id: "eli",     name: "Eli Manning",      value: 57_023, trueTier: "B" },
    { id: "stafford",name: "Matthew Stafford", value: 53_725, trueTier: "B" },
    { id: "palmer",  name: "Carson Palmer",    value: 46_247, trueTier: "C" },
  ],
},

"2025-11-21": {
  id: "2025-11-21",
  category: {
    id: "global-album-sales",
    name: "Global Album Sales",
    units: "copies",
    tiers: [
      { id: "S", label: "S", minValue: 40_000_000, maxValue: null },
      { id: "A", label: "A", minValue: 30_000_000, maxValue: 39_999_999 },
      { id: "B", label: "B", minValue: 20_000_000, maxValue: 29_999_999 },
      { id: "C", label: "C", minValue: 10_000_000, maxValue: 19_999_999 },
      { id: "D", label: "D", minValue: null,      maxValue: 9_999_999 },
    ],
  },
  items: [
    // S – 40M–70M spread
    { id: "thriller",   name: "Michael Jackson – Thriller",           value: 70_000_000, trueTier: "S" },
    { id: "backblack",  name: "AC/DC – Back in Black",                value: 50_000_000, trueTier: "S" },
    { id: "eaglesgh",   name: "Eagles – Their Greatest Hits (1971–75)", value: 44_000_000, trueTier: "S" },
    { id: "darkside",   name: "Pink Floyd – The Dark Side of the Moon", value: 45_000_000, trueTier: "S" },

    // A – 30–39M spread
    { id: "saturday",   name: "Bee Gees – Saturday Night Fever",      value: 40_000_000, trueTier: "S" },
    { id: "jagged",     name: "Alanis Morissette – Jagged Little Pill", value: 33_000_000, trueTier: "A" },
    { id: "adele21",    name: "Adele – 21",                           value: 31_000_000, trueTier: "A" },

    // B – 20–29M spread
    { id: "spice",      name: "Spice Girls – Spice",                  value: 28_000_000, trueTier: "B" },
    { id: "millennium", name: "Backstreet Boys – Millennium",         value: 24_000_000, trueTier: "B" },
    { id: "bad",        name: "Michael Jackson – Bad",                value: 35_000_000, trueTier: "A" },
  ],
},

"2025-11-22": {
  id: "2025-11-22",
  category: {
    id: "premier-league-goals",
    name: "Premier League Career Goals",
    units: "goals",
    tiers: [
      { id: "S", label: "S", minValue: 200, maxValue: null },
      { id: "A", label: "A", minValue: 150, maxValue: 199 },
      { id: "B", label: "B", minValue: 120, maxValue: 149 },
      { id: "C", label: "C", minValue: 100, maxValue: 119 },
      { id: "D", label: "D", minValue: null, maxValue: 99 },
    ],
  },
  items: [
    // S – 200+
    { id: "shearer", name: "Alan Shearer",      value: 260, trueTier: "S" },
    { id: "kane",    name: "Harry Kane",        value: 213, trueTier: "S" },
    { id: "rooney",  name: "Wayne Rooney",      value: 208, trueTier: "S" },

    // A – 150–199, varied
    { id: "cole",    name: "Andrew Cole",       value: 187, trueTier: "A" },
    { id: "aguero",  name: "Sergio Agüero",     value: 184, trueTier: "A" },
    { id: "lampard", name: "Frank Lampard",     value: 177, trueTier: "A" },
    { id: "henry",   name: "Thierry Henry",     value: 175, trueTier: "A" },
    { id: "salah",   name: "Mohamed Salah",     value: 157, trueTier: "A" },

    // D – well below 100
    { id: "rashford",name: "Marcus Rashford",   value: 80,  trueTier: "D" },
    { id: "sterling",name: "Raheem Sterling",   value: 120, trueTier: "B" },
  ],
},

"2025-11-23": {
  id: "2025-11-23",
  category: {
    id: "youtube-views",
    name: "Most Viewed YouTube Videos",
    units: "views",
    tiers: [
      { id: "S", label: "S", minValue: 8_000_000_000, maxValue: null },
      { id: "A", label: "A", minValue: 5_000_000_000, maxValue: 7_999_999_999 },
      { id: "B", label: "B", minValue: 3_000_000_000, maxValue: 4_999_999_999 },
      { id: "C", label: "C", minValue: 2_000_000_000, maxValue: 2_999_999_999 },
      { id: "D", label: "D", minValue: null, maxValue: 1_999_999_999 },
    ],
  },
  items: [
    // S – 8B+
    { id: "babyshark", name: "Baby Shark Dance",          value: 13_000_000_000, trueTier: "S" },
    { id: "despacito", name: "Despacito",                 value: 9_000_000_000,  trueTier: "S" },

    // A – 5–7.9B
    { id: "johnny",    name: "Johny Johny Yes Papa",      value: 6_800_000_000,  trueTier: "A" },
    { id: "shape",     name: "Shape of You",              value: 6_200_000_000,  trueTier: "A" },
    { id: "seeyou",    name: "See You Again",             value: 5_900_000_000,  trueTier: "A" },

    // B – 3–4.9B
    { id: "uptown",    name: "Uptown Funk",               value: 4_900_000_000,  trueTier: "B" },
    { id: "gangnam",   name: "Gangnam Style",             value: 4_900_000_000,  trueTier: "B" },
    { id: "sorry",     name: "Sorry – Justin Bieber",     value: 3_700_000_000,  trueTier: "B" },

    // D – well under 2B
    { id: "dynamite",  name: "BTS – Dynamite",            value: 1_800_000_000,  trueTier: "D" },
    { id: "thrillerYT",name: "Michael Jackson – Thriller (Official)", value: 900_000_000, trueTier: "D" },
  ],
},

"2025-11-24": {
  id: "2025-11-24",
  category: {
    id: "ufc-career-wins",
    name: "UFC Career Wins",
    units: "wins",
    tiers: [
      { id: "S", label: "S", minValue: 25, maxValue: null },
      { id: "A", label: "A", minValue: 20, maxValue: 24 },
      { id: "B", label: "B", minValue: 15, maxValue: 19 },
      { id: "C", label: "C", minValue: 10, maxValue: 14 },
      { id: "D", label: "D", minValue: null, maxValue: 9 },
    ],
  },
  items: [
    // S – 25+
    { id: "miller",   name: "Jim Miller",         value: 25, trueTier: "S" },

    // A – 20–24 spread
    { id: "cerrone",  name: "Donald Cerrone",     value: 23, trueTier: "A" },
    { id: "maia",     name: "Demian Maia",        value: 22, trueTier: "A" },
    { id: "holloway", name: "Max Holloway",       value: 23, trueTier: "A" },
    { id: "poirier",  name: "Dustin Poirier",     value: 22, trueTier: "A" },
    { id: "gsp",      name: "Georges St-Pierre",  value: 20, trueTier: "A" },
    { id: "jonjones", name: "Jon Jones",          value: 20, trueTier: "A" },

    // B/C – mid and low double digits
    { id: "silva",    name: "Anderson Silva",     value: 17, trueTier: "B" },
    { id: "adesanya", name: "Israel Adesanya",    value: 13, trueTier: "C" },
    { id: "mcgregor", name: "Conor McGregor",     value: 10, trueTier: "C" },
  ],
},

  
};

export function getPuzzleForDate(
  date: Date = new Date()
): { puzzle: Puzzle; puzzleId: string } {
  const key = formatDateKey(date);

  const allKeys = Object.keys(DAILY_PUZZLES);
  if (allKeys.length === 0) {
    throw new Error("No daily puzzles configured in DAILY_PUZZLES.");
  }

  // If the exact date isn't configured, fall back to the earliest defined day
  const fallbackKey = allKeys.sort()[0];
  const puzzle = DAILY_PUZZLES[key] ?? DAILY_PUZZLES[fallbackKey];

  // Use today's date as puzzleId so attempts reset each day
  const puzzleId = key;

  return { puzzle, puzzleId };
}
