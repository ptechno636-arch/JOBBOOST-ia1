// pdf.js
// Génère un CV A4 en PDF avec jsPDF. Deux modèles : "classic" et "modern".
// Ne fonctionne qu'à partir des données réellement fournies par
// l'utilisateur/Gemini — aucune donnée n'est inventée ici.

const PDF_MARGIN = 15;
const PDF_WIDTH = 210; // A4 mm
const PDF_USABLE_WIDTH = PDF_WIDTH - PDF_MARGIN * 2;

function safeText(value) {
  return (value && String(value).trim()) ? String(value).trim() : '';
}

function addWrappedText(doc, text, x, y, maxWidth, lineHeight = 5.2) {
  if (!text) return y;
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function checkPageBreak(doc, y, needed = 20) {
  if (y + needed > 285) {
    doc.addPage();
    return PDF_MARGIN;
  }
  return y;
}

/** MODEL 1 — Classique professionnel : noir/blanc sobre, une colonne. */
function renderClassicTemplate(doc, cv) {
  let y = PDF_MARGIN;
  const p = cv.personal || {};

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(17, 24, 39);
  doc.text(safeText(p.fullName) || '[Information manquante]', PDF_MARGIN, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text(safeText(p.jobTitle), PDF_MARGIN, y);
  y += 7;

  doc.setFontSize(9.5);
  doc.setTextColor(107, 114, 128);
  const contactLine = [p.email, p.phone, p.location, p.linkedin].filter(Boolean).join('   |   ');
  y = addWrappedText(doc, contactLine, PDF_MARGIN, y, PDF_USABLE_WIDTH, 4.5);
  y += 4;

  doc.setDrawColor(229, 231, 235);
  doc.line(PDF_MARGIN, y, PDF_WIDTH - PDF_MARGIN, y);
  y += 8;

  function sectionTitle(title) {
    y = checkPageBreak(doc, y, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text(title.toUpperCase(), PDF_MARGIN, y);
    y += 6;
    doc.setTextColor(17, 24, 39);
  }

  if (safeText(cv.summary)) {
    sectionTitle('Profil professionnel');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10.5);
    y = addWrappedText(doc, cv.summary, PDF_MARGIN, y, PDF_USABLE_WIDTH);
    y += 6;
  }

  if (Array.isArray(cv.experiences) && cv.experiences.length) {
    sectionTitle('Expériences professionnelles');
    cv.experiences.forEach((exp) => {
      y = checkPageBreak(doc, y, 22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(`${safeText(exp.position) || '[Information manquante]'} — ${safeText(exp.company) || '[Information manquante]'}`, PDF_MARGIN, y);
      y += 5;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(107, 114, 128);
      doc.text(`${safeText(exp.startDate)} - ${safeText(exp.endDate) || 'Présent'}`, PDF_MARGIN, y);
      doc.setTextColor(17, 24, 39);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const descriptions = Array.isArray(exp.description) ? exp.description : [exp.description].filter(Boolean);
      descriptions.forEach((d) => {
        y = checkPageBreak(doc, y, 10);
        y = addWrappedText(doc, `•  ${d}`, PDF_MARGIN, y, PDF_USABLE_WIDTH);
      });
      y += 4;
    });
  }

  if (Array.isArray(cv.education) && cv.education.length) {
    sectionTitle('Formation');
    cv.education.forEach((ed) => {
      y = checkPageBreak(doc, y, 14);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text(`${safeText(ed.degree) || '[Information manquante]'}${safeText(ed.field) ? ' — ' + ed.field : ''}`, PDF_MARGIN, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(107, 114, 128);
      doc.text(`${safeText(ed.institution)}   ${safeText(ed.startDate)} - ${safeText(ed.endDate)}`, PDF_MARGIN, y);
      doc.setTextColor(17, 24, 39);
      y += 7;
    });
  }

  if (Array.isArray(cv.skills) && cv.skills.length) {
    sectionTitle('Compétences');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    y = addWrappedText(doc, cv.skills.join('  •  '), PDF_MARGIN, y, PDF_USABLE_WIDTH);
    y += 6;
  }

  if (Array.isArray(cv.languages) && cv.languages.length) {
    sectionTitle('Langues');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    y = addWrappedText(doc, cv.languages.join('  •  '), PDF_MARGIN, y, PDF_USABLE_WIDTH);
    y += 6;
  }

  if (Array.isArray(cv.certifications) && cv.certifications.length) {
    sectionTitle('Certifications');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    y = addWrappedText(doc, cv.certifications.join('  •  '), PDF_MARGIN, y, PDF_USABLE_WIDTH);
    y += 6;
  }

  if (Array.isArray(cv.projects) && cv.projects.length) {
    sectionTitle('Projets');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    y = addWrappedText(doc, cv.projects.join('  •  '), PDF_MARGIN, y, PDF_USABLE_WIDTH);
  }
}

/** MODEL 2 — Moderne : bandeau bleu latéral avec infos + colonne principale. */
function renderModernTemplate(doc, cv) {
  const p = cv.personal || {};
  const sidebarWidth = 62;

  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, sidebarWidth, 297, 'F');

  let sy = 18;
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  sy = addWrappedText(doc, safeText(p.fullName) || '[Information manquante]', 8, sy, sidebarWidth - 16, 6);
  sy += 2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  sy = addWrappedText(doc, safeText(p.jobTitle), 8, sy, sidebarWidth - 16, 5);
  sy += 8;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTACT', 8, sy); sy += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  [p.email, p.phone, p.location, p.linkedin].filter(Boolean).forEach((line) => {
    sy = addWrappedText(doc, line, 8, sy, sidebarWidth - 16, 4.5) + 1;
  });
  sy += 6;

  if (Array.isArray(cv.skills) && cv.skills.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('COMPÉTENCES', 8, sy); sy += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    cv.skills.forEach((s) => { sy = addWrappedText(doc, `• ${s}`, 8, sy, sidebarWidth - 16, 4.5) + 0.5; });
    sy += 4;
  }

  if (Array.isArray(cv.languages) && cv.languages.length) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('LANGUES', 8, sy); sy += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    cv.languages.forEach((l) => { sy = addWrappedText(doc, `• ${l}`, 8, sy, sidebarWidth - 16, 4.5) + 0.5; });
  }

  // --- Colonne principale ---
  const mainX = sidebarWidth + 10;
  const mainWidth = PDF_WIDTH - mainX - PDF_MARGIN;
  let y = 18;
  doc.setTextColor(17, 24, 39);

  function sectionTitle(title) {
    y = checkPageBreak(doc, y, 14);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(37, 99, 235);
    doc.text(title.toUpperCase(), mainX, y);
    doc.setDrawColor(37, 99, 235);
    doc.line(mainX, y + 1.5, mainX + 20, y + 1.5);
    y += 7;
    doc.setTextColor(17, 24, 39);
  }

  if (safeText(cv.summary)) {
    sectionTitle('Profil');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    y = addWrappedText(doc, cv.summary, mainX, y, mainWidth);
    y += 6;
  }

  if (Array.isArray(cv.experiences) && cv.experiences.length) {
    sectionTitle('Expériences');
    cv.experiences.forEach((exp) => {
      y = checkPageBreak(doc, y, 22);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.text(safeText(exp.position) || '[Information manquante]', mainX, y);
      y += 4.8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`${safeText(exp.company) || '[Information manquante]'}  ·  ${safeText(exp.startDate)} - ${safeText(exp.endDate) || 'Présent'}`, mainX, y);
      doc.setTextColor(17, 24, 39);
      y += 5;
      const descriptions = Array.isArray(exp.description) ? exp.description : [exp.description].filter(Boolean);
      doc.setFontSize(9.5);
      descriptions.forEach((d) => {
        y = checkPageBreak(doc, y, 10);
        y = addWrappedText(doc, `•  ${d}`, mainX, y, mainWidth);
      });
      y += 4;
    });
  }

  if (Array.isArray(cv.education) && cv.education.length) {
    sectionTitle('Formation');
    cv.education.forEach((ed) => {
      y = checkPageBreak(doc, y, 12);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text(`${safeText(ed.degree) || '[Information manquante]'}${safeText(ed.field) ? ' — ' + ed.field : ''}`, mainX, y);
      y += 4.8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(107, 114, 128);
      doc.text(`${safeText(ed.institution)}   ${safeText(ed.startDate)} - ${safeText(ed.endDate)}`, mainX, y);
      doc.setTextColor(17, 24, 39);
      y += 7;
    });
  }

  if (Array.isArray(cv.certifications) && cv.certifications.length) {
    sectionTitle('Certifications');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    y = addWrappedText(doc, cv.certifications.join('  •  '), mainX, y, mainWidth);
    y += 6;
  }

  if (Array.isArray(cv.projects) && cv.projects.length) {
    sectionTitle('Projets');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    addWrappedText(doc, cv.projects.join('  •  '), mainX, y, mainWidth);
  }
}

/**
 * Génère et télécharge le PDF du CV.
 * @param {object} cv - Structure JSON du CV (voir format Gemini).
 * @param {'classic'|'modern'} template
 */
function downloadCvPdf(cv, template = 'classic') {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  if (template === 'modern') {
    renderModernTemplate(doc, cv);
  } else {
    renderClassicTemplate(doc, cv);
  }

  const fileName = `CV_${safeText(cv?.personal?.fullName).replace(/\s+/g, '_') || 'JobBoostAI'}.pdf`;
  doc.save(fileName);
}
