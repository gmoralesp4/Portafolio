import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import PdfPrinter from 'pdfmake';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const vfsPath = path.resolve(__dirname, '../node_modules/pdfmake/build/vfs_fonts.js');
const vfsContent = fs.readFileSync(vfsPath, 'utf-8');

const fontData = {};
for (const match of vfsContent.matchAll(/["']([^"']+\.ttf)["']\s*:\s*["']([^"']+)["']/g)) {
  fontData[match[1]] = match[2];
}

const tmpDir = path.resolve(__dirname, '../node_modules/.cache-pdfmake-fonts');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

const fontFiles = {};
for (const [name, base64] of Object.entries(fontData)) {
  const filePath = path.join(tmpDir, name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, Buffer.from(base64, 'base64'));
  }
  const cleanName = path.basename(name, '.ttf').replace(/[-\s]/g, '');
  fontFiles[cleanName] = filePath;
}

const fonts = {
  Roboto: {
    normal: fontFiles['RobotoRegular'],
    bold: fontFiles['RobotoMedium'],
    italics: fontFiles['RobotoItalic'],
    bolditalics: fontFiles['RobotoMediumItalic'],
  }
};

const printer = new PdfPrinter(fonts);
const outputDir = path.resolve(__dirname, '../public/cv');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const cvData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../src/data/cv.json'), 'utf-8'));
const { personalInfo, experience, education, skills } = cvData;

function allSkills() {
  return [...skills.backend, ...skills.frontend, ...skills.databases, ...skills.architecture, ...skills.security];
}

function writePdf(docDefinition, filename) {
  return new Promise((resolve, reject) => {
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    pdfDoc.on('data', chunk => chunks.push(chunk));
    pdfDoc.on('end', () => {
      const outPath = path.join(outputDir, filename);
      fs.writeFileSync(outPath, Buffer.concat(chunks));
      console.log(`PDF generated: ${outPath}`);
      resolve();
    });
    pdfDoc.on('error', reject);
    pdfDoc.end();
  });
}

// --- ATS PDF ---
const atsDef = {
  content: [
    { text: personalInfo.fullName.toUpperCase(), style: 'name' },
    { text: personalInfo.jobTitle, style: 'subtitle' },
    { text: `Email: ${personalInfo.email} | Tel: ${personalInfo.phone} | ${personalInfo.location}`, style: 'contact' },
    '',
    { text: 'RESUMEN PROFESIONAL', style: 'sectionHeader' },
    { text: personalInfo.summary, style: 'paragraph' },
    '',
    { text: 'EXPERIENCIA PROFESIONAL', style: 'sectionHeader' },
    ...experience.map(exp => [
      { text: exp.position, style: 'jobTitle' },
      { text: `${exp.company} | ${exp.startDate || ''} - ${exp.current ? 'Presente' : exp.endDate}`, style: 'company' },
      ...exp.responsibilities.map(r => ({ text: `• ${r}`, style: 'bullet' })),
      '',
    ]).flat(),
    { text: 'EDUCACIÓN', style: 'sectionHeader' },
    ...education.map(edu => [
      { text: `${edu.degree} — ${edu.institution}`, style: 'eduLine' },
      { text: `${edu.status} | ${edu.startDate} - ${edu.endDate}`, style: 'eduDates' },
      '',
    ]).flat(),
    { text: 'HABILIDADES', style: 'sectionHeader' },
    { text: allSkills().join(' | '), style: 'skills' },
  ],
  styles: {
    name: { fontSize: 18, bold: true, margin: [0, 0, 0, 4] },
    subtitle: { fontSize: 12, margin: [0, 0, 0, 4], color: '#334155' },
    contact: { fontSize: 9, margin: [0, 0, 0, 8], color: '#64748b' },
    sectionHeader: { fontSize: 11, bold: true, margin: [0, 12, 0, 4], color: '#0f172a' },
    paragraph: { fontSize: 9, lineHeight: 1.4 },
    jobTitle: { fontSize: 10, bold: true, margin: [0, 6, 0, 2] },
    company: { fontSize: 9, margin: [0, 0, 0, 2], color: '#475569' },
    bullet: { fontSize: 9, margin: [0, 1, 0, 0], lineHeight: 1.3 },
    eduLine: { fontSize: 9, margin: [0, 2, 0, 0] },
    eduDates: { fontSize: 8, color: '#64748b' },
    skills: { fontSize: 9, margin: [0, 4, 0, 0], lineHeight: 1.4 },
  },
  defaultStyle: { font: 'Roboto' },
};

// --- Visual PDF ---
const topSkills = [
  ...skills.backend.slice(0, 4),
  ...skills.frontend.slice(0, 3),
  ...skills.databases.slice(0, 3),
];

const visualDef = {
  content: [
    { text: personalInfo.fullName, style: 'vName' },
    { text: personalInfo.jobTitle, style: 'vSubtitle' },
    { text: `${personalInfo.email} · ${personalInfo.phone} · ${personalInfo.location}`, style: 'vContact' },
    '',
    { text: 'Perfil Profesional', style: 'vSection' },
    { text: personalInfo.summary, style: 'vParagraph' },
    '',
    { text: 'Experiencia', style: 'vSection' },
    ...experience.filter(exp => exp.achievements.length > 0).map(exp => [
      { text: exp.company, style: 'vCompany' },
      { text: exp.position, style: 'vRole' },
      { text: `${exp.startDate || ''} - ${exp.current ? 'Actual' : exp.endDate}`, style: 'vDates' },
      ...exp.achievements.map(a => ({ text: `✦ ${a}`, style: 'vAchievement' })),
      '',
    ]).flat(),
    { text: 'Educación', style: 'vSection' },
    ...education.map(edu => ({
      text: `${edu.degree}\n${edu.institution} · ${edu.startDate} - ${edu.endDate}`,
      style: 'vEdu',
    })),
    '',
    { text: 'Stack Tecnológico', style: 'vSection' },
    { text: topSkills.join('  ·  '), style: 'vSkills' },
  ],
  styles: {
    vName: { fontSize: 24, bold: true, color: '#0f172a', margin: [0, 0, 0, 2] },
    vSubtitle: { fontSize: 14, color: '#0891b2', margin: [0, 0, 0, 4] },
    vContact: { fontSize: 9, color: '#64748b', margin: [0, 0, 0, 12] },
    vSection: { fontSize: 13, bold: true, color: '#0f172a', margin: [0, 12, 0, 6] },
    vParagraph: { fontSize: 9, lineHeight: 1.4, color: '#334155' },
    vCompany: { fontSize: 11, bold: true, color: '#0f172a', margin: [0, 6, 0, 0] },
    vRole: { fontSize: 10, color: '#0891b2', margin: [0, 0, 0, 2] },
    vDates: { fontSize: 8, color: '#94a3b8', margin: [0, 0, 0, 3] },
    vAchievement: { fontSize: 9, color: '#334155', margin: [0, 1, 0, 0] },
    vEdu: { fontSize: 9, color: '#334155', margin: [0, 2, 0, 4], lineHeight: 1.4 },
    vSkills: { fontSize: 9, color: '#0891b2', margin: [0, 4, 0, 0], lineHeight: 1.4 },
  },
  defaultStyle: { font: 'Roboto' },
};

async function main() {
  await writePdf(atsDef, 'Gerson_Morales_CV_ATS.pdf');
  await writePdf(visualDef, 'Gerson_Morales_CV_Visual.pdf');
}

main().catch(err => { console.error(err); process.exit(1); });
