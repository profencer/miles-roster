import { useState, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { 
  Origin, 
  BackgroundName, 
  CharacterType, 
  Character, 
  Equipment, 
  Stats,
  RollTableEntry 
} from '../types';
import { 
  origins, 
  backgrounds, 
  getBackgroundsForOrigin,
  rollD100,
  lookupRollResult,
  getSkillFromRoll,
  parseCapabilityResult,
  parseMentalityResult,
  parsePossessionsResult,
  parseTrainingResult,
  defaultStats,
  equipmentData
} from '../data/gameData';
import { addCharacterToWarband } from '../utils/storage';
import { DiceRoll } from './DiceRoll';

interface CharacterCreationWizardProps {
  warbandId: string;
  characterType: CharacterType;
  onComplete: () => void;
  onCancel: () => void;
}

type WizardStep = 
  | 'name'
  | 'origin'
  | 'background'
  | 'capabilities'
  | 'mentality'
  | 'possessions'
  | 'training'
  | 'skills'
  | 'equipment'
  | 'summary';

const HERO_STEPS: WizardStep[] = [
  'name',
  'origin',
  'background',
  'capabilities',
  'mentality',
  'possessions',
  'training',
  'skills',
  'equipment',
  'summary',
];

// Followers have simplified creation - only Human, no background rolls
const FOLLOWER_STEPS: WizardStep[] = [
  'name',
  'equipment',
  'summary',
];

const STEP_LABELS: Record<WizardStep, string> = {
  name: 'Name',
  origin: 'Origin',
  background: 'Background',
  capabilities: 'Capabilities',
  mentality: 'Mentality',
  possessions: 'Possessions',
  training: 'Training',
  skills: 'Skills',
  equipment: 'Equipment',
  summary: 'Summary',
};

export function CharacterCreationWizard({
  warbandId,
  characterType,
  onComplete,
  onCancel,
}: CharacterCreationWizardProps) {
  // Get the appropriate steps based on character type
  const STEPS = characterType === 'hero' ? HERO_STEPS : FOLLOWER_STEPS;
  
  const [currentStep, setCurrentStep] = useState<WizardStep>('name');
  
  // Character data
  const [name, setName] = useState('');
  // Followers are always Human
  const [selectedOrigin, setSelectedOrigin] = useState<Origin | null>(
    characterType === 'follower' ? 'Human' : null
  );
  const [selectedBackground, setSelectedBackground] = useState<BackgroundName | null>(null);
  const [bringsEquipment, setBringsEquipment] = useState(false);
  
  // Roll results
  const [capabilityRoll, setCapabilityRoll] = useState<number | null>(null);
  const [capabilityResult, setCapabilityResult] = useState<string | null>(null);
  const [mentalityRoll, setMentalityRoll] = useState<number | null>(null);
  const [mentalityResult, setMentalityResult] = useState<string | null>(null);
  const [possessionsRoll, setPossessionsRoll] = useState<number | null>(null);
  const [possessionsResult, setPossessionsResult] = useState<string | null>(null);
  const [trainingRoll, setTrainingRoll] = useState<number | null>(null);
  const [trainingResult, setTrainingResult] = useState<string | null>(null);
  
  // Skills
  const [skillRolls, setSkillRolls] = useState<{ roll: number; skill: string }[]>([]);
  const [skillsToRoll, setSkillsToRoll] = useState(0);
  
  // Equipment
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  
  // Computed values
  const [bonusXP, setBonusXP] = useState(0);
  const [bonusWill, setBonusWill] = useState(0);
  const [bonusLuck, setBonusLuck] = useState(0);
  const [gold, setGold] = useState(0);
  const [itemFromPossessions, setItemFromPossessions] = useState<string | null>(null);

  // Get background data
  const backgroundData = useMemo(() => {
    if (!selectedBackground) return null;
    return backgrounds.find((b) => b.name === selectedBackground);
  }, [selectedBackground]);

  // Get available backgrounds for selected origin
  const availableBackgrounds = useMemo(() => {
    if (!selectedOrigin) return [];
    return getBackgroundsForOrigin(selectedOrigin);
  }, [selectedOrigin]);

  const isMystic = selectedBackground === 'Mystic';

  // Navigation
  const currentStepIndex = STEPS.indexOf(currentStep);
  
  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < STEPS.length) {
      setCurrentStep(STEPS[nextIndex]);
    }
  };

  const goToPrevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(STEPS[prevIndex]);
    }
  };

  // Roll handlers
  const handleCapabilityRoll = (roll: number) => {
    setCapabilityRoll(roll);
    if (backgroundData?.capabilities) {
      const entry = lookupRollResult(backgroundData.capabilities, roll);
      setCapabilityResult(entry?.value ?? null);
    }
  };

  const handleMentalityRoll = (roll: number) => {
    setMentalityRoll(roll);
    if (backgroundData?.mentality) {
      const entry = lookupRollResult(backgroundData.mentality, roll);
      if (entry) {
        setMentalityResult(entry.value);
        const parsed = parseMentalityResult(entry.value);
        setBonusXP((prev) => prev + parsed.xp);
        setBonusWill(parsed.will);
        setBonusLuck(parsed.luck);
      }
    }
  };

  const handlePossessionsRoll = (roll: number) => {
    setPossessionsRoll(roll);
    if (backgroundData?.possessions) {
      const entry = lookupRollResult(backgroundData.possessions, roll);
      if (entry) {
        setPossessionsResult(entry.value);
        const parsed = parsePossessionsResult(entry.value);
        setGold(parsed.gold);
        setItemFromPossessions(parsed.item);
      }
    }
  };

  const handleTrainingRoll = (roll: number) => {
    setTrainingRoll(roll);
    if (backgroundData?.training) {
      const entry = lookupRollResult(backgroundData.training, roll);
      if (entry) {
        setTrainingResult(entry.value);
        const parsed = parseTrainingResult(entry.value);
        setSkillsToRoll(parsed.skills);
        setBonusXP((prev) => prev + parsed.xp);
      }
    }
  };

  const handleSkillRoll = () => {
    const roll = rollD100();
    const skill = getSkillFromRoll(roll);
    setSkillRolls((prev) => [...prev, { roll, skill }]);
  };

  // Equipment selection
  const toggleEquipment = (item: Equipment) => {
    setSelectedEquipment((prev) => {
      const exists = prev.find((e) => e.name === item.name);
      if (exists) {
        return prev.filter((e) => e.name !== item.name);
      }
      return [...prev, item];
    });
  };

  // Calculate final stats
  const computeFinalStats = (): Stats => {
    const stats = defaultStats();
    
    // Apply capability bonuses
    if (capabilityResult) {
      const bonuses = parseCapabilityResult(capabilityResult);
      if (bonuses.agility) stats.agility += bonuses.agility;
      if (bonuses.combatSkill) stats.combatSkill += bonuses.combatSkill;
      if (bonuses.speedBase) stats.speedBase += bonuses.speedBase;
      if (bonuses.toughness) stats.toughness += bonuses.toughness;
      if (bonuses.casting) stats.casting += bonuses.casting;
    }
    
    stats.will = bonusWill;
    stats.luck = bonusLuck;
    
    return stats;
  };

  // Calculate armor score from equipment
  const calculateArmorScore = (): number => {
    let score = 0;
    selectedEquipment.forEach((item) => {
      if (item.name === 'Partial armor') score += 1;
      if (item.name === 'Light armor') score += 2;
      if (item.name === 'Full armor') score += 3;
      if (item.name === 'Helmet') score += 1;
      if (item.name === 'Shield') score += 1;
    });
    return score;
  };

  // Create character
  const handleCreateCharacter = () => {
    const finalStats = computeFinalStats();
    
    // Build equipment list
    const finalEquipment: Equipment[] = [...selectedEquipment];
    
    // Add item from possessions if any (only for heroes)
    if (itemFromPossessions && characterType === 'hero') {
      finalEquipment.push({
        name: itemFromPossessions,
        type: itemFromPossessions.toLowerCase().includes('weapon') ? 'melee' : 'misc',
      });
    }
    
    const character: Character = {
      id: uuidv4(),
      name: name.trim() || (characterType === 'hero' ? 'Unnamed Hero' : 'Unnamed Follower'),
      origin: selectedOrigin!,
      // Followers don't have a background - use 'Townsfolk' as placeholder for type compatibility
      background: characterType === 'hero' ? selectedBackground! : 'Townsfolk',
      characterType,
      isMystic: characterType === 'hero' && isMystic,
      stats: finalStats,
      skills: characterType === 'hero' ? skillRolls.map((sr) => sr.skill) : [],
      equipment: finalEquipment,
      xp: characterType === 'hero' ? bonusXP : 0,
      gold: characterType === 'hero' ? gold : 0,
      notes: characterType === 'follower' ? 'Follower - simplified stats' : '',
    };
    
    addCharacterToWarband(warbandId, character);
    onComplete();
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'name':
        return (
          <div>
            <h3 className="mb-lg">Name Your {characterType === 'hero' ? 'Hero' : 'Follower'}</h3>
            <div className="form-group">
              <label className="form-label">Character Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter a name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            {characterType === 'follower' && (
              <div className="card mt-lg">
                <p className="text-muted">
                  <strong>Note:</strong> Followers are always Human and have simplified stats. 
                  They don't receive background bonuses - only basic racial traits apply.
                </p>
              </div>
            )}
          </div>
        );

      case 'origin':
        return (
          <div>
            <h3 className="mb-lg">Choose Origin</h3>
            <p className="text-muted mb-lg">
              Select the racial origin of your {characterType}.
            </p>
            <div className="selection-grid">
              {origins.map((origin) => (
                <div
                  key={origin}
                  className={`selection-card ${selectedOrigin === origin ? 'selected' : ''}`}
                  onClick={() => setSelectedOrigin(origin)}
                >
                  <div className="selection-card-title">{origin}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'background':
        return (
          <div>
            <h3 className="mb-lg">Choose Background</h3>
            <p className="text-muted mb-lg">
              Select a background for your {selectedOrigin}.
            </p>
            <div className="selection-grid">
              {availableBackgrounds.map((bg) => (
                <div
                  key={bg.name}
                  className={`selection-card ${selectedBackground === bg.name ? 'selected' : ''}`}
                  onClick={() => setSelectedBackground(bg.name)}
                >
                  <div className="selection-card-title">{bg.name}</div>
                  <div className="selection-card-desc">{bg.description}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'capabilities':
        return (
          <div>
            <h3 className="mb-lg">Capabilities</h3>
            <p className="text-muted mb-lg">
              Roll to determine your {backgroundData?.name}'s capabilities.
            </p>
            
            <div className="roll-container">
              <DiceRoll
                onRoll={handleCapabilityRoll}
                label="Roll d20"
                disabled={capabilityRoll !== null}
                currentValue={capabilityRoll}
              />
              {capabilityResult && (
                <div className="roll-result" style={{ flex: 1, marginBottom: 0 }}>
                  <div className="roll-result-value">{capabilityRoll}</div>
                  <div className="roll-result-text">{capabilityResult}</div>
                </div>
              )}
            </div>

            {backgroundData?.capabilities && (
              <div className="card">
                <h4 className="mb-md">Capabilities Table</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backgroundData.capabilities.map((entry: RollTableEntry, i: number) => (
                      <tr 
                        key={i}
                        style={
                          capabilityRoll !== null &&
                          capabilityRoll >= entry.min &&
                          capabilityRoll <= entry.max
                            ? { background: 'rgba(201, 162, 39, 0.2)' }
                            : {}
                        }
                      >
                        <td>{entry.min === entry.max ? entry.min : `${entry.min}-${entry.max}`}</td>
                        <td>{entry.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'mentality':
        return (
          <div>
            <h3 className="mb-lg">Mentality</h3>
            <p className="text-muted mb-lg">
              Roll to determine your character's mental fortitude and experience.
            </p>
            
            <div className="roll-container">
              <DiceRoll
                onRoll={handleMentalityRoll}
                label="Roll d20"
                disabled={mentalityRoll !== null}
                currentValue={mentalityRoll}
              />
              {mentalityResult && (
                <div className="roll-result" style={{ flex: 1, marginBottom: 0 }}>
                  <div className="roll-result-value">{mentalityRoll}</div>
                  <div className="roll-result-text">{mentalityResult}</div>
                </div>
              )}
            </div>

            {backgroundData?.mentality && (
              <div className="card">
                <h4 className="mb-md">Mentality Table</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backgroundData.mentality.map((entry: RollTableEntry, i: number) => (
                      <tr
                        key={i}
                        style={
                          mentalityRoll !== null &&
                          mentalityRoll >= entry.min &&
                          mentalityRoll <= entry.max
                            ? { background: 'rgba(201, 162, 39, 0.2)' }
                            : {}
                        }
                      >
                        <td>{entry.min === entry.max ? entry.min : `${entry.min}-${entry.max}`}</td>
                        <td>{entry.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'possessions':
        return (
          <div>
            <h3 className="mb-lg">Possessions</h3>
            <p className="text-muted mb-lg">
              Roll to determine your starting possessions.
            </p>
            
            <div className="roll-container">
              <DiceRoll
                onRoll={handlePossessionsRoll}
                label="Roll d20"
                disabled={possessionsRoll !== null}
                currentValue={possessionsRoll}
              />
              {possessionsResult && (
                <div className="roll-result" style={{ flex: 1, marginBottom: 0 }}>
                  <div className="roll-result-value">{possessionsRoll}</div>
                  <div className="roll-result-text">{possessionsResult}</div>
                </div>
              )}
            </div>

            {backgroundData?.possessions && (
              <div className="card">
                <h4 className="mb-md">Possessions Table</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backgroundData.possessions.map((entry: RollTableEntry, i: number) => (
                      <tr
                        key={i}
                        style={
                          possessionsRoll !== null &&
                          possessionsRoll >= entry.min &&
                          possessionsRoll <= entry.max
                            ? { background: 'rgba(201, 162, 39, 0.2)' }
                            : {}
                        }
                      >
                        <td>{entry.min === entry.max ? entry.min : `${entry.min}-${entry.max}`}</td>
                        <td>{entry.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'training':
        return (
          <div>
            <h3 className="mb-lg">Training</h3>
            <p className="text-muted mb-lg">
              Roll to determine your character's training and experience.
            </p>
            
            <div className="roll-container">
              <DiceRoll
                onRoll={handleTrainingRoll}
                label="Roll d20"
                disabled={trainingRoll !== null}
                currentValue={trainingRoll}
              />
              {trainingResult && (
                <div className="roll-result" style={{ flex: 1, marginBottom: 0 }}>
                  <div className="roll-result-value">{trainingRoll}</div>
                  <div className="roll-result-text">{trainingResult}</div>
                </div>
              )}
            </div>

            {backgroundData?.training && (
              <div className="card">
                <h4 className="mb-md">Training Table</h4>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Roll</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {backgroundData.training.map((entry: RollTableEntry, i: number) => (
                      <tr
                        key={i}
                        style={
                          trainingRoll !== null &&
                          trainingRoll >= entry.min &&
                          trainingRoll <= entry.max
                            ? { background: 'rgba(201, 162, 39, 0.2)' }
                            : {}
                        }
                      >
                        <td>{entry.min === entry.max ? entry.min : `${entry.min}-${entry.max}`}</td>
                        <td>{entry.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'skills':
        return (
          <div>
            <h3 className="mb-lg">Skills</h3>
            
            {skillsToRoll === 0 ? (
              <div className="card">
                <p className="text-muted text-center">
                  Your training did not grant any skill rolls. You received bonus XP instead.
                </p>
              </div>
            ) : (
              <>
                <p className="text-muted mb-lg">
                  You have {skillsToRoll} skill(s) to roll. Roll d100 for each skill.
                </p>
                
                <div className="mb-lg">
                  <button
                    className="btn btn-primary"
                    onClick={handleSkillRoll}
                    disabled={skillRolls.length >= skillsToRoll}
                  >
                    Roll for Skill ({skillRolls.length}/{skillsToRoll})
                  </button>
                </div>

                {skillRolls.length > 0 && (
                  <div className="card">
                    <h4 className="mb-md">Rolled Skills</h4>
                    {skillRolls.map((sr, i) => (
                      <div key={i} className="roll-result">
                        <div className="roll-result-value">{sr.roll}</div>
                        <div className="roll-result-text">{sr.skill}</div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case 'equipment':
        // Calculate current selections for limit enforcement
        const qualityWeaponsSelected = selectedEquipment.filter(
          (e) => equipmentData.heroStarterKit.qualityWeapons.find((w) => w.name === e.name)
        ).length;
        const basicWeaponsSelected = selectedEquipment.filter(
          (e) => equipmentData.heroStarterKit.basicWeapons.find((w) => w.name === e.name)
        ).length;
        const bodyArmorSelected = selectedEquipment.filter(
          (e) => ['Partial armor', 'Light armor', 'Full armor'].includes(e.name)
        ).length;
        const helmetsSelected = selectedEquipment.filter(
          (e) => e.name === 'Helmet'
        ).length;
        const shieldsSelected = selectedEquipment.filter(
          (e) => e.name === 'Shield'
        ).length;
        
        // Follower limits
        const followerWeaponsSelected = selectedEquipment.filter(
          (e) => e.type === 'melee' || e.type === 'ranged'
        ).length;
        const followerArmorSelected = selectedEquipment.filter(
          (e) => e.type === 'armor'
        ).length;

        return (
          <div>
            <h3 className="mb-lg">Equipment</h3>
            <p className="text-muted mb-lg">
              {characterType === 'hero'
                ? 'As a hero, select your starting equipment from the hero starter kit.'
                : 'Select equipment this follower brings (limited selection).'}
            </p>

            {characterType === 'hero' && (
              <>
                <h4 className="mb-md">Quality Weapons (select up to 2)</h4>
                <p className="text-small text-muted mb-md">Selected: {qualityWeaponsSelected}/2</p>
                <div className="selection-grid mb-lg">
                  {equipmentData.heroStarterKit.qualityWeapons.map((weapon) => {
                    const isSelected = selectedEquipment.find((e) => e.name === weapon.name);
                    const isDisabled = !isSelected && qualityWeaponsSelected >= 2;
                    return (
                      <div
                        key={weapon.name}
                        className={`selection-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => {
                          if (isDisabled) return;
                          toggleEquipment(weapon);
                        }}
                        style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        <div className="selection-card-title">{weapon.name}</div>
                        <div className="selection-card-desc">{weapon.type}</div>
                      </div>
                    );
                  })}
                </div>

                <h4 className="mb-md">Basic Weapons (select up to 2)</h4>
                <p className="text-small text-muted mb-md">Selected: {basicWeaponsSelected}/2</p>
                <div className="selection-grid mb-lg">
                  {equipmentData.heroStarterKit.basicWeapons.map((weapon) => {
                    const isSelected = selectedEquipment.find((e) => e.name === weapon.name);
                    const isDisabled = !isSelected && basicWeaponsSelected >= 2;
                    return (
                      <div
                        key={weapon.name}
                        className={`selection-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => {
                          if (isDisabled) return;
                          toggleEquipment(weapon);
                        }}
                        style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        <div className="selection-card-title">{weapon.name}</div>
                        <div className="selection-card-desc">{weapon.type}</div>
                      </div>
                    );
                  })}
                </div>

                <h4 className="mb-md">Body Armor (select up to 1)</h4>
                <p className="text-small text-muted mb-md">Selected: {bodyArmorSelected}/1</p>
                <div className="selection-grid mb-lg">
                  {equipmentData.armorItems.filter(a => ['Partial armor', 'Light armor', 'Full armor'].includes(a.name)).map((armor) => {
                    const isSelected = selectedEquipment.find((e) => e.name === armor.name);
                    const isDisabled = !isSelected && bodyArmorSelected >= 1;
                    return (
                      <div
                        key={armor.name}
                        className={`selection-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => {
                          if (isDisabled) return;
                          toggleEquipment(armor);
                        }}
                        style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        <div className="selection-card-title">{armor.name}</div>
                      </div>
                    );
                  })}
                </div>

                <h4 className="mb-md">Accessories</h4>
                <div className="selection-grid">
                  {/* Helmet - max 1 */}
                  {equipmentData.armorItems.filter(a => a.name === 'Helmet').map((armor) => {
                    const isSelected = selectedEquipment.find((e) => e.name === armor.name);
                    const isDisabled = !isSelected && helmetsSelected >= 1;
                    return (
                      <div
                        key={armor.name}
                        className={`selection-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => {
                          if (isDisabled) return;
                          toggleEquipment(armor);
                        }}
                        style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        <div className="selection-card-title">{armor.name}</div>
                        <div className="selection-card-desc">Max: 1</div>
                      </div>
                    );
                  })}
                  {/* Shield - max 1 */}
                  {equipmentData.armorItems.filter(a => a.name === 'Shield').map((armor) => {
                    const isSelected = selectedEquipment.find((e) => e.name === armor.name);
                    const isDisabled = !isSelected && shieldsSelected >= 1;
                    return (
                      <div
                        key={armor.name}
                        className={`selection-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => {
                          if (isDisabled) return;
                          toggleEquipment(armor);
                        }}
                        style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        <div className="selection-card-title">{armor.name}</div>
                        <div className="selection-card-desc">Max: 1</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {characterType === 'follower' && (
              <>
                <h4 className="mb-md">Weapons (select up to 1)</h4>
                <p className="text-small text-muted mb-md">Selected: {followerWeaponsSelected}/1</p>
                <div className="selection-grid mb-lg">
                  {equipmentData.heroStarterKit.basicWeapons.map((weapon) => {
                    const isSelected = selectedEquipment.find((e) => e.name === weapon.name);
                    const isDisabled = !isSelected && followerWeaponsSelected >= 1;
                    return (
                      <div
                        key={weapon.name}
                        className={`selection-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => {
                          if (isDisabled) return;
                          toggleEquipment(weapon);
                        }}
                        style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        <div className="selection-card-title">{weapon.name}</div>
                        <div className="selection-card-desc">{weapon.type}</div>
                      </div>
                    );
                  })}
                </div>

                <h4 className="mb-md">Armor (select up to 1)</h4>
                <p className="text-small text-muted mb-md">Selected: {followerArmorSelected}/1</p>
                <div className="selection-grid">
                  {equipmentData.armorItems.filter(a => ['Partial armor', 'Light armor'].includes(a.name)).map((armor) => {
                    const isSelected = selectedEquipment.find((e) => e.name === armor.name);
                    const isDisabled = !isSelected && followerArmorSelected >= 1;
                    return (
                      <div
                        key={armor.name}
                        className={`selection-card ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                        onClick={() => {
                          if (isDisabled) return;
                          toggleEquipment(armor);
                        }}
                        style={isDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        <div className="selection-card-title">{armor.name}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {selectedEquipment.length > 0 && (
              <div className="card mt-lg">
                <h4 className="mb-md">Selected Equipment</h4>
                <ul className="equipment-list">
                  {selectedEquipment.map((item, i) => (
                    <li key={i} className="equipment-item">
                      {item.name}
                      <span className="tag tag-copper" style={{ marginLeft: '0.5rem' }}>
                        {item.type}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );

      case 'summary':
        const finalStats = computeFinalStats();
        const armorScore = calculateArmorScore();
        return (
          <div>
            <h3 className="mb-lg">Character Summary</h3>
            
            <div className="card mb-lg">
              <div className="flex justify-between items-center mb-md">
                <h4 className="text-gold">{name || (characterType === 'hero' ? 'Unnamed Hero' : 'Unnamed Follower')}</h4>
                <div className="flex gap-sm">
                  <span className="tag tag-gold">{selectedOrigin}</span>
                  {characterType === 'hero' && selectedBackground && (
                    <span className="tag tag-copper">{selectedBackground}</span>
                  )}
                </div>
              </div>

              <div className="divider" />

              <h5 className="mb-sm">Stats</h5>
              <div className="stat-grid mb-lg">
                <div className="stat-box">
                  <div className="stat-value">{finalStats.agility}</div>
                  <div className="stat-label">Agility</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{finalStats.combatSkill}</div>
                  <div className="stat-label">Combat</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{finalStats.speedBase}/{finalStats.dashBonus}</div>
                  <div className="stat-label">Speed</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{finalStats.toughness}</div>
                  <div className="stat-label">Toughness</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{armorScore}</div>
                  <div className="stat-label">Armor</div>
                </div>
                {isMystic && (
                  <div className="stat-box">
                    <div className="stat-value">{finalStats.casting}</div>
                    <div className="stat-label">Casting</div>
                  </div>
                )}
              </div>

              {characterType === 'hero' && (
                <>
                  <div className="grid-2 mb-lg">
                    <div className="stat-box">
                      <div className="stat-value">{finalStats.will}</div>
                      <div className="stat-label">Will</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{finalStats.luck}</div>
                      <div className="stat-label">Luck</div>
                    </div>
                  </div>

                  <div className="grid-2 mb-lg">
                    <div className="stat-box">
                      <div className="stat-value">{bonusXP}</div>
                      <div className="stat-label">Starting XP</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-value">{gold}</div>
                      <div className="stat-label">Gold</div>
                    </div>
                  </div>
                </>
              )}

              {skillRolls.length > 0 && (
                <>
                  <h5 className="mb-sm">Skills</h5>
                  <ul className="equipment-list mb-lg">
                    {skillRolls.map((sr, i) => (
                      <li key={i} className="equipment-item">
                        {sr.skill}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h5 className="mb-sm">Equipment</h5>
              <ul className="equipment-list">
                {selectedEquipment.map((item, i) => (
                  <li key={i} className="equipment-item">
                    {item.name}
                  </li>
                ))}
                {itemFromPossessions && (
                  <li className="equipment-item">{itemFromPossessions}</li>
                )}
                {selectedEquipment.length === 0 && !itemFromPossessions && (
                  <li className="equipment-item text-muted">No equipment</li>
                )}
              </ul>
            </div>
          </div>
        );
    }
  };

  // Determine if we can proceed to the next step
  const canProceed = () => {
    // For followers, simplified flow
    if (characterType === 'follower') {
      switch (currentStep) {
        case 'name':
          return true; // Name is optional
        case 'equipment':
          return true;
        case 'summary':
          return true;
        default:
          return true;
      }
    }
    
    // For heroes, full flow
    switch (currentStep) {
      case 'name':
        return true; // Name is optional
      case 'origin':
        return selectedOrigin !== null;
      case 'background':
        return selectedBackground !== null;
      case 'capabilities':
        return capabilityRoll !== null;
      case 'mentality':
        return mentalityRoll !== null;
      case 'possessions':
        return possessionsRoll !== null;
      case 'training':
        return trainingRoll !== null;
      case 'skills':
        return skillRolls.length >= skillsToRoll;
      case 'equipment':
        return true;
      case 'summary':
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal modal-wizard">
        <div className="modal-header">
          <h3 className="modal-title">
            Create {characterType === 'hero' ? 'Hero' : 'Follower'}
          </h3>
          <button className="btn btn-ghost btn-icon" onClick={onCancel}>
            ✕
          </button>
        </div>

        {/* Wizard Steps Indicator */}
        <div className="wizard-steps">
          {STEPS.map((step, i) => (
            <div
              key={step}
              className={`wizard-step ${
                i < currentStepIndex
                  ? 'completed'
                  : i === currentStepIndex
                  ? 'active'
                  : ''
              }`}
            >
              <div className="wizard-step-number">
                {i < currentStepIndex ? '✓' : i + 1}
              </div>
              <div className="wizard-step-label">{STEP_LABELS[step]}</div>
            </div>
          ))}
        </div>

        <div className="modal-body" style={{ minHeight: '400px' }}>
          {renderStepContent()}
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          
          {currentStepIndex > 0 && (
            <button className="btn btn-secondary" onClick={goToPrevStep}>
              Back
            </button>
          )}
          
          {currentStep === 'summary' ? (
            <button
              className="btn btn-primary"
              onClick={handleCreateCharacter}
            >
              Create {characterType === 'hero' ? 'Hero' : 'Follower'}
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={goToNextStep}
              disabled={!canProceed()}
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
