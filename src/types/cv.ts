export interface CVData {
  personalInfo: PersonalInfo;
  skills: Skills;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  certifications: Certification[];
  certificationsInProgress: Certification[];
  courses: Course[];
  languages: Language[];
  continuousLearning: ContinuousLearning;
  seo: SEOData;
}

export interface PersonalInfo {
  fullName: string;
  preferredName: string;
  jobTitle: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  github: string;
  summary: string;
}

export interface Skills {
  backend: string[];
  frontend: string[];
  databases: string[];
  architecture: string[];
  security: string[];
  cloud: string[];
  methodologies: string[];
  domainKnowledge: string[];
  softSkills: string[];
  tools: string[];
}

export interface Experience {
  company: string;
  position: string;
  employmentType: string;
  startDate: string | null;
  endDate: string | null;
  current: boolean;
  location: string;
  description: string;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
}

export interface Project {
  name: string;
  slug: string;
  type: string;
  description: string;
  technologies: string[];
  problem: string;
  solution: string;
  architecture: string;
  highlights: string[];
  results: string[];
}

export interface Education {
  institution: string;
  degree: string;
  status: string;
  startDate: string;
  endDate: string;
}

export interface Certification {
  name: string;
  issuer: string;
  status: string;
}

export interface Course {
  name: string;
  platform: string;
  category: string;
}

export interface Language {
  language: string;
  level: string;
  proficiency?: string;
}

export interface ContinuousLearning {
  openToLearning: boolean;
  description: string;
}

export interface SEOData {
  keywords: string[];
}

export type SkillCategory =
  | 'backend'
  | 'frontend'
  | 'databases'
  | 'architecture'
  | 'security'
  | 'cloud'
  | 'methodologies'
  | 'domainKnowledge'
  | 'softSkills'
  | 'tools';

export interface SkillGroup {
  id: SkillCategory;
  label: string;
  items: string[];
}
