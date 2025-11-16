export const NbaCareerAssists = {
  category: {
    name: "NBA Career Assists",
    units: "assists",
    tiers: [
      { id: "S", minValue: 10000, maxValue: null },
      { id: "A", minValue: 8000, maxValue: 9999 },
      { id: "B", minValue: 6000, maxValue: 7999 },
      { id: "C", minValue: 4000, maxValue: 5999 },
      { id: "D", minValue: 2000, maxValue: 3999 },
    ],
  },
  items: [
    { id: "1", name: "John Stockton", trueTier: "S" },
    { id: "2", name: "Jason Kidd", trueTier: "A" },
    { id: "3", name: "Chris Paul", trueTier: "A" },
    { id: "4", name: "LeBron James", trueTier: "B" },
    { id: "5", name: "Magic Johnson", trueTier: "S" },
  ],
};
