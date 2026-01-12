import { Link, useLocation } from 'react-router-dom';

export function Header() {
  const location = useLocation();

  return (
    <header className="app-header">
      <div className="app-header-content">
        <Link to="/" className="app-logo">
          ⚔ Five Leagues Roster
        </Link>
        <nav className="app-nav">
          <Link 
            to="/" 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
          >
            Warbands
          </Link>
        </nav>
      </div>
    </header>
  );
}

