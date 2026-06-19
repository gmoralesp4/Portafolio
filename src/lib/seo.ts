import type { CVData } from '@cvtypes/cv';

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
        description: personalInfo.summary.replace(/\n/g, ' ').slice(0, 200),
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
  const { personalInfo } = cv;
  const baseTitle = `${personalInfo.preferredName} — ${personalInfo.jobTitle}`;

  const pages: Record<string, PageSEO> = {
    '/': {
      title: `${personalInfo.preferredName} — ${personalInfo.jobTitle} | Backend Engineer .NET Java Oracle`,
      description: `Backend Engineer con experiencia en sector financiero y asegurador. .NET, Java, Oracle, SQL Server, APIs REST, PCI DSS, ISO 27000. ${personalInfo.location}.`,
    },
    '/about': {
      title: `Sobre Mí — ${personalInfo.preferredName} | ${personalInfo.jobTitle}`,
      description: `Ingeniero de software especializado en backend empresarial. .NET, Java, Node.js, Oracle, SQL Server. Maestría en Seguridad Informática.`,
    },
    '/experience': {
      title: `Experiencia Profesional — ${personalInfo.preferredName}`,
      description: `Trayectoria en backend empresarial: Banrural (pagos), MAPFRE (seguros), proyectos freelance. ${personalInfo.location}.`,
    },
    '/projects': {
      title: `Proyectos — ${personalInfo.preferredName} | Casos de estudio`,
      description: `Reportería regional MAPFRE (Oracle ETL), modernización web ASP.NET. Proyectos empresariales con impacto real.`,
    },
    '/skills': {
      title: `Stack Tecnológico — ${personalInfo.preferredName}`,
      description: `.NET, Java, Node.js, Oracle, SQL Server, React, Angular, TypeScript, AWS, PCI DSS, ISO 27000.`,
    },
    '/education': {
      title: `Educación — ${personalInfo.preferredName} | Maestría en Seguridad Informática`,
      description: `Maestría en Seguridad Informática e Ingeniería de Sistemas — Universidad Mariano Gálvez. Certificación Scrum Fundamentals.`,
    },
    '/contact': {
      title: `Contacto — ${personalInfo.preferredName}`,
      description: `Disponible para oportunidades como Backend Engineer. Email: ${personalInfo.email} | LinkedIn.`,
    },
    '/blog': {
      title: `Blog — ${personalInfo.preferredName}`,
      description: `Artículos sobre backend, arquitectura de software, .NET, seguridad informática y bases de datos.`,
    },
  };

  return pages[path] || {
    title: baseTitle,
    description: personalInfo.summary.slice(0, 160),
  };
}
