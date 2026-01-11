import type { Warband, Character } from '../types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'five_leagues_warbands';

// ============================================
// WARBAND STORAGE
// ============================================

export function loadWarbands(): Warband[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as Warband[];
  } catch (error) {
    console.error('Failed to load warbands:', error);
    return [];
  }
}

export function saveWarbands(warbands: Warband[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(warbands));
  } catch (error) {
    console.error('Failed to save warbands:', error);
  }
}

export function getWarband(id: string): Warband | undefined {
  const warbands = loadWarbands();
  return warbands.find((w) => w.id === id);
}

export function createWarband(name: string, maxHeroes: number = 10): Warband {
  const warband: Warband = {
    id: uuidv4(),
    name,
    maxHeroes,
    heroes: [],
    followers: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const warbands = loadWarbands();
  warbands.push(warband);
  saveWarbands(warbands);

  return warband;
}

export function updateWarband(warband: Warband): void {
  const warbands = loadWarbands();
  const index = warbands.findIndex((w) => w.id === warband.id);
  
  if (index !== -1) {
    warbands[index] = {
      ...warband,
      updatedAt: new Date().toISOString(),
    };
    saveWarbands(warbands);
  }
}

export function deleteWarband(id: string): void {
  const warbands = loadWarbands();
  const filtered = warbands.filter((w) => w.id !== id);
  saveWarbands(filtered);
}

// ============================================
// CHARACTER OPERATIONS
// ============================================

export function addCharacterToWarband(
  warbandId: string,
  character: Character
): void {
  const warband = getWarband(warbandId);
  if (!warband) return;

  if (character.characterType === 'hero') {
    warband.heroes.push(character);
  } else {
    warband.followers.push(character);
  }

  updateWarband(warband);
}

export function updateCharacterInWarband(
  warbandId: string,
  character: Character
): void {
  const warband = getWarband(warbandId);
  if (!warband) return;

  const list = character.characterType === 'hero' ? warband.heroes : warband.followers;
  const index = list.findIndex((c) => c.id === character.id);
  
  if (index !== -1) {
    list[index] = character;
    updateWarband(warband);
  }
}

export function removeCharacterFromWarband(
  warbandId: string,
  characterId: string,
  characterType: 'hero' | 'follower'
): void {
  const warband = getWarband(warbandId);
  if (!warband) return;

  if (characterType === 'hero') {
    warband.heroes = warband.heroes.filter((c) => c.id !== characterId);
  } else {
    warband.followers = warband.followers.filter((c) => c.id !== characterId);
  }

  updateWarband(warband);
}

// ============================================
// UTILITY
// ============================================

export function generateId(): string {
  return uuidv4();
}

