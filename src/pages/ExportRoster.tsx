import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { getWarband } from '../utils/storage';
import type { Warband, Character } from '../types';

export function ExportRoster() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [warband, setWarband] = useState<Warband | null>(null);

  useEffect(() => {
    if (id) {
      const wb = getWarband(id);
      if (wb) {
        setWarband(wb);
      } else {
        navigate('/');
      }
    }
  }, [id, navigate]);

  const exportToCSV = () => {
    if (!warband) return;

    const headers = [
      'Name',
      'Type',
      'Origin',
      'Background',
      'Agility',
      'Combat Skill',
      'Speed',
      'Toughness',
      'Will',
      'Luck',
      'XP',
      'Gold',
      'Skills',
      'Equipment',
    ];

    const rows = [...warband.heroes, ...warband.followers].map((char) => [
      char.name,
      char.characterType,
      char.origin,
      char.background,
      char.stats.agility.toString(),
      char.stats.combatSkill.toString(),
      `${char.stats.speedBase}/${char.stats.dashBonus}`,
      char.stats.toughness.toString(),
      char.stats.will.toString(),
      char.stats.luck.toString(),
      char.xp.toString(),
      char.gold.toString(),
      char.skills.map((s) => s.split('–')[0].trim()).join('; '),
      char.equipment.map((e) => e.name).join('; '),
    ]);

    const csvContent = [
      `Warband: ${warband.name}`,
      '',
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${warband.name.replace(/\s+/g, '_')}_roster.csv`;
    link.click();
  };

  const exportToPDF = () => {
    if (!warband) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;

    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(warband.name, pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Five Leagues from the Borderlands - Warband Roster', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Warband Summary', 14, yPos);
    yPos += 7;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Heroes: ${warband.heroes.length}/${warband.maxHeroes}`, 14, yPos);
    doc.text(`Followers: ${warband.followers.length}`, 80, yPos);
    yPos += 5;

    const totalGold = [...warband.heroes, ...warband.followers].reduce((sum, c) => sum + c.gold, 0);
    const totalXP = warband.heroes.reduce((sum, h) => sum + h.xp, 0);
    doc.text(`Total XP: ${totalXP}`, 14, yPos);
    doc.text(`Total Gold: ${totalGold}`, 80, yPos);
    yPos += 15;

    // Character function
    const addCharacter = (char: Character, index: number) => {
      // Check if we need a new page
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }

      // Character header
      doc.setFillColor(240, 240, 240);
      doc.rect(14, yPos - 5, pageWidth - 28, 8, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${char.name}`, 16, yPos);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const typeText = `${char.origin} ${char.background} (${char.characterType})`;
      doc.text(typeText, pageWidth - 16, yPos, { align: 'right' });
      yPos += 10;

      // Stats row
      doc.setFontSize(9);
      const stats = [
        `AGI: ${char.stats.agility}`,
        `CS: ${char.stats.combatSkill}`,
        `SPD: ${char.stats.speedBase}/${char.stats.dashBonus}`,
        `TGH: ${char.stats.toughness}`,
        `WILL: ${char.stats.will}`,
        `LUCK: ${char.stats.luck}`,
      ];
      if (char.isMystic) {
        stats.push(`CAST: ${char.stats.casting}`);
      }
      doc.text(stats.join('   |   '), 16, yPos);
      yPos += 6;

      // XP and Gold
      doc.text(`XP: ${char.xp}   |   Gold: ${char.gold}`, 16, yPos);
      yPos += 6;

      // Skills
      if (char.skills.length > 0) {
        doc.setFont('helvetica', 'italic');
        const skillNames = char.skills.map((s) => s.split('–')[0].trim()).join(', ');
        doc.text(`Skills: ${skillNames}`, 16, yPos);
        yPos += 6;
      }

      // Equipment
      if (char.equipment.length > 0) {
        doc.setFont('helvetica', 'normal');
        const equipNames = char.equipment.map((e) => e.name).join(', ');
        const lines = doc.splitTextToSize(`Equipment: ${equipNames}`, pageWidth - 32);
        doc.text(lines, 16, yPos);
        yPos += lines.length * 5;
      }

      yPos += 8;
    };

    // Heroes section
    if (warband.heroes.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Heroes', 14, yPos);
      yPos += 8;

      warband.heroes.forEach((hero, i) => addCharacter(hero, i));
    }

    // Followers section
    if (warband.followers.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Followers', 14, yPos);
      yPos += 8;

      warband.followers.forEach((follower, i) => addCharacter(follower, i));
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Generated by Five Leagues Roster Manager - Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }

    doc.save(`${warband.name.replace(/\s+/g, '_')}_roster.pdf`);
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

  const allCharacters = [...warband.heroes, ...warband.followers];

  return (
    <div className="page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="mb-lg">
          <Link to={`/warband/${warband.id}`} className="text-muted">
            ← Back to Roster
          </Link>
        </div>

        <h1 className="mb-lg">Export Roster</h1>

        <div className="grid-2 mb-xl">
          <div className="card">
            <h3 className="card-title mb-md">Export as PDF</h3>
            <p className="text-muted mb-lg">
              Generate a printable PDF roster sheet with all character details,
              stats, and equipment.
            </p>
            <button className="btn btn-primary" onClick={exportToPDF}>
              Download PDF
            </button>
          </div>

          <div className="card">
            <h3 className="card-title mb-md">Export as CSV</h3>
            <p className="text-muted mb-lg">
              Export roster data as a CSV file for use in spreadsheets or other
              applications.
            </p>
            <button className="btn btn-secondary" onClick={exportToCSV}>
              Download CSV
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Roster Preview</h3>
            <span className="text-muted">{allCharacters.length} characters</span>
          </div>

          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Origin</th>
                  <th>Background</th>
                  <th>AGI</th>
                  <th>CS</th>
                  <th>SPD</th>
                  <th>TGH</th>
                  <th>XP</th>
                  <th>Gold</th>
                </tr>
              </thead>
              <tbody>
                {allCharacters.map((char) => (
                  <tr key={char.id}>
                    <td>
                      <strong>{char.name}</strong>
                    </td>
                    <td>
                      <span className={`tag ${char.characterType === 'hero' ? 'tag-gold' : ''}`}>
                        {char.characterType}
                      </span>
                    </td>
                    <td>{char.origin}</td>
                    <td>{char.background}</td>
                    <td>{char.stats.agility}</td>
                    <td>{char.stats.combatSkill}</td>
                    <td>{char.stats.speedBase}/{char.stats.dashBonus}</td>
                    <td>{char.stats.toughness}</td>
                    <td>{char.xp}</td>
                    <td>{char.gold}</td>
                  </tr>
                ))}
                {allCharacters.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center text-muted">
                      No characters in this warband yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

