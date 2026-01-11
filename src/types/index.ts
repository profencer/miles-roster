// ============================================
// Five Leagues from the Borderlands - Types
// ============================================

export type Origin = 
  | 'Human' 
  | 'Fey-blood' 
  | 'Dusklings' 
  | 'Feral' 
  | 'Halflings' 
  | 'Preen';

export type BackgroundName = 
  | 'Townsfolk' 
  | 'Zealot' 
  | 'Frontier' 
  | 'Mystic' 
  | 'Noble';

export type CharacterType = 'hero' | 'follower';

export interface Stats {
  agility: number;
  speedBase: number;
  dashBonus: string;
  combatSkill: number;
  toughness: number;
  casting: number;
  will: number;
  luck: number;
}

export interface Equipment {
  name: string;
  type: 'melee' | 'ranged' | 'armor' | 'currency' | 'misc' | 'mystic';
  rangeFlag?: boolean;
}

export interface Character {
  id: string;
  name: string;
  origin: Origin;
  background: BackgroundName;
  characterType: CharacterType;
  isMystic: boolean;
  stats: Stats;
  skills: string[];
  equipment: Equipment[];
  xp: number;
  gold: number;
  notes: string;
}

export interface Warband {
  id: string;
  name: string;
  maxHeroes: number;
  heroes: Character[];
  followers: Character[];
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Game Data Types
// ============================================

export interface RollTableEntry {
  min: number;
  max: number;
  value: string;
}

export interface Background {
  name: BackgroundName;
  description: string;
  validOrigins?: Origin[];
  capabilities?: RollTableEntry[];
  mentality?: RollTableEntry[];
  possessions?: RollTableEntry[];
  training?: RollTableEntry[];
}

export interface SkillTableEntry {
  min: number;
  max: number;
  skill: string;
}

export interface WeaponItem {
  name: string;
  type: 'melee' | 'ranged';
  rangeFlag?: boolean;
}

export interface HeroStarterKit {
  quantityLimits: {
    qualityWeapons: number;
    basicWeapons: number;
    rangedWeaponsAllowed: number;
  };
  qualityWeapons: WeaponItem[];
  basicWeapons: WeaponItem[];
  armor: {
    partialArmor: number;
    lightArmor: number;
    helmets: number;
    shields: number;
  };
}

export interface GameData {
  origins: Origin[];
  backgrounds: Background[];
  skillsTable: SkillTableEntry[];
  equipment: {
    heroStarterKit: HeroStarterKit;
    generalItems: Equipment[];
  };
}

// ============================================
// Character Creation State
// ============================================

export interface CharacterCreationState {
  step: number;
  characterType: CharacterType;
  origin: Origin | null;
  background: BackgroundName | null;
  name: string;
  bringsEquipment: boolean;
  capabilityRoll: number | null;
  capabilityResult: string | null;
  mentalityRoll: number | null;
  mentalityResult: string | null;
  possessionsRoll: number | null;
  possessionsResult: string | null;
  trainingRoll: number | null;
  trainingResult: string | null;
  skillRolls: { roll: number; skill: string }[];
  selectedEquipment: Equipment[];
  computedStats: Stats;
}

