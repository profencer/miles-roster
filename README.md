# Five Leagues from the Borderlands - Roster Manager

A web application for managing warbands in Five Leagues from the Borderlands (3rd Edition).

## Features

- **Warband Management**: Create, edit, and delete warbands with customizable hero limits
- **Character Creation Wizard**: Step-by-step character creation with:
  - Origin selection (Human, Fey-blood, Dusklings, Feral, Halflings, Preen)
  - Background selection (Townsfolk, Zealot, Frontier, Mystic, Noble)
  - Dice rolling for capabilities, mentality, possessions, and training
  - Skill assignment from the skill tables
  - Equipment allocation with hero starter kit
- **Roster Export**: Export warbands as PDF or CSV files
- **Local Storage**: All data persists in your browser's local storage

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Create a Warband**: Click "Create Warband" on the home page, enter a name and maximum hero count
2. **Add Heroes/Followers**: From the warband roster page, click "Add Hero" or "Add Follower"
3. **Character Creation**: Follow the wizard through:
   - Naming your character
   - Selecting origin and background
   - Rolling for capabilities, mentality, possessions, and training
   - Rolling for skills (if applicable)
   - Selecting equipment
4. **Export**: Click "Export Roster" to download as PDF or CSV

## Tech Stack

- React 19
- TypeScript
- React Router
- jsPDF (for PDF export)
- Vite (build tool)

## Data Storage

All warband data is stored in your browser's localStorage under the key `five_leagues_warbands`. This means:
- Data persists between sessions
- Data is local to your browser/device
- Clearing browser data will remove your warbands

## License

This is a fan project for Five Leagues from the Borderlands by Nordic Weasel Games.
