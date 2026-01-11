import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { loadWarbands, createWarband, deleteWarband } from '../utils/storage';
import type { Warband } from '../types';

export function WarbandList() {
  const [warbands, setWarbands] = useState<Warband[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWarbandName, setNewWarbandName] = useState('');
  const [newWarbandMaxHeroes, setNewWarbandMaxHeroes] = useState(10);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setWarbands(loadWarbands());
  }, []);

  const handleCreateWarband = () => {
    if (!newWarbandName.trim()) return;

    const warband = createWarband(newWarbandName.trim(), newWarbandMaxHeroes);
    setWarbands((prev) => [...prev, warband]);
    setNewWarbandName('');
    setNewWarbandMaxHeroes(10);
    setIsCreateModalOpen(false);
  };

  const handleDeleteWarband = (id: string) => {
    deleteWarband(id);
    setWarbands((prev) => prev.filter((w) => w.id !== id));
    setDeleteConfirmId(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="page">
      <div className="container">
        <div className="flex justify-between items-center mb-xl">
          <h1>Your Warbands</h1>
          <button
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            + Create Warband
          </button>
        </div>

        {warbands.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">⚔️</div>
              <h3 className="empty-state-title">No Warbands Yet</h3>
              <p className="empty-state-text">
                Create your first warband to begin your adventure in the borderlands.
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Your First Warband
              </button>
            </div>
          </div>
        ) : (
          <div className="grid-auto">
            {warbands.map((warband) => (
              <div key={warband.id} className="card">
                <div className="card-header">
                  <h3 className="card-title">{warband.name}</h3>
                  <span className="tag tag-gold">
                    {warband.heroes.length}/{warband.maxHeroes} Heroes
                  </span>
                </div>
                
                <div className="stat-grid mb-lg">
                  <div className="stat-box">
                    <div className="stat-value">{warband.heroes.length}</div>
                    <div className="stat-label">Heroes</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">{warband.followers.length}</div>
                    <div className="stat-label">Followers</div>
                  </div>
                </div>

                <p className="text-small text-muted mb-md">
                  Created: {formatDate(warband.createdAt)}
                </p>

                <div className="flex gap-sm">
                  <Link
                    to={`/warband/${warband.id}`}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    View Roster
                  </Link>
                  <button
                    className="btn btn-danger btn-icon"
                    onClick={() => setDeleteConfirmId(warband.id)}
                    title="Delete Warband"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Warband Modal */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create New Warband"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleCreateWarband}
                disabled={!newWarbandName.trim()}
              >
                Create Warband
              </button>
            </>
          }
        >
          <div className="form-group">
            <label className="form-label">Warband Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="Enter warband name..."
              value={newWarbandName}
              onChange={(e) => setNewWarbandName(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Maximum Heroes</label>
            <input
              type="number"
              className="form-input"
              min={1}
              max={20}
              value={newWarbandMaxHeroes}
              onChange={(e) => setNewWarbandMaxHeroes(parseInt(e.target.value) || 10)}
            />
            <p className="text-small text-muted mt-sm">
              The maximum number of heroes this warband can have.
            </p>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Warband"
          footer={
            <>
              <button
                className="btn btn-secondary"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={() => deleteConfirmId && handleDeleteWarband(deleteConfirmId)}
              >
                Delete Forever
              </button>
            </>
          }
        >
          <p>
            Are you sure you want to delete this warband? This action cannot be
            undone and all heroes and followers will be lost.
          </p>
        </Modal>
      </div>
    </div>
  );
}

