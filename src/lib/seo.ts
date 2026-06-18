import type { CVData } from '@types/cv';

export function generatePersonJsonLd(cv: CVData): string {
  const { personalInfo, skills, education } = cv;
  const url = personalInfo.website;
  const sameAs: string[] = [];
  if (personalInfo.github) sameAs.push(personalInfo.github);
  if (personalInfo.linkedin) sameAs.push(personalInfo.linkedin);

  const knowsAbout = [
    ...skills.backend,
    ...skills.frontend,
    ...skills.databases,
    ...skills.architecture,
    ...skills.security,
  ];

  const alumniOf = education.map(e => ({
    '@type': 'CollegeOrUniversity' as const,
    name: e.institution,
  }));

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${url}/#person`,
        name: personalInfo.fullName,
        alternateName: personalInfo.preferredName,
        description: personalInfo.summary.slice(0, 200),
        jobTitle: personalInfo.jobTitle,
        image: `${url}/images/profile.webp`,
        email: `mailto:${personalInfo.email}`,
        url: url,
        sameAs: sameAs,
        knowsAbout: knowsAbout,
        alumniOf: alumniOf,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'GT',
          addressLocality: personalInfo.location,
        },
      },
      {
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        url: url,
        name: `${personalInfo.preferredName} — Portafolio`,
        description: `${personalInfo.jobTitle} | ${personalInfo.preferredName}`,
        publisher: { '@id': `${url}/#person` },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${url}/#profilepage`,
        url: url,
        mainEntity: { '@id': `${url}/#person` },
      },
    ],
  });
}

export interface PageSEO {
  title: string;
  description: string;
  ogType?: string;
  canonical?: string;
}

export function getPageSEO(path: string, cv: CVData): PageSEO {
  const { personalInfo, seo } = cv;
  const baseTitle = `${personalInfo.preferredName} — ${personalInfo.jobTitle}`;

  const pages: Record<string, PageSEO> = {
    '/': {
      title: `${personalInfo.fullName} — ${personalInfo.jobTitle} | .NET, Java, Oracle`,
      description: `${personalInfo.jobTitle} Full Stack con experiencia en sector financiero y asegurador. .NET, Java, Oracle, SQL Server, APIs REST. ${personalInfo.location}.`,
    },
    '/about': {
      title: `Sobre Mí — ${personalInfo.preferredName} | ${personalInfo.jobTitle}`,
      description: `Ingeniero de software Full Stack con experiencia en sector financiero y asegurador. Maestría en Seguridad Informática. ${personalInfo.location}.`,
    },
    '/experience': {
      title: `Experiencia Profesional — ${personalInfo.preferredName}`,
      description: `Trayectoria profesional en desarrollo Full Stack: MAPFRE, Banrural, proyectos independientes. ${personalInfo.location}.`,
    },
    '/projects': {
      title: `Proyectos — ${personalInfo.preferredName} | Desarrollo de Software`,
      description: `Proyectos empresariales: reportería regional, soluciones web bancarias, integración de sistemas. ${personalInfo.location}.`,
    },
    '/skills': {
      title: `Habilidades Técnicas — ${personalInfo.preferredName}`,
      description: `Stack tecnológico: .NET, Java, Angular, React, Oracle, SQL Server, APIs REST, seguridad informática.`,
    },
    '/education': {
      title: `Educación — ${personalInfo.preferredName} | Maestría en Seguridad Informática`,
      description: `Maestría en Seguridad Informática e Ingeniería de Sistemas — Universidad Mariano Gálvez.`,
    },
    '/contact': {
      title: `Contacto — ${personalInfo.preferredName}`,
      description: `Contáctame: ${personalInfo.email} | GitHub: ${personalInfo.github}`,
    },
    '/blog': {
      title: `Blog — ${personalInfo.preferredName}`,
      description: `Artículos técnicos sobre desarrollo de software, arquitectura, .NET, Angular y bases de datos.`,
    },
  };

  return pages[path] || {
    title: baseTitle,
    description: personalInfo.summary.slice(0, 160),
  };
}
