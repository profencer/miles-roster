import type { GameData, Origin, Background, SkillTableEntry } from '../types';

// ============================================
// ORIGINS
// ============================================
export const origins: Origin[] = [
  'Human',
  'Fey-blood',
  'Dusklings',
  'Feral',
  'Halflings',
  'Preen',
];

// ============================================
// BACKGROUNDS
// ============================================
export const backgrounds: Background[] = [
  {
    name: 'Townsfolk',
    description: 'Humans who tend to have deep pockets.',
    validOrigins: ['Human'],
    capabilities: [
      { min: 1, max: 3, value: 'Agility increase' },
      { min: 4, max: 7, value: 'Combat Skill increase' },
      { min: 8, max: 11, value: 'Speed increase' },
      { min: 12, max: 14, value: 'Toughness increase' },
      { min: 15, max: 17, value: 'Speed and Combat Skill increase' },
      { min: 18, max: 20, value: 'Agility and Speed increase' },
    ],
    mentality: [
      { min: 1, max: 2, value: '+1 Will' },
      { min: 3, max: 4, value: '+1 Will' },
      { min: 5, max: 16, value: '+1 XP' },
      { min: 17, max: 18, value: '+1 Luck' },
      { min: 19, max: 20, value: '+2 Luck' },
    ],
    possessions: [
      { min: 1, max: 5, value: '1 Gold Mark' },
      { min: 6, max: 11, value: '2 Gold Marks' },
      { min: 12, max: 14, value: 'Quality weapon' },
      { min: 15, max: 17, value: 'Fine basic weapon' },
      { min: 18, max: 20, value: 'Item' },
    ],
    training: [
      { min: 1, max: 7, value: '1 Skill' },
      { min: 8, max: 10, value: '2 Skills' },
      { min: 11, max: 20, value: '+1 XP' },
    ],
  },
  {
    name: 'Zealot',
    description: 'Humans who are often lucky, as if someone is watching over them.',
    validOrigins: ['Human'],
    capabilities: [
      { min: 1, max: 4, value: 'Agility increase' },
      { min: 5, max: 7, value: 'Combat Skill increase' },
      { min: 8, max: 11, value: 'Speed increase' },
      { min: 12, max: 16, value: 'Toughness increase' },
      { min: 17, max: 18, value: 'Combat Skill and Toughness increase' },
      { min: 19, max: 20, value: 'Speed and Toughness increase' },
    ],
    mentality: [
      { min: 1, max: 2, value: '+2 Will' },
      { min: 3, max: 4, value: '+1 Will' },
      { min: 5, max: 12, value: '+1 XP' },
      { min: 13, max: 16, value: '+1 Luck' },
      { min: 17, max: 18, value: '+2 Luck' },
      { min: 19, max: 20, value: '+1 Will & +1 Luck' },
    ],
    possessions: [
      { min: 1, max: 6, value: '1 Gold Mark' },
      { min: 7, max: 10, value: 'Basic weapon' },
      { min: 11, max: 12, value: 'Quality weapon' },
      { min: 13, max: 20, value: 'Item' },
    ],
    training: [
      { min: 1, max: 10, value: '1 Skill' },
      { min: 11, max: 12, value: '2 Skills' },
      { min: 13, max: 20, value: '+1 XP' },
    ],
  },
  {
    name: 'Frontier',
    description: 'Humans who are resourceful and skilled in wilderness survival.',
    validOrigins: ['Human'],
    capabilities: [
      { min: 1, max: 5, value: 'Agility increase' },
      { min: 6, max: 9, value: 'Combat Skill increase' },
      { min: 10, max: 14, value: 'Speed increase' },
      { min: 15, max: 17, value: 'Toughness increase' },
      { min: 18, max: 19, value: 'Agility and Combat Skill increase' },
      { min: 20, max: 20, value: 'Speed and Toughness increase' },
    ],
    mentality: [
      { min: 1, max: 3, value: '+1 Will' },
      { min: 4, max: 14, value: '+1 XP' },
      { min: 15, max: 17, value: '+1 Luck' },
      { min: 18, max: 20, value: '+1 XP & +1 Luck' },
    ],
    possessions: [
      { min: 1, max: 8, value: '1 Gold Mark' },
      { min: 9, max: 12, value: 'Basic weapon' },
      { min: 13, max: 16, value: 'Quality weapon' },
      { min: 17, max: 20, value: 'Item' },
    ],
    training: [
      { min: 1, max: 12, value: '1 Skill' },
      { min: 13, max: 15, value: '2 Skills' },
      { min: 16, max: 20, value: '+1 XP' },
    ],
  },
  {
    name: 'Mystic',
    description: 'Focused on magic, hampered by intense concentration.',
    validOrigins: ['Human', 'Fey-blood', 'Dusklings', 'Feral', 'Halflings', 'Preen'],
    capabilities: [
      { min: 1, max: 5, value: 'Agility increase' },
      { min: 6, max: 13, value: 'Casting increase' },
      { min: 14, max: 17, value: 'Speed increase' },
      { min: 18, max: 20, value: 'Toughness increase' },
    ],
    mentality: [
      { min: 1, max: 5, value: '+2 Will' },
      { min: 6, max: 9, value: '+1 Will' },
      { min: 10, max: 20, value: '+1 XP' },
    ],
    possessions: [
      { min: 1, max: 4, value: '1 Gold Mark' },
      { min: 5, max: 14, value: 'Mystic Item' },
      { min: 15, max: 20, value: 'Item' },
    ],
    training: [
      { min: 1, max: 5, value: 'Alchemy skill' },
      { min: 6, max: 11, value: '1 Skill' },
      { min: 12, max: 20, value: '+1 XP' },
    ],
  },
  {
    name: 'Noble',
    description: 'Humans who are often well-equipped and have connections.',
    validOrigins: ['Human'],
    capabilities: [
      { min: 1, max: 4, value: 'Agility increase' },
      { min: 5, max: 8, value: 'Combat Skill increase' },
      { min: 9, max: 12, value: 'Speed increase' },
      { min: 13, max: 16, value: 'Toughness increase' },
      { min: 17, max: 18, value: 'Combat Skill and Agility increase' },
      { min: 19, max: 20, value: 'All stats +1' },
    ],
    mentality: [
      { min: 1, max: 4, value: '+1 Will' },
      { min: 5, max: 10, value: '+1 XP' },
      { min: 11, max: 15, value: '+1 Luck' },
      { min: 16, max: 18, value: '+2 Luck' },
      { min: 19, max: 20, value: '+1 Will & +1 Luck' },
    ],
    possessions: [
      { min: 1, max: 4, value: '3 Gold Marks' },
      { min: 5, max: 8, value: '2 Gold Marks' },
      { min: 9, max: 12, value: 'Quality weapon' },
      { min: 13, max: 16, value: 'Fine armor' },
      { min: 17, max: 20, value: 'Valuable Item' },
    ],
    training: [
      { min: 1, max: 8, value: '1 Skill' },
      { min: 9, max: 12, value: '2 Skills' },
      { min: 13, max: 20, value: '+1 XP' },
    ],
  },
];

// ============================================
// SKILLS TABLE (p.52)
// ============================================
export const skillsTable: SkillTableEntry[] = [
  { min: 1, max: 10, skill: 'Battlewise – Achieving battlefield objectives; Seizing the Initiative.' },
  { min: 11, max: 20, skill: 'Crafting – Repairs, manual labor, and related haggling.' },
  { min: 21, max: 30, skill: 'Devotion – Obtaining blessings; enacting rituals; resisting hostile spells.' },
  { min: 31, max: 40, skill: 'Expertise – Dexterity and discretion while avoiding hazards.' },
  { min: 41, max: 50, skill: 'Endurance – Enduring hardship and fatigue.' },
  { min: 51, max: 60, skill: 'Intuition – Reading others; knowing when something is off.' },
  { min: 61, max: 70, skill: 'Leadership – Rallying the group; giving orders.' },
  { min: 71, max: 80, skill: 'Perception – Seeing hidden or subtle things.' },
  { min: 81, max: 90, skill: 'Stealth – Moving silently and unseen.' },
  { min: 91, max: 100, skill: 'Survival – Finding food and shelter in the wild.' },
];

// ============================================
// EQUIPMENT
// ============================================
export const equipmentData = {
  heroStarterKit: {
    quantityLimits: {
      qualityWeapons: 2,
      basicWeapons: 2,
      rangedWeaponsAllowed: 2,
    },
    qualityWeapons: [
      { name: 'Bastard sword', type: 'melee' as const },
      { name: 'Crossbow', type: 'ranged' as const, rangeFlag: true },
      { name: 'Fencing sword', type: 'melee' as const },
      { name: 'Longbow', type: 'ranged' as const, rangeFlag: true },
      { name: 'Throwing knives', type: 'melee' as const },
      { name: 'Warhammer', type: 'melee' as const },
      { name: 'War spear', type: 'melee' as const },
    ],
    basicWeapons: [
      { name: 'Self bow', type: 'ranged' as const, rangeFlag: true },
      { name: 'Sling', type: 'ranged' as const },
      { name: 'Standard weapon', type: 'melee' as const },
      { name: 'Staff', type: 'melee' as const },
      { name: 'Dagger', type: 'melee' as const },
      { name: 'Hand axe', type: 'melee' as const },
    ],
    armor: {
      partialArmor: 2,
      lightArmor: 2,
      helmets: 1,
      shields: 1,
    },
  },
  generalItems: [
    { name: 'Gold Mark', type: 'currency' as const },
    { name: 'Basic weapon', type: 'melee' as const },
    { name: 'Quality weapon', type: 'melee' as const },
    { name: 'Fine basic weapon', type: 'melee' as const },
    { name: 'Item', type: 'misc' as const },
    { name: 'Mystic Item', type: 'mystic' as const },
    { name: 'Valuable Item', type: 'misc' as const },
    { name: 'Fine armor', type: 'armor' as const },
    { name: 'Light armor', type: 'armor' as const },
    { name: 'Partial armor', type: 'armor' as const },
    { name: 'Helmet', type: 'armor' as const },
    { name: 'Shield', type: 'armor' as const },
  ],
  armorItems: [
    { name: 'Partial armor', type: 'armor' as const },
    { name: 'Light armor', type: 'armor' as const },
    { name: 'Full armor', type: 'armor' as const },
    { name: 'Helmet', type: 'armor' as const },
    { name: 'Shield', type: 'armor' as const },
  ],
};

// ============================================
// COMBINED GAME DATA
// ============================================
export const gameData: GameData = {
  origins,
  backgrounds,
  skillsTable,
  equipment: equipmentData,
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

export function rollD100(): number {
  return Math.floor(Math.random() * 100) + 1;
}

export function lookupRollResult<T extends { min: number; max: number }>(
  table: T[],
  roll: number
): T | undefined {
  return table.find((entry) => roll >= entry.min && roll <= entry.max);
}

export function getBackgroundsForOrigin(origin: Origin): Background[] {
  return backgrounds.filter(
    (bg) => !bg.validOrigins || bg.validOrigins.includes(origin)
  );
}

export function getSkillFromRoll(roll: number): string {
  const entry = lookupRollResult(skillsTable, roll);
  return entry?.skill ?? 'Unknown skill';
}

export function parseCapabilityResult(result: string): Partial<Record<keyof import('../types').Stats, number>> {
  const stats: Partial<Record<keyof import('../types').Stats, number>> = {};
  const lower = result.toLowerCase();
  
  if (lower.includes('all stats')) {
    return { agility: 1, combatSkill: 1, speedBase: 1, toughness: 1 };
  }
  
  if (lower.includes('agility')) stats.agility = 1;
  if (lower.includes('combat skill')) stats.combatSkill = 1;
  if (lower.includes('speed')) stats.speedBase = 1;
  if (lower.includes('toughness')) stats.toughness = 1;
  if (lower.includes('casting')) stats.casting = 1;
  
  return stats;
}

export function parseMentalityResult(result: string): { xp: number; will: number; luck: number } {
  const parsed = { xp: 0, will: 0, luck: 0 };
  const lower = result.toLowerCase();
  
  // Parse Will
  const willMatch = lower.match(/\+(\d+)\s*will/);
  if (willMatch) parsed.will = parseInt(willMatch[1], 10);
  
  // Parse Luck
  const luckMatch = lower.match(/\+(\d+)\s*luck/);
  if (luckMatch) parsed.luck = parseInt(luckMatch[1], 10);
  
  // Parse XP
  const xpMatch = lower.match(/\+(\d+)\s*xp/);
  if (xpMatch) parsed.xp = parseInt(xpMatch[1], 10);
  
  return parsed;
}

export function parseTrainingResult(result: string): { skills: number; xp: number } {
  const parsed = { skills: 0, xp: 0 };
  const lower = result.toLowerCase();
  
  if (lower.includes('2 skills')) parsed.skills = 2;
  else if (lower.includes('skill')) parsed.skills = 1;
  
  const xpMatch = lower.match(/\+(\d+)\s*xp/);
  if (xpMatch) parsed.xp = parseInt(xpMatch[1], 10);
  
  return parsed;
}

export function parsePossessionsResult(result: string): { gold: number; item: string | null } {
  const parsed = { gold: 0, item: null as string | null };
  const lower = result.toLowerCase();
  
  // Parse gold
  const goldMatch = lower.match(/(\d+)\s*gold\s*marks?/);
  if (goldMatch) parsed.gold = parseInt(goldMatch[1], 10);
  
  // Check for items
  if (lower.includes('quality weapon')) parsed.item = 'Quality weapon';
  else if (lower.includes('basic weapon')) parsed.item = 'Basic weapon';
  else if (lower.includes('fine basic weapon')) parsed.item = 'Fine basic weapon';
  else if (lower.includes('mystic item')) parsed.item = 'Mystic Item';
  else if (lower.includes('valuable item')) parsed.item = 'Valuable Item';
  else if (lower.includes('fine armor')) parsed.item = 'Fine armor';
  else if (lower.includes('item')) parsed.item = 'Item';
  
  return parsed;
}

export const defaultStats = (): import('../types').Stats => ({
  agility: 1,
  speedBase: 4,
  dashBonus: '+3',
  combatSkill: 0,
  toughness: 3,
  casting: 0,
  will: 0,
  luck: 0,
});

