import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { CharacterCreationWizard } from '../components/CharacterCreationWizard';
import { CharacterCard } from '../components/CharacterCard';
import { getWarband, updateWarband, removeCharacterFromWarband } from '../utils/storage';
import type { Warband, Character, CharacterType } from '../types';

export function WarbandRoster() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [warband, setWarband] = useState<Warband | null>(null);
  const [isCreatingCharacter, setIsCreatingCharacter] = useState(false);
  const [characterTypeToCreate, setCharacterTypeToCreate] = useState<CharacterType>('hero');
  const [isEditingWarband, setIsEditingWarband] = useState(false);
  const [editName, setEditName] = useState('');
  const [editMaxHeroes, setEditMaxHeroes] = useState(10);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [deleteCharacterId, setDeleteCharacterId] = useState<{ id: string; type: CharacterType } | null>(null);

  useEffect(() => {
    if (id) {
      const wb = getWarband(id);
      if (wb) {
        setWarband(wb);
        setEditName(wb.name);
        setEditMaxHeroes(wb.maxHeroes);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  const refreshWarband = () => {
    if (id) {
      const wb = getWarband(id);
      if (wb) setWarband(wb);
    }
  };

  const handleUpdateWarband = () => {
    if (!warband || !editName.trim()) return;

    const updated = {
      ...warband,
      name: editName.trim(),
      maxHeroes: editMaxHeroes,
    };
    updateWarband(updated);
    setWarband(updated);
    setIsEditingWarband(false);
  };

  const handleDeleteCharacter = () => {
    if (!id || !deleteCharacterId) return;
    removeCharacterFromWarband(id, deleteCharacterId.id, deleteCharacterId.type);
    refreshWarband();
    setDeleteCharacterId(null);
  };

  const handleCharacterCreated = () => {
    refreshWarband();
    setIsCreatingCharacter(false);
  };

  const startCreateCharacter = (type: CharacterType) => {
    setCharacterTypeToCreate(type);
    setIsCreatingCharacter(true);
  };

  if (!warband) {
    return (
      <div className="page">
        <div className="container">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const canAddHero = warband.heroes.length < warband.maxHeroes;

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="mb-lg">
          <Link to="/" className="text-muted">
            ← Back to Warbands
          </Link>
        </div>

        {/* Header */}
        <div className="page-header mb-xl">
          <div className="page-header-text">
            <h1>{warband.name}</h1>
            <p className="text-secondary">
              {warband.heroes.length} Heroes • {warband.followers.length} Followers
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={() => setIsEditingWarband(true)}
          >
            Edit Warband
          </button>
        </div>

        {/* Stats Overview */}
        <div className="card mb-xl">
          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-value">
                {warband.heroes.length}/{warband.maxHeroes}
              </div>
              <div className="stat-label">Heroes</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{warband.followers.length}</div>
              <div className="stat-label">Followers</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">
                {warband.heroes.reduce((sum, h) => sum + h.xp, 0)}
              </div>
              <div className="stat-label">Total XP</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">
                {warband.heroes.reduce((sum, h) => sum + h.gold, 0) +
                  warband.followers.reduce((sum, f) => sum + f.gold, 0)}
              </div>
              <div className="stat-label">Gold</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons mb-xl">
          <button
            className="btn btn-primary"
            onClick={() => startCreateCharacter('hero')}
            disabled={!canAddHero}
          >
            + Add Hero
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => startCreateCharacter('follower')}
          >
            + Add Follower
          </button>
          <Link
            to={`/warband/${warband.id}/export`}
            className="btn btn-secondary"
          >
            Export
          </Link>
        </div>

        {!canAddHero && (
          <p className="text-warning text-small mb-lg">
            ⚠ Maximum heroes reached. Remove a hero or increase the limit to add more.
          </p>
        )}

        {/* Heroes Section */}
        <div className="divider-ornate">
          <span>Heroes</span>
        </div>

        {warband.heroes.length === 0 ? (
          <div className="card mb-xl">
            <div className="empty-state">
              <div className="empty-state-icon">🗡️</div>
              <h3 className="empty-state-title">No Heroes Yet</h3>
              <p className="empty-state-text">
                Add your first hero to build your warband.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => startCreateCharacter('hero')}
                disabled={!canAddHero}
              >
                Add First Hero
              </button>
            </div>
          </div>
        ) : (
          <div className="grid-auto mb-xl">
            {warband.heroes.map((hero) => (
              <CharacterCard
                key={hero.id}
                character={hero}
                onView={() => setSelectedCharacter(hero)}
                onDelete={() =>
                  setDeleteCharacterId({ id: hero.id, type: 'hero' })
                }
              />
            ))}
          </div>
        )}

        {/* Followers Section */}
        <div className="divider-ornate">
          <span>Followers</span>
        </div>

        {warband.followers.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3 className="empty-state-title">No Followers Yet</h3>
              <p className="empty-state-text">
                Followers can assist your heroes on their adventures.
              </p>
              <button
                className="btn btn-secondary"
                onClick={() => startCreateCharacter('follower')}
              >
                Add Follower
              </button>
            </div>
          </div>
        ) : (
          <div className="grid-auto">
            {warband.followers.map((follower) => (
              <CharacterCard
                key={follower.id}
                character={follower}
                onView={() => setSelectedCharacter(follower)}
                onDelete={() =>
                  setDeleteCharacterId({ id: follower.id, type: 'follower' })
                }
              />
            ))}
          </div>
        )}

        {/* Edit Warband Modal */}
        <Modal
          isOpen={isEditingWarband}
          onClose={() => setIsEditingWarband(false)}
          title="Edit Warband"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setIsEditingWarband(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpdateWarband}
                disabled={!editName.trim()}
              >
                Save Changes
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Warband Name</label>
            <input
              type="text"
              className="form-input"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Maximum Heroes</label>
            <input
              type="number"
              className="form-input"
              min={warband.heroes.length}
              max={20}
              value={editMaxHeroes}
              onChange={(e) => setEditMaxHeroes(parseInt(e.target.value) || 10)}
            />
          </div>
        </Modal>

        {/* Character Creation Wizard */}
        {isCreatingCharacter && id && (
          <CharacterCreationWizard
            warbandId={id}
            characterType={characterTypeToCreate}
            onComplete={handleCharacterCreated}
            onCancel={() => setIsCreatingCharacter(false)}
          />
        )}

        {/* View Character Modal */}
        <Modal
          isOpen={!!selectedCharacter}
          onClose={() => setSelectedCharacter(null)}
          title={selectedCharacter?.name ?? 'Character'}
        >
          {selectedCharacter && (
            <div>
              <div className="flex gap-sm mb-md">
                <span className="tag tag-gold">{selectedCharacter.origin}</span>
                {selectedCharacter.characterType === 'hero' && (
                  <span className="tag tag-copper">{selectedCharacter.background}</span>
                )}
                {selectedCharacter.isMystic && (
                  <span className="tag">Mystic</span>
                )}
              </div>

              <h4 className="mb-sm">Stats</h4>
              <div className="stat-grid mb-lg">
                <div className="stat-box">
                  <div className="stat-value">{selectedCharacter.stats.agility}</div>
                  <div className="stat-label">Agility</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{selectedCharacter.stats.combatSkill}</div>
                  <div className="stat-label">Combat</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">
                    {selectedCharacter.stats.speedBase}/{selectedCharacter.stats.dashBonus}
                  </div>
                  <div className="stat-label">Speed</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{selectedCharacter.stats.toughness}</div>
                  <div className="stat-label">Toughness</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">
                    {(() => {
                      let score = 0;
                      selectedCharacter.equipment.forEach((item) => {
                        if (item.name === 'Partial armor') score += 1;
                        if (item.name === 'Light armor') score += 2;
                        if (item.name === 'Full armor') score += 3;
                        if (item.name === 'Helmet') score += 1;
                        if (item.name === 'Shield') score += 1;
                      });
                      return score;
                    })()}
                  </div>
                  <div className="stat-label">Armor</div>
                </div>
                {selectedCharacter.isMystic && (
                  <div className="stat-box">
                    <div className="stat-value">{selectedCharacter.stats.casting}</div>
                    <div className="stat-label">Casting</div>
                  </div>
                )}
              </div>

              {selectedCharacter.characterType === 'hero' && (
                <div className="grid-2 mb-lg">
                  <div className="stat-box">
                    <div className="stat-value">{selectedCharacter.stats.will}</div>
                    <div className="stat-label">Will</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{selectedCharacter.stats.luck}</div>
                    <div className="stat-label">Luck</div>
                  </div>
                </div>
              )}

              {selectedCharacter.skills.length > 0 && (
                <>
                  <h4 className="mb-sm">Skills</h4>
                  <ul className="equipment-list mb-lg">
                    {selectedCharacter.skills.map((skill, i) => (
                      <li key={i} className="equipment-item">
                        {skill}
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h4 className="mb-sm">Equipment</h4>
              <ul className="equipment-list mb-lg">
                {selectedCharacter.equipment.map((item, i) => (
                  <li key={i} className="equipment-item">
                    {item.name}
                    <span className="tag tag-copper" style={{ marginLeft: '0.5rem' }}>
                      {item.type}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="grid-2">
                <div className="stat-box">
                  <div className="stat-value">{selectedCharacter.xp}</div>
                  <div className="stat-label">XP</div>
                </div>
                <div className="stat-box">
                  <div className="stat-value">{selectedCharacter.gold}</div>
                  <div className="stat-label">Gold</div>
                </div>
              </div>

              {selectedCharacter.notes && (
                <>
                  <h4 className="mb-sm mt-lg">Notes</h4>
                  <p className="text-secondary">{selectedCharacter.notes}</p>
                </>
              )}
            </div>
          )}
        </Modal>

        {/* Delete Character Confirmation */}
        <Modal
          isOpen={!!deleteCharacterId}
          onClose={() => setDeleteCharacterId(null)}
          title="Delete Character"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteCharacterId(null)}
              >
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteCharacter}>
                Delete
              </button>
            </>
          }
        >
          <p>
            Are you sure you want to remove this character from the warband?
            This action cannot be undone.
          </p>
        </Modal>
      </div>
    </div>
  );
}

