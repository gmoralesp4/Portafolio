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

// --- ATS PDF (compacto, 1 página, compatible ATS) ---
const atsDef = {
  pageSize: 'LETTER',
  pageMargins: [36, 36, 36, 36],
  content: [
    // 1. HEADER
    { text: personalInfo.fullName.toUpperCase(), style: 'name' },
    { text: 'Software Engineer', style: 'jobTitleLine' },
    {
      text: [
        { text: personalInfo.email },
        { text: '  |  ' },
        { text: personalInfo.phone },
        { text: '  |  ' },
        { text: personalInfo.location },
        { text: '  |  ' },
        { text: 'linkedin.com/in/gerson-morales-1a3b5b25b' },
      ],
      style: 'contact',
    },

    // 2. PROFESSIONAL SUMMARY
    section('RESUMEN PROFESIONAL'),
    {
      text: 'Ingeniero de software Full Stack con experiencia en aplicaciones empresariales para los sectores financiero y asegurador. Diseño y construcción de APIs REST/SOAP, servicios backend y bases de datos relacionales (Oracle, SQL Server). Aplicación de estándares PCI DSS e ISO 27000. Maestría en Seguridad Informática e Ingeniería de Sistemas. Certificado Scrum Fundamentals. AWS Cloud Practitioner (en preparación).',
      style: 'body',
    },

    // 3. SKILLS
    section('HABILIDADES'),
    { text: [{ text: 'Backend: ', bold: true }, skills.backend.join(' · ')], style: 'skillLine' },
    { text: [{ text: 'Frontend: ', bold: true }, skills.frontend.join(' · ')], style: 'skillLine' },
    { text: [{ text: 'Bases de datos: ', bold: true }, skills.databases.join(' · ')], style: 'skillLine' },
    { text: [{ text: 'Arquitectura: ', bold: true }, skills.architecture.join(' · ')], style: 'skillLine' },
    { text: [{ text: 'Seguridad: ', bold: true }, skills.security.join(' · ')], style: 'skillLine' },
    { text: [{ text: 'Cloud: ', bold: true }, skills.cloud.join(' · ')], style: 'skillLine' },
    { text: [{ text: 'Metodologías: ', bold: true }, skills.methodologies.join(' · ')], style: 'skillLine' },

    // 4. TECHNOLOGIES
    section('TECNOLOGÍAS'),
    {
      text: 'Backend: .NET · .NET Framework · C# · Java · Node.js · ASP.NET · APIs REST · SOAP · Servicios Windows  |  Frontend: React · Angular · JavaScript · TypeScript · HTML5 · CSS3  |  Bases de datos: SQL Server · Oracle · PL/SQL · MySQL  |  Seguridad: AES-256  |  Herramientas: Git · Postman · Visual Studio · VS Code · SSMS · Oracle SQL Developer',
      style: 'body',
    },

    // 5. EXPERIENCE
    section('EXPERIENCIA PROFESIONAL'),

    // Exp 1
    { text: [{ text: 'Analista Programador II', bold: true }, { text: '  |  Procesadora de Tarjeta de Crédito Banrural  |  2024-02 - Presente', color: '#334155' }], style: 'expHeader' },
    { text: 'Desarrollo de servicios backend y APIs para plataforma bancaria y procesamiento de pagos con controles de seguridad PCI DSS e ISO 27000.', style: 'body', margin: [0, 1, 0, 2] },
    '• Desarrollo de servicios backend para CRM y componentes transaccionales.',
    '• Diseño e integración de APIs REST y SOAP entre sistemas financieros internos.',
    '• Administración y optimización de bases de datos SQL Server.',
    '• Aplicación de controles de seguridad alineados a PCI DSS e ISO 27000.',
    { text: 'Logros: Implementación de cifrado AES-256 para datos financieros. Servicios backend para plataforma de pagos con alta disponibilidad. Coordinación con stakeholders internacionales.', style: 'achievementLine' },
    { text: 'Tecnologías: .NET · .NET Framework · C# · SQL Server · APIs REST · SOAP · Windows Services · AES-256', style: 'techLine' },
    '',

    // Exp 2
    { text: [{ text: 'Analista Programador Full Stack', bold: true }, { text: '  |  IT Profis / MAPFRE  |  2021-07 - 2024-02', color: '#334155' }], style: 'expHeader' },
    { text: 'Diseño, desarrollo y mantenimiento de aplicaciones web empresariales para operaciones regionales de aseguradora sobre ecosistema Oracle.', style: 'body', margin: [0, 1, 0, 2] },
    '• Desarrollo y mantenimiento de aplicaciones web Full Stack sobre Oracle Database.',
    '• Optimización de componentes PL/SQL para reportería regional.',
    '• Implementación de soluciones de reportería integradas a procesos corporativos.',
    '• Análisis de requerimientos y transformación en soluciones tecnológicas.',
    { text: 'Logros: Reportería automatizada con alcance regional multinacional. Modernización de herramientas legacy a web. Optimización de consultas PL/SQL con mejora en tiempos de respuesta.', style: 'achievementLine' },
    { text: 'Tecnologías: Oracle · PL/SQL · Java · ASP.NET · JavaScript · SQL Server · MySQL · HTML5 · CSS3', style: 'techLine' },
    '',

    // Exp 3
    { text: [{ text: 'Desarrollador Full Stack', bold: true }, { text: '  |  Proyectos Independientes / PYMES', color: '#334155' }], style: 'expHeader' },
    { text: 'Desarrollo de aplicaciones web Full Stack para pequeñas y medianas empresas: requerimientos, construcción, despliegue y soporte técnico.', style: 'body', margin: [0, 1, 0, 2] },
    '• Diseño y desarrollo de aplicaciones web con arquitectura Full Stack.',
    '• Desarrollo de interfaces con React, Angular y TypeScript.',
    '• Desarrollo de APIs y lógica de negocio para integración con servicios externos.',
    '• Modelado y administración de bases de datos SQL Server y MySQL.',
    { text: 'Logros: Ciclo completo de desarrollo (análisis a producción). Soluciones para múltiples modelos de negocio. Selección de stack técnico según requerimientos.', style: 'achievementLine' },
    { text: 'Tecnologías: React · Angular · Node.js · JavaScript · TypeScript · SQL Server · MySQL', style: 'techLine' },
    '',

    // 6. EDUCATION
    section('EDUCACIÓN'),
    ...education.map(edu => ({
      text: `${edu.degree}  —  ${edu.institution}  |  ${edu.startDate} - ${edu.endDate}  (${edu.status})`,
      style: 'eduLine',
    })),
    '',

    // 7. CERTIFICATIONS
    section('CERTIFICACIONES'),
    ...(certifications || []).map(cert => ({
      text: `Obtenidas: ${cert.name} — ${cert.issuer}`,
      style: 'certLine',
    })),
    ...(certificationsInProgress || []).map(cert => ({
      text: `En preparación: ${cert.name} — ${cert.issuer}`,
      style: 'certLine',
    })),
    '',

    // 8. LANGUAGES
    section('IDIOMAS'),
    {
      text: languages.map(l => `${l.language} — ${l.level}`).join('  |  '),
      style: 'body',
    },
  ].filter(Boolean),
  styles: {
    name: { fontSize: 14, bold: true, margin: [0, 0, 0, 1] },
    jobTitleLine: { fontSize: 10, margin: [0, 0, 0, 3], color: '#1e40af' },
    contact: { fontSize: 7.5, margin: [0, 0, 0, 6], color: '#334155' },
    sectionHeader: { fontSize: 9.5, bold: true, margin: [0, 7, 0, 3], color: '#0f172a' },
    body: { fontSize: 7.5, lineHeight: 1.3, margin: [0, 0, 0, 1] },
    skillLine: { fontSize: 7.5, lineHeight: 1.25, margin: [0, 0, 0, 0] },
    expHeader: { fontSize: 8, margin: [0, 3, 0, 0] },
    achievementLine: { fontSize: 7.5, margin: [2, 1, 0, 1], color: '#1e293b' },
    techLine: { fontSize: 7, color: '#475569', margin: [2, 0, 0, 0] },
    eduLine: { fontSize: 7.5, margin: [0, 1, 0, 0] },
    certLine: { fontSize: 7.5, margin: [0, 1, 0, 0] },
  },
  defaultStyle: { font: 'Roboto', color: '#0f172a', fontSize: 7.5 },
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
