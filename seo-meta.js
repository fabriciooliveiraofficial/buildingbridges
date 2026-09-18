// Server-side SEO helpers.
//
// The site is a single-page app: the tags that react-helmet sets in the browser are NOT seen by crawlers
// that do not run JavaScript (Facebook / Instagram / WhatsApp / LinkedIn / X / Slack / Telegram link previews).
// server.js therefore rewrites the <head> of index.html per request with the values below, so every URL
// answers with its own title, description, canonical, robots and Open Graph tags.

export const SITE_NAME = 'Building Bridges Foundation';
export const DEFAULT_IMAGE_PATH = '/share/og-image.png'; // served by Node (see server.js), independent of the web server's static-file layer
export const DEFAULT_IMAGE_SIZE = { width: 1200, height: 630 };
export const DEFAULT_IMAGE_ALT = 'Building Bridges Foundation logo — Touching Nations, Changing Lives!';

// Indexable pages. `priority` / `changefreq` feed the sitemap.
export const PUBLIC_PAGES = {
  '/': {
    title: 'Building Bridges | Touching Nations, Changing Lives',
    description: 'Humanitarian disaster relief and support for families in need, disaster-stricken cities, and vulnerable individuals in Brazil and the USA.',
    priority: '1.0',
    changefreq: 'weekly'
  },
  '/projects': {
    title: 'Humanitarian Projects | Building Bridges',
    description: 'Explore our active and completed humanitarian projects. Your donation provides transparent disaster relief in real-time.',
    priority: '0.9',
    changefreq: 'weekly'
  },
  '/action-hub': {
    title: 'Action Hub & Urgent Projects | Building Bridges',
    description: 'Find out where we are acting right now. Urgent humanitarian response campaigns in Brazil and the United States.',
    priority: '0.8',
    changefreq: 'weekly'
  },
  '/contact': {
    title: 'Contact Us | Building Bridges',
    description: "Get in touch with our humanitarian coordination team in the US and Brazil. Let's build bridges of hope together.",
    priority: '0.6',
    changefreq: 'yearly'
  },
  '/privacy': {
    title: 'Privacy Policy | Building Bridges',
    description: 'How Building Bridges collects, uses and protects your personal information when you donate or use our website.',
    priority: '0.3',
    changefreq: 'yearly'
  },
  '/terms': {
    title: 'Terms of Service | Building Bridges',
    description: 'The terms and conditions that apply to the use of the Building Bridges website and donation services.',
    priority: '0.3',
    changefreq: 'yearly'
  }
};

// Functional / private pages: served normally, but kept out of search results.
export const PRIVATE_PAGES = {
  '/admin': 'Admin Console | Building Bridges',
  '/login': 'Staff Login | Building Bridges',
  '/register': 'Staff Registration | Building Bridges',
  '/forgot-password': 'Password Recovery | Building Bridges',
  '/reset-password': 'Reset Password | Building Bridges',
  '/checkout': 'Donate | Building Bridges',
  '/dashboard': 'Dashboard | Building Bridges'
};

// Pages that used to exist. Permanent redirects keep old links and old search results working.
export const LEGACY_REDIRECTS = {
  '/transparency': '/',
  '/impact': '/projects'
};

const PROJECT_PATH = /^\/impact\/([^/]+)$/;

export function matchProjectPath(pathname) {
  const m = PROJECT_PATH.exec(pathname);
  return m ? decodeURIComponent(m[1]) : null;
}

const escapeAttr = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export function truncate(text, max = 200) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

// Turns whatever is stored in projects.image_url into an absolute, crawlable URL (or null).
// Base64 data URIs cannot be used as og:image.
export function absoluteImageUrl(raw, siteUrl) {
  if (!raw || typeof raw !== 'string') return null;
  let first = raw.trim();
  if (first.startsWith('[')) {
    try {
      const list = JSON.parse(first);
      first = Array.isArray(list) && typeof list[0] === 'string' ? list[0] : '';
    } catch {
      return null;
    }
  }
  if (/^https?:\/\//i.test(first)) return first;
  if (first.startsWith('/') && !first.startsWith('//')) return `${siteUrl}${first}`;
  return null;
}

export function buildSeoBlock({ siteUrl, path, title, description, image, imageAlt, robots, ogType = 'website' }) {
  const canonical = `${siteUrl}${path === '/' ? '/' : path}`;
  const useDefaultImage = !image;
  const imageUrl = image || `${siteUrl}${DEFAULT_IMAGE_PATH}`;
  const t = escapeAttr(title);
  const d = escapeAttr(description);
  const img = escapeAttr(imageUrl);
  const alt = escapeAttr(imageAlt || DEFAULT_IMAGE_ALT);
  const r = escapeAttr(robots);

  const lines = [
    `<title data-seo-ssr>${t}</title>`,
    `<meta name="description" content="${d}" data-seo-ssr />`,
    `<meta name="robots" content="${r}" data-seo-ssr />`,
    `<link rel="canonical" href="${escapeAttr(canonical)}" data-seo-ssr />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" data-seo-ssr />`,
    `<meta property="og:type" content="${escapeAttr(ogType)}" data-seo-ssr />`,
    `<meta property="og:title" content="${t}" data-seo-ssr />`,
    `<meta property="og:description" content="${d}" data-seo-ssr />`,
    `<meta property="og:url" content="${escapeAttr(canonical)}" data-seo-ssr />`,
    `<meta property="og:locale" content="en_US" data-seo-ssr />`,
    `<meta property="og:locale:alternate" content="pt_BR" data-seo-ssr />`,
    `<meta property="og:locale:alternate" content="es_MX" data-seo-ssr />`,
    `<meta property="og:image" content="${img}" data-seo-ssr />`,
    `<meta property="og:image:secure_url" content="${img}" data-seo-ssr />`,
    `<meta property="og:image:alt" content="${alt}" data-seo-ssr />`
  ];
  if (useDefaultImage) {
    lines.push(
      `<meta property="og:image:type" content="image/png" data-seo-ssr />`,
      `<meta property="og:image:width" content="${DEFAULT_IMAGE_SIZE.width}" data-seo-ssr />`,
      `<meta property="og:image:height" content="${DEFAULT_IMAGE_SIZE.height}" data-seo-ssr />`
    );
  }
  lines.push(
    `<meta name="twitter:card" content="summary_large_image" data-seo-ssr />`,
    `<meta name="twitter:title" content="${t}" data-seo-ssr />`,
    `<meta name="twitter:description" content="${d}" data-seo-ssr />`,
    `<meta name="twitter:image" content="${img}" data-seo-ssr />`,
    `<meta name="twitter:image:alt" content="${alt}" data-seo-ssr />`
  );
  return `<!--seo:start-->\n    ${lines.join('\n    ')}\n    <!--seo:end-->`;
}

export function injectSeoBlock(html, block) {
  return html.replace(/<!--seo:start-->[\s\S]*?<!--seo:end-->/, () => block);
}

export function buildSitemapXml(siteUrl, projects = []) {
  const url = (loc, { lastmod, changefreq, priority } = {}) =>
    `  <url>\n    <loc>${escapeAttr(loc)}</loc>` +
    (lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : '') +
    (changefreq ? `\n    <changefreq>${changefreq}</changefreq>` : '') +
    (priority ? `\n    <priority>${priority}</priority>` : '') +
    `\n  </url>`;

  const entries = Object.entries(PUBLIC_PAGES).map(([p, meta]) =>
    url(`${siteUrl}${p}`, { changefreq: meta.changefreq, priority: meta.priority })
  );
  for (const project of projects) {
    entries.push(
      url(`${siteUrl}/impact/${encodeURIComponent(project.id)}`, {
        lastmod: project.lastmod,
        changefreq: 'weekly',
        priority: '0.7'
      })
    );
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;
}
