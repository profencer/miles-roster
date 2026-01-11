import type { Character } from '../types';

interface CharacterCardProps {
  character: Character;
  onView: () => void;
  onDelete: () => void;
}

export function CharacterCard({ character, onView, onDelete }: CharacterCardProps) {
  return (
    <div className="character-card">
      <div className="character-card-header">
        <div>
          <h4 className="character-name">{character.name}</h4>
          <p className="character-subtitle">
            {character.origin} {character.background}
          </p>
        </div>
        <span className="tag tag-gold">
          {character.characterType === 'hero' ? 'Hero' : 'Follower'}
        </span>
      </div>
      
      <div className="character-card-body">
        <div className="stat-grid mb-md">
          <div className="stat-box">
            <div className="stat-value">{character.stats.agility}</div>
            <div className="stat-label">AGI</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{character.stats.combatSkill}</div>
            <div className="stat-label">CS</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{character.stats.speedBase}</div>
            <div className="stat-label">SPD</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{character.stats.toughness}</div>
            <div className="stat-label">TGH</div>
          </div>
        </div>

        {character.skills.length > 0 && (
          <div className="mb-md">
            <p className="text-small text-muted mb-sm">Skills:</p>
            <div className="flex flex-wrap gap-sm">
              {character.skills.slice(0, 3).map((skill, i) => (
                <span key={i} className="tag">
                  {skill.split('–')[0].trim()}
                </span>
              ))}
              {character.skills.length > 3 && (
                <span className="tag">+{character.skills.length - 3}</span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-sm text-small text-muted">
          <span>XP: {character.xp}</span>
          <span>•</span>
          <span>Gold: {character.gold}</span>
          {character.isMystic && (
            <>
              <span>•</span>
              <span className="text-gold">Mystic</span>
            </>
          )}
        </div>
      </div>

      <div className="character-card-footer">
        <button className="btn btn-ghost btn-sm" onClick={onView}>
          View
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onDelete}>
          Remove
        </button>
      </div>
    </div>
  );
}

