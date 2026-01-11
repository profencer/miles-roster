import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { WarbandList } from './pages/WarbandList';
import { WarbandRoster } from './pages/WarbandRoster';
import { ExportRoster } from './pages/ExportRoster';

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<WarbandList />} />
        <Route path="/warband/:id" element={<WarbandRoster />} />
        <Route path="/warband/:id/export" element={<ExportRoster />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
