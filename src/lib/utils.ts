import type { SkillCategory, SkillGroup } from '@types/cv';
import cvData from '@data/cv.json';
import type { CVData } from '@types/cv';

const cv = cvData as CVData;

export const BASE_PATH = '/Portafolio';

export function assetPath(path: string): string {
  return `${BASE_PATH}${path}`;
}

export function fullAssetUrl(path: string): string {
  return `https://gmoralesp4.github.io${BASE_PATH}${path}`;
}

export function pagePath(path: string): string {
  return `${BASE_PATH}${path}`;
}

export function getCV(): CVData {
  return cv;
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  if (month && year) {
    return `${months[parseInt(month) - 1]} ${year}`;
  }
  return year || '';
}

export function getDateRange(start: string | null, end: string | null, current: boolean): string {
  const startStr = formatDate(start);
  if (current) return `${startStr} - Presente`;
  const endStr = formatDate(end);
  return `${startStr} - ${endStr}`;
}

export function getYearsExperience(startDate: string | null, endDate: string | null): number {
  if (!startDate) return 0;
  const [startYear] = startDate.split('-').map(Number);
  const endYear = endDate ? parseInt(endDate.split('-')[0]!) : new Date().getFullYear();
  return endYear - startYear;
}

export function getTotalYearsExperience(): number {
  let total = 0;
  for (const exp of cv.experience) {
    total += getYearsExperience(exp.startDate, exp.endDate || null);
  }
  return total;
}

export const skillGroups: SkillGroup[] = [
  { id: 'backend' as SkillCategory, label: 'Backend', items: [...cv.skills.backend, ...cv.skills.architecture] },
  { id: 'frontend' as SkillCategory, label: 'Frontend', items: cv.skills.frontend },
  { id: 'databases' as SkillCategory, label: 'Bases de Datos', items: cv.skills.databases },
  { id: 'cloud' as SkillCategory, label: 'Cloud / DevOps', items: [...cv.skills.cloud, ...cv.skills.methodologies] },
  { id: 'tools' as SkillCategory, label: 'Herramientas', items: cv.skills.tools },
];
