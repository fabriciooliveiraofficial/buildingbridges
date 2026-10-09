/**
 * Dynamic front-end project/mission translation helper (Option 3).
 * Translates project names, descriptions, and categories based on current active language.
 */

export interface ProjectLike {
  id?: string | number;
  name?: string;
  title?: string;
  description?: string;
  long_description?: string;
  category?: string;
  [key: string]: any;
}

interface TranslationEntry {
  en: {
    name: string;
    description: string;
    long_description?: string;
  };
  es: {
    name: string;
    description: string;
    long_description?: string;
  };
  pt: {
    name: string;
    description: string;
    long_description?: string;
  };
}

const CATEGORY_TRANSLATIONS: Record<string, { en: string; pt: string; es: string }> = {
  'BRAZIL RELIEF': {
    en: 'BRAZIL RELIEF',
    pt: 'AJUDA AO BRASIL',
    es: 'AYUDA A BRASIL'
  },
  'EMERGENCY': {
    en: 'EMERGENCY',
    pt: 'EMERGÊNCIA',
    es: 'EMERGENCIA'
  },
  'USA RESILIENCE': {
    en: 'USA RESILIENCE',
    pt: 'RESILIÊNCIA NOS EUA',
    es: 'RESILIENCIA EN EE. UU.'
  },
  'AMAZON RELIEF': {
    en: 'AMAZON RELIEF',
    pt: 'AJUDA NA AMAZÔNIA',
    es: 'AYUDA EN LA AMAZONÍA'
  }
};

const KNOWN_PROJECTS: {
  matcher: (project: ProjectLike) => boolean;
  translations: TranslationEntry;
}[] = [
  // 1. Missão Pantanal
  {
    matcher: (p) => {
      const n = (p.name || p.title || '').toLowerCase();
      const d = (p.description || '').toLowerCase();
      return n.includes('pantanal') || d.includes('pantanal') || d.includes('ribeirinhas');
    },
    translations: {
      en: {
        name: 'Pantanal Mission',
        description: 'Isolated riverside communities reachable only by boat. Our dedicated team travels directly on-site to deliver vital relief, medical supplies, and humanitarian assistance.',
        long_description: 'Isolated riverside communities reachable only by boat. Our dedicated team travels directly on-site to deliver vital relief, medical supplies, and humanitarian assistance.'
      },
      es: {
        name: 'Misión Pantanal',
        description: 'Comunidades ribereñas aisladas, accesibles solo en barco. Nuestro equipo viaja hasta allí para brindar ayuda humanitaria vital, atención médica y suministros esenciales.',
        long_description: 'Comunidades ribereñas aisladas, accesibles solo en barco. Nuestro equipo viaja hasta allí para brindar ayuda humanitaria vital, atención médica y suministros esenciales.'
      },
      pt: {
        name: 'Missão Pantanal',
        description: 'Comunidades ribeirinhas isoladas, acessíveis só de barco. Nossa equipe viajou até lá para levar suprimentos vitais, atendimento médico e assistência humanitária.',
        long_description: 'Comunidades ribeirinhas isoladas, acessíveis só de barco. Nossa equipe viajou até lá para levar suprimentos vitais, atendimento médico e assistência humanitária.'
      }
    }
  },
  // 2. Projeto Resgate de Vidas
  {
    matcher: (p) => {
      const n = (p.name || p.title || '').toLowerCase();
      const d = (p.description || '').toLowerCase();
      return n.includes('resgate') || d.includes('itapetininga') || d.includes('reforço escolar');
    },
    translations: {
      en: {
        name: 'Lives Rescue Project',
        description: 'Itapetininga, SP. Daily care for children aged 2 to 14: nutritious meals, educational tutoring, sports, arts, and protective community guidance.',
        long_description: 'Itapetininga, SP. Daily care for children aged 2 to 14: nutritious meals, educational tutoring, sports, arts, and protective community guidance.'
      },
      es: {
        name: 'Proyecto Rescate de Vidas',
        description: 'Itapetininga, SP. Cuidado diario de niños de 2 a 14 años: nutrición completa, apoyo escolar, actividades recreativas y protección comunitaria.',
        long_description: 'Itapetininga, SP. Cuidado diario de niños de 2 a 14 años: nutrición completa, apoyo escolar, actividades recreativas y protección comunitaria.'
      },
      pt: {
        name: 'Projeto Resgate de Vidas',
        description: 'Itapetininga, SP. Cuidado diário de crianças de 2 a 14 anos: alimentação, reforço escolar, oficinas educativas e apoio comunitário.',
        long_description: 'Itapetininga, SP. Cuidado diário de crianças de 2 a 14 anos: alimentação, reforço escolar, oficinas educativas e apoio comunitário.'
      }
    }
  },
  // 3. Lar O Bom Samaritano
  {
    matcher: (p) => {
      const n = (p.name || p.title || '').toLowerCase();
      const d = (p.description || '').toLowerCase();
      return n.includes('samaritano') || d.includes('pinhais') || d.includes('acolhe adultos');
    },
    translations: {
      en: {
        name: 'The Good Samaritan Home',
        description: 'São José dos Pinhais, PR. Welcoming vulnerable adults and individuals experiencing homelessness for over 24 years with shelter, meals, healthcare, and dignity.',
        long_description: 'São José dos Pinhais, PR. Welcoming vulnerable adults and individuals experiencing homelessness for over 24 years with shelter, meals, healthcare, and dignity.'
      },
      es: {
        name: 'Hogar El Buen Samaritano',
        description: 'São José dos Pinhais, PR. Desde hace 24 años acoge a adultos en situación de vulnerabilidad y personas sin hogar, brindando techo, alimentación, salud y dignidad.',
        long_description: 'São José dos Pinhais, PR. Desde hace 24 años acoge a adultos en situación de vulnerabilidad y personas sin hogar, brindando techo, alimentación, salud y dignidad.'
      },
      pt: {
        name: 'Lar O Bom Samaritano',
        description: 'São José dos Pinhais, PR. Há 24 anos acolhe adultos em vulnerabilidade e em situação de rua, oferecendo abrigo, refeições, saúde e dignidade.',
        long_description: 'São José dos Pinhais, PR. Há 24 anos acolhe adultos em vulnerabilidade e em situação de rua, oferecendo abrigo, refeições, saúde e dignidade.'
      }
    }
  },
  // 4. Rio Grande do Sul Relief (seed / fallback)
  {
    matcher: (p) => {
      const n = (p.name || p.title || '').toLowerCase();
      const id = String(p.id || '').toLowerCase();
      return id === 'rio-grande' || n.includes('rio grande');
    },
    translations: {
      en: {
        name: 'Rio Grande do Sul Relief',
        description: 'Support the long-term rebuilding efforts of local community centers, schools, and homes affected by historical floods in Southern Brazil.'
      },
      es: {
        name: 'Alivio para Rio Grande do Sul',
        description: 'Apoye los esfuerzos de reconstrucción a largo plazo de centros comunitarios, escuelas y hogares afectados por inundaciones históricas en el sur de Brasil.'
      },
      pt: {
        name: 'Ajuda ao Rio Grande do Sul',
        description: 'Apoie a reconstrução a longo prazo de centros comunitários locais, escolas e lares atingidos pelas enchentes históricas no sul do Brasil.'
      }
    }
  },
  // 5. Gulf Coast Resilience
  {
    matcher: (p) => {
      const n = (p.name || p.title || '').toLowerCase();
      const id = String(p.id || '').toLowerCase();
      return id === 'gulf-coast' || n.includes('gulf coast');
    },
    translations: {
      en: {
        name: 'Gulf Coast Resilience',
        description: 'Equip regional coastal community hubs with resilient emergency solar infrastructure and clean water backup generators.'
      },
      es: {
        name: 'Resiliencia en la Costa del Golfo',
        description: 'Equipe centros comunitarios costeros con infraestructura solar de emergencia resistente y generadores de agua limpia.'
      },
      pt: {
        name: 'Resiliência na Costa do Golfo',
        description: 'Equipe centros comunitários do litoral com infraestrutura solar de emergência e geradores de purificação de água potável.'
      }
    }
  },
  // 6. Amazon Basin Canopy Restoration
  {
    matcher: (p) => {
      const n = (p.name || p.title || '').toLowerCase();
      const id = String(p.id || '').toLowerCase();
      return id === 'amazon-basin' || n.includes('amazon') || n.includes('amazônia');
    },
    translations: {
      en: {
        name: 'Amazon Basin Canopy Restoration',
        description: 'Finance native seed collection, tree planting nurseries, and traditional agricultural training with 45 indigenous communities in Brazil.'
      },
      es: {
        name: 'Restauración de la Cuenca Amazónica',
        description: 'Financie la recolección de semillas nativas, viveros de siembra y capacitación agrícola tradicional para 45 comunidades indígenas en Brasil.'
      },
      pt: {
        name: 'Restauração da Bacia Amazônica',
        description: 'Financie a coleta de sementes nativas, viveiros de mudas e capacitação agrícola tradicional com 45 comunidades indígenas no Brasil.'
      }
    }
  }
];

/**
 * Given a project object and the current language (e.g. 'en', 'pt', 'es'),
 * returns translated name, description, long_description, and category.
 */
export function getTranslatedProject<T extends ProjectLike>(project: T, currentLang: string = 'en'): T {
  if (!project) return project;

  const lang = (currentLang || 'en').slice(0, 2) as 'en' | 'pt' | 'es';
  const targetLang = ['en', 'pt', 'es'].includes(lang) ? lang : 'en';

  let translatedName = project.name || project.title || '';
  let translatedDesc = project.description || '';
  let translatedLongDesc = project.long_description;

  // 1. First check if project has dynamic translations from the Admin panel
  let translationsObj: any = (project as any).translations_json || (project as any).translations;
  while (typeof translationsObj === 'string') {
    try {
      translationsObj = JSON.parse(translationsObj);
    } catch (e) {
      break;
    }
  }

  let foundDynamic = false;
  if (translationsObj && typeof translationsObj === 'object') {
    const tData = translationsObj[targetLang];
    const fallbackData = translationsObj.pt || translationsObj.en || translationsObj.es;

    if (tData) {
      if (tData.name && tData.name.trim()) {
        translatedName = tData.name.trim();
        foundDynamic = true;
      } else if (fallbackData?.name && fallbackData.name.trim()) {
        translatedName = fallbackData.name.trim();
      }

      if (tData.description && tData.description.trim()) {
        translatedDesc = tData.description.trim();
        foundDynamic = true;
      } else if (fallbackData?.description && fallbackData.description.trim()) {
        translatedDesc = fallbackData.description.trim();
      }

      if (tData.long_description && tData.long_description.trim()) {
        translatedLongDesc = tData.long_description.trim();
        foundDynamic = true;
      } else if (fallbackData?.long_description && fallbackData.long_description.trim()) {
        translatedLongDesc = fallbackData.long_description.trim();
      }
    } else if (fallbackData) {
      if (fallbackData.name && fallbackData.name.trim()) translatedName = fallbackData.name.trim();
      if (fallbackData.description && fallbackData.description.trim()) translatedDesc = fallbackData.description.trim();
      if (fallbackData.long_description && fallbackData.long_description.trim()) translatedLongDesc = fallbackData.long_description.trim();
    }
  }

  // 2. If no dynamic translation found, check known projects registry
  if (!foundDynamic) {
    const match = KNOWN_PROJECTS.find(entry => entry.matcher(project));
    if (match) {
      const tData = match.translations[targetLang];
      if (tData) {
        if (tData.name) translatedName = tData.name;
        if (tData.description) translatedDesc = tData.description;
        if (tData.long_description) translatedLongDesc = tData.long_description;
      }
    }
  }

  // Category translation
  let translatedCategory = project.category;
  if (project.category) {
    const rawCat = project.category.trim();
    const catEntry = CATEGORY_TRANSLATIONS[rawCat] || CATEGORY_TRANSLATIONS[rawCat.toUpperCase()];
    if (catEntry && catEntry[targetLang]) {
      translatedCategory = catEntry[targetLang];
    }
  }

  return {
    ...project,
    name: translatedName,
    title: translatedName,
    description: translatedDesc,
    ...(translatedLongDesc ? { long_description: translatedLongDesc } : {}),
    ...(translatedCategory ? { category: translatedCategory } : {})
  };
}

/**
 * Translates an array of projects.
 */
export function getTranslatedProjects<T extends ProjectLike>(projects: T[], currentLang: string = 'en'): T[] {
  if (!Array.isArray(projects)) return [];
  return projects.map(p => getTranslatedProject(p, currentLang));
}

export interface InitiativeLike {
  id?: string | number;
  title?: string;
  description?: string;
  impact_description?: string;
  [key: string]: any;
}

const KNOWN_INITIATIVES: {
  matcher: (initiative: InitiativeLike) => boolean;
  translations: {
    en: { title: string; description: string; impact_description: string };
    es: { title: string; description: string; impact_description: string };
    pt: { title: string; description: string; impact_description: string };
  };
}[] = [
  {
    matcher: (item) => {
      const t = (item.title || '').toLowerCase();
      const id = String(item.id || '').toLowerCase();
      return id.includes('camiseta') || t.includes('camiseta');
    },
    translations: {
      en: {
        title: 'Official Bridges Builders T-Shirt',
        description: 'Made with 100% organic sustainable cotton. Wearing this shirt makes you an official ambassador of the cause, spreading our message of rebuilding bridges and lives.',
        impact_description: 'Provides 5 days of food and clean water for a rural family'
      },
      es: {
        title: 'Camiseta Oficial Bridges Builders',
        description: 'Hecha con algodón 100% orgánico sostenible. Al vestir esta camiseta, te conviertes en embajador oficial de la causa y difundes el mensaje de reconstrucción de puentes y vidas.',
        impact_description: 'Garantiza 5 días de alimentación y agua potable para una familia rural'
      },
      pt: {
        title: 'Camiseta Oficial Bridges Builders',
        description: 'Feita com algodão 100% orgânico sustentável. Ao vestir esta camiseta, você se torna um embaixador oficial da causa e espalha a mensagem de reconstrução de pontes e vidas.',
        impact_description: 'Garante 5 dias de alimentação e água limpa para uma família no campo'
      }
    }
  },
  {
    matcher: (item) => {
      const t = (item.title || '').toLowerCase();
      const id = String(item.id || '').toLowerCase();
      return id.includes('churrasco') || t.includes('churrasco');
    },
    translations: {
      en: {
        title: 'Volunteers Solidarity BBQ',
        description: 'Join our grand community gathering. A day of barbecue, laughter, and fellowship organized entirely by passionate volunteers. All proceeds go toward rebuilding damaged homes.',
        impact_description: 'Funds 2 eco-friendly bricks for community housing reconstruction'
      },
      es: {
        title: 'Barbacoa Solidaria de Voluntarios',
        description: 'Únete a nuestra gran celebración comunitaria. Un día de comida, risas y fraternidad preparado íntegramente por voluntarios dedicados. Todo lo recaudado va a la reconstrucción de hogares.',
        impact_description: 'Financia 2 ladrillos ecológicos para la reconstrucción de viviendas'
      },
      pt: {
        title: 'Churrasco Solidário dos Voluntários',
        description: 'Junte-se à nossa grande confraternização solidária. Um dia de churrasco, risadas e comunhão preparado inteiramente por voluntários dedicados à nossa causa. Toda a arrecadação vai para a reconstrução de moradias.',
        impact_description: 'Financia a compra de 2 tijolos ecológicos para a reconstrução'
      }
    }
  },
  {
    matcher: (item) => {
      const t = (item.title || '').toLowerCase();
      const id = String(item.id || '').toLowerCase();
      return id.includes('bone') || t.includes('boné');
    },
    translations: {
      en: {
        title: 'Official Bridge Builders Cap',
        description: 'Premium cap with bespoke embroidery. Ideal for outdoor relief missions and daily wear. Wear the badge of community resilience.',
        impact_description: 'Funds 1 portable solar emergency lamp for isolated families'
      },
      es: {
        title: 'Gorra Oficial Constructores de Puentes',
        description: 'Gorra premium con bordado exclusivo. Ideal para protegerse del sol en acciones comunitarias y el día a día. Luce el símbolo de resiliencia comunitaria.',
        impact_description: 'Financia 1 lámpara solar portátil de emergencia para familias aisladas'
      },
      pt: {
        title: 'Boné Oficial Construtores de Pontes',
        description: 'Boné premium com bordado exclusivo. Ideal para proteger do sol nos dias de ações esportivas ou no dia a dia. Vista o selo de apoio à resiliência das comunidades.',
        impact_description: 'Financia 1 lâmpada solar portátil de emergência para famílias isoladas'
      }
    }
  },
  {
    matcher: (item) => {
      const t = (item.title || '').toLowerCase();
      const id = String(item.id || '').toLowerCase();
      return id.includes('corrida') || t.includes('corrida');
    },
    translations: {
      en: {
        title: '5K Charity Community Run',
        description: 'A sports activity open to all ages. Let us run, walk, and exercise together for the greater good. Registration directly funds the Gulf Coast community solar hub.',
        impact_description: 'Funds a complete first-aid kit for the resilience center'
      },
      es: {
        title: 'Carrera Benéfica Comunitaria 5K',
        description: 'Una actividad deportiva abierta para todas las edades. Corramos, caminemos y ejercitémonos juntos por una causa noble. La inscripción apoya el centro comunitario solar de la Costa del Golfo.',
        impact_description: 'Financia un kit completo de primeros auxilios para el centro de resiliencia'
      },
      pt: {
        title: 'Corrida de Rua Beneficente 5K',
        description: 'Uma atividade esportiva aberta para todas as idades. Vamos correr, caminhar e nos exercitar juntos por um bem maior. O valor da inscrição apoia o centro comunitário solar da Costa do Golfo.',
        impact_description: 'Financia kit de primeiros socorros completo para o centro de resiliência'
      }
    }
  }
];

export function getTranslatedInitiative<T extends InitiativeLike>(initiative: T, currentLang: string = 'en'): T {
  if (!initiative) return initiative;

  const lang = (currentLang || 'en').slice(0, 2) as 'en' | 'pt' | 'es';
  const targetLang = ['en', 'pt', 'es'].includes(lang) ? lang : 'en';

  let translatedTitle = initiative.title || '';
  let translatedDesc = initiative.description || '';
  let translatedImpact = initiative.impact_description || '';

  // 1. First check dynamic translations from Admin panel
  let translationsObj: any = (initiative as any).translations_json || (initiative as any).translations;
  while (typeof translationsObj === 'string') {
    try {
      translationsObj = JSON.parse(translationsObj);
    } catch (e) {
      break;
    }
  }

  let foundDynamic = false;
  if (translationsObj && typeof translationsObj === 'object') {
    const tData = translationsObj[targetLang];
    const fallbackData = translationsObj.pt || translationsObj.en || translationsObj.es;

    if (tData) {
      if (tData.title && tData.title.trim()) {
        translatedTitle = tData.title.trim();
        foundDynamic = true;
      } else if (fallbackData?.title && fallbackData.title.trim()) {
        translatedTitle = fallbackData.title.trim();
      }

      if (tData.description && tData.description.trim()) {
        translatedDesc = tData.description.trim();
        foundDynamic = true;
      } else if (fallbackData?.description && fallbackData.description.trim()) {
        translatedDesc = fallbackData.description.trim();
      }

      if (tData.impact_description && tData.impact_description.trim()) {
        translatedImpact = tData.impact_description.trim();
        foundDynamic = true;
      } else if (fallbackData?.impact_description && fallbackData.impact_description.trim()) {
        translatedImpact = fallbackData.impact_description.trim();
      }
    } else if (fallbackData) {
      if (fallbackData.title && fallbackData.title.trim()) translatedTitle = fallbackData.title.trim();
      if (fallbackData.description && fallbackData.description.trim()) translatedDesc = fallbackData.description.trim();
      if (fallbackData.impact_description && fallbackData.impact_description.trim()) translatedImpact = fallbackData.impact_description.trim();
    }
  }

  // 2. If no dynamic translation found, check known initiatives registry
  if (!foundDynamic) {
    const match = KNOWN_INITIATIVES.find(entry => entry.matcher(initiative));
    if (match) {
      const tData = match.translations[targetLang];
      if (tData) {
        if (tData.title) translatedTitle = tData.title;
        if (tData.description) translatedDesc = tData.description;
        if (tData.impact_description) translatedImpact = tData.impact_description;
      }
    }
  }

  return {
    ...initiative,
    title: translatedTitle,
    name: translatedTitle,
    description: translatedDesc,
    impact_description: translatedImpact
  };
}
