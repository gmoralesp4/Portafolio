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
const { personalInfo, experience, education, skills, certifications, certificationsInProgress, languages, continuousLearning } = cvData;

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

function section(title) {
  return { text: title, style: 'sectionHeader' };
}

function line(text, style) {
  return { text, style: style || 'body' };
}

// --- ATS PDF ---
const atsDef = {
  pageSize: 'LETTER',
  pageMargins: [54, 54, 54, 54],
  content: [
    // 1. HEADER
    { text: personalInfo.fullName.toUpperCase(), style: 'name' },
    { text: 'Software Engineer', style: 'jobTitle' },
    {
      text: [
        { text: personalInfo.email, color: '#2563eb' },
        { text: '  |  ', color: '#94a3b8' },
        { text: personalInfo.phone, color: '#334155' },
        { text: '  |  ', color: '#94a3b8' },
        { text: personalInfo.location, color: '#334155' },
        { text: '  |  ', color: '#94a3b8' },
        { text: personalInfo.linkedin, color: '#2563eb', link: personalInfo.linkedin },
      ],
      style: 'contact',
    },
    { text: '\n' },

    // 2. PROFESSIONAL SUMMARY
    section('RESUMEN PROFESIONAL'),
    { text: personalInfo.summary, style: 'body' },
    { text: '\n' },

    // 3. SKILLS
    section('HABILIDADES'),
    {
      ul: [
        ...skills.backend.map(s => ({ text: [{ text: 'Backend: ', bold: true }, s], style: 'skill' })),
        ...skills.frontend.map(s => ({ text: [{ text: 'Frontend: ', bold: true }, s], style: 'skill' })),
        ...skills.databases.map(s => ({ text: [{ text: 'Bases de datos: ', bold: true }, s], style: 'skill' })),
        ...skills.architecture.map(s => ({ text: [{ text: 'Arquitectura: ', bold: true }, s], style: 'skill' })),
        ...skills.security.map(s => ({ text: [{ text: 'Seguridad: ', bold: true }, s], style: 'skill' })),
        ...skills.cloud.map(s => ({ text: [{ text: 'Cloud: ', bold: true }, s], style: 'skill' })),
        ...skills.methodologies.map(s => ({ text: [{ text: 'Metodologías: ', bold: true }, s], style: 'skill' })),
      ],
      type: 'none',
      margin: [0, 0, 0, 4],
    },
    { text: '\n' },

    // 4. TECHNOLOGIES
    section('TECNOLOGÍAS'),
    {
      text: [
        ...experience.flatMap(e => e.technologies),
        ...(skills.tools || []),
      ].filter((v, i, a) => a.indexOf(v) === i).join('  |  '),
      style: 'body',
    },
    { text: '\n' },

    // 5. EXPERIENCE
    section('EXPERIENCIA PROFESIONAL'),
    ...experience.map(exp => [
      { text: exp.position, style: 'expTitle' },
      { text: `${exp.company}  |  ${exp.startDate || ''} - ${exp.current ? 'Presente' : exp.endDate}`, style: 'expCompany' },
      { text: exp.description, style: 'body', margin: [0, 2, 0, 4] },
      { text: 'Responsabilidades:', style: 'label' },
      ...exp.responsibilities.map(r => ({ text: `• ${r}`, style: 'bullet', margin: [6, 1, 0, 1] })),
      exp.achievements.length > 0 ? { text: 'Logros:', style: 'label', margin: [0, 4, 0, 1] } : null,
      ...exp.achievements.map(a => ({ text: `• ${a}`, style: 'bullet', margin: [6, 1, 0, 1] })),
      { text: `Tecnologías: ${exp.technologies.join(', ')}`, style: 'techLine', margin: [0, 4, 0, 2] },
      { text: '\n' },
    ]).flat().filter(Boolean),

    // 6. EDUCATION
    section('EDUCACIÓN'),
    ...education.map(edu => [
      { text: edu.degree, style: 'eduTitle' },
      { text: `${edu.institution}  |  ${edu.startDate} - ${edu.endDate}`, style: 'eduDetail' },
      { text: `Estado: ${edu.status}`, style: 'eduDetail' },
      { text: '\n' },
    ]).flat(),

    // 7. CERTIFICATIONS
    certifications.length > 0 ? section('CERTIFICACIONES') : null,
    ...(certifications || []).map(cert => ({
      text: `• ${cert.name} — ${cert.issuer} (${cert.status})`,
      style: 'bullet',
      margin: [0, 1, 0, 1],
    })),
    ...(certificationsInProgress || []).map(cert => ({
      text: `• ${cert.name} — ${cert.issuer} (${cert.status})`,
      style: 'bullet',
      margin: [0, 1, 0, 1],
    })),
    (certifications?.length || certificationsInProgress?.length) > 0 ? { text: '\n' } : null,

    // 8. LANGUAGES
    section('IDIOMAS'),
    ...languages.map(lang => ({
      text: `${lang.language}: ${lang.level}`,
      style: 'body',
    })),
    { text: '\n' },

    // 9. ADDITIONAL INFO
    continuousLearning ? section('INFORMACIÓN ADICIONAL') : null,
    continuousLearning ? { text: continuousLearning.description, style: 'body' } : null,
  ].filter(Boolean),
  styles: {
    name: { fontSize: 16, bold: true, margin: [0, 0, 0, 2] },
    jobTitle: { fontSize: 12, margin: [0, 0, 0, 6], color: '#2563eb' },
    contact: { fontSize: 9, margin: [0, 0, 0, 2], lineHeight: 1.4 },
    sectionHeader: { fontSize: 11, bold: true, margin: [0, 10, 0, 4], color: '#0f172a' },
    body: { fontSize: 9, lineHeight: 1.35, margin: [0, 1, 0, 1] },
    skill: { fontSize: 9, lineHeight: 1.3, margin: [0, 0, 0, 0] },
    label: { fontSize: 9, bold: true, margin: [0, 2, 0, 1] },
    bullet: { fontSize: 9, lineHeight: 1.3 },
    expTitle: { fontSize: 10, bold: true, margin: [0, 4, 0, 1] },
    expCompany: { fontSize: 9, color: '#475569', margin: [0, 0, 0, 2] },
    techLine: { fontSize: 8, color: '#475569' },
    eduTitle: { fontSize: 10, bold: true, margin: [0, 2, 0, 1] },
    eduDetail: { fontSize: 9, color: '#475569', margin: [0, 0, 0, 1] },
  },
  defaultStyle: { font: 'Roboto', color: '#0f172a', fontSize: 9 },
};

// --- Visual PDF ---
const topSkills = [
  ...cvData.skills.backend.slice(0, 4),
  ...cvData.skills.frontend.slice(0, 3),
  ...cvData.skills.databases.slice(0, 3),
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
