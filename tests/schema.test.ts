import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ERIK, sameAs } from '../src/data/entity';

const DIST = join(process.cwd(), 'dist');

function html(page: string): string {
  const path = join(DIST, page);
  if (!existsSync(path)) {
    throw new Error(`${page} not found in dist/ — run \`npm run build\` before \`npm test\`.`);
  }
  return readFileSync(path, 'utf8');
}

/** Every JSON-LD node in a built page, flattened out of its @graph. */
function nodes(page: string): any[] {
  const source = html(page);
  const blocks = [...source.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )];
  expect(blocks.length, `${page} should carry exactly one JSON-LD block`).toBe(1);
  const parsed = JSON.parse(blocks[0]![1]!);
  expect(parsed['@context']).toBe('https://schema.org');
  return parsed['@graph'];
}

/** Visible text: scripts and styles stripped, tags removed, whitespace collapsed. */
function visibleText(page: string): string {
  return html(page)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#8217;|&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
}

function metaContent(page: string, attr: string, value: string): string | undefined {
  const source = html(page);
  const pattern = new RegExp(
    `<meta[^>]*${attr}=["']${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}["'][^>]*content=["']([^"']*)["']`,
    'i',
  );
  return pattern.exec(source)?.[1];
}

function decode(value: string): string {
  return value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

const PAGES = ['index.html', 'about.html', 'press.html'];

describe('canonical entity data', () => {
  it('keeps the short bio within the 160-character meta description budget', () => {
    expect(ERIK.shortBio.length).toBeLessThanOrEqual(160);
  });

  it('uses the frozen entity id', () => {
    expect(ERIK.entityId).toBe('https://www.erikrivera.com/#erik-rivera');
  });

  it('lists AdEspresso as an investment only', () => {
    const adEspresso = ERIK.ventures.filter((v) => v.name === 'AdEspresso');
    expect(adEspresso).toHaveLength(1);
    expect(adEspresso[0]!.kind).toBe('investment');
    expect(adEspresso[0]!.role).toBe('Investor');
  });

  it('never assigns a founder role to any investment', () => {
    const founderRoles = ERIK.ventures.filter(
      (v) => v.kind === 'investment' && /founder/i.test(v.role),
    );
    expect(founderRoles).toEqual([]);
  });
});

describe('homepage JSON-LD', () => {
  it('defines exactly one Person node with the canonical @id', () => {
    const people = nodes('index.html').filter((n) => n['@type'] === 'Person');
    expect(people).toHaveLength(1);
    expect(people[0]['@id']).toBe(ERIK.entityId);
  });

  it('describes the Person with the canonical short bio', () => {
    const person = nodes('index.html').find((n) => n['@type'] === 'Person');
    expect(person.description).toBe(ERIK.shortBio);
    expect(person.disambiguatingDescription).toBe(ERIK.disambiguatingDescription);
  });

  it('carries at least seven sameAs profile URLs, in entity order', () => {
    const person = nodes('index.html').find((n) => n['@type'] === 'Person');
    expect(person.sameAs.length).toBeGreaterThanOrEqual(7);
    expect(person.sameAs).toEqual(sameAs());
  });

  it('points worksFor, alumniOf and image at the expected entities', () => {
    const person = nodes('index.html').find((n) => n['@type'] === 'Person');
    expect(person.worksFor['@id']).toBe('https://one.pet/#organization');
    expect(person.worksFor.name).toBe(ERIK.worksFor.name);
    expect(person.alumniOf.name).toBe(ERIK.alumniOf.name);
    expect(person.image.url).toBe(ERIK.imageUrl);
    expect(person.image.width).toBe(ERIK.imageWidth);
    expect(person.image.height).toBe(ERIK.imageHeight);
    expect(person.image.caption).toBe(ERIK.imageCaption);
  });

  it('emits WebSite and WebPage nodes wired to the Person', () => {
    const graph = nodes('index.html');
    const website = graph.find((n) => n['@type'] === 'WebSite');
    const page = graph.find((n) => String(n['@type']).endsWith('Page'));
    expect(website['@id']).toBe(ERIK.websiteId);
    expect(website.publisher['@id']).toBe(ERIK.entityId);
    expect(page.about['@id']).toBe(ERIK.entityId);
    expect(page.isPartOf['@id']).toBe(ERIK.websiteId);
  });
});

describe('every page', () => {
  it.each(PAGES)('%s references the Person by @id without redefining it', (page) => {
    const graph = nodes(page);
    const webPage = graph.find((n) => String(n['@type']).endsWith('Page'));
    expect(webPage.about['@id']).toBe(ERIK.entityId);
    if (page !== 'index.html') {
      expect(graph.filter((n) => n['@type'] === 'Person')).toHaveLength(0);
    }
  });

  it.each(PAGES)('%s names a disambiguator in its title and description', (page) => {
    const title = /<title>([\s\S]*?)<\/title>/i.exec(html(page))?.[1] ?? '';
    const description = metaContent(page, 'name', 'description') ?? '';
    const disambiguators = /OnePet|CertaPet|Naval Academy/i;
    expect(disambiguators.test(decode(title)), `title: ${title}`).toBe(true);
    expect(disambiguators.test(decode(description)), `description: ${description}`).toBe(true);
  });

  it.each(PAGES)('%s is indexable', (page) => {
    expect(metaContent(page, 'name', 'robots')).not.toMatch(/noindex/i);
  });

  it.each(PAGES)('%s links every sameAs profile with rel="me"', (page) => {
    const source = html(page);
    for (const profile of ERIK.profiles) {
      expect(source, `${page} is missing rel=me for ${profile.url}`).toContain(
        `<link rel="me" href="${profile.url}">`,
      );
    }
  });

  it.each(PAGES)('%s never places founder wording near AdEspresso (FR-5)', (page) => {
    for (const haystack of [html(page), visibleText(page)]) {
      for (const match of haystack.matchAll(/AdEspresso/gi)) {
        const from = Math.max(0, match.index - 100);
        const window = haystack.slice(from, match.index + 'AdEspresso'.length + 100);
        expect(window, `founder wording within 100 chars of AdEspresso in ${page}`).not.toMatch(
          /founder/i,
        );
      }
    }
  });
});

describe('homepage visible text matches the schema', () => {
  it('uses the exact required title', () => {
    const title = decode(/<title>([\s\S]*?)<\/title>/i.exec(html('index.html'))![1]!);
    expect(title).toBe(
      'Erik Rivera — CEO of OnePet | Naval Academy Grad, Former Navy EOD Officer',
    );
  });

  it('has an H1 of exactly the entity name', () => {
    const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html('index.html'))![1]!;
    expect(h1.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()).toBe(ERIK.name);
  });

  it('opens with the short bio verbatim, byte-identical to the meta description', () => {
    const text = visibleText('index.html');
    expect(text).toContain(ERIK.shortBio);
    expect(decode(metaContent('index.html', 'name', 'description')!)).toBe(ERIK.shortBio);
    expect(decode(metaContent('index.html', 'property', 'og:description')!)).toBe(ERIK.shortBio);
    expect(decode(metaContent('index.html', 'name', 'twitter:description')!)).toBe(ERIK.shortBio);
  });

  it('states every At a glance value exactly as the schema does', () => {
    const text = visibleText('index.html');
    for (const value of [
      `${ERIK.jobTitle}, ${ERIK.worksFor.name}`,
      ERIK.brands.join(', '),
      ERIK.alumniOf.name,
      ERIK.service,
      ERIK.location.label,
    ]) {
      expect(text, `missing At a glance value: ${value}`).toContain(value);
    }
  });

  it('renders every sameAs URL as a followable link, in schema order', () => {
    const source = html('index.html');
    const anchors = [...source.matchAll(/<a href="(https:\/\/[^"]+)"[^>]*rel="me noopener"/g)].map(
      (m) => m[1],
    );
    expect(anchors).toEqual(ERIK.profiles.map((p) => p.url));
    for (const url of anchors) {
      const tag = new RegExp(`<a href="${url!.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`).exec(
        source,
      )![0];
      expect(tag, `${url} must stay followable`).not.toMatch(/nofollow/i);
    }
  });
});

describe('canonical assets', () => {
  it('ships both headshot files at their permanent paths', () => {
    for (const file of ['erik-rivera.jpg', 'erik-rivera-og.jpg']) {
      expect(existsSync(join(DIST, 'images', file)), `dist/images/${file} is missing`).toBe(true);
    }
  });

  it('uses the square headshot in schema and the social crop in OG/Twitter', () => {
    expect(decode(metaContent('index.html', 'property', 'og:image')!)).toBe(ERIK.ogImageUrl);
    expect(decode(metaContent('index.html', 'name', 'twitter:image')!)).toBe(ERIK.ogImageUrl);
    expect(decode(metaContent('index.html', 'property', 'og:image:alt')!)).toBe(ERIK.imageCaption);
    const person = nodes('index.html').find((n) => n['@type'] === 'Person');
    expect(person.image.url).toBe(ERIK.imageUrl);
  });

  it('serves a sitemap listing all three entity pages', () => {
    const index = html('sitemap-index.xml');
    expect(index).toContain('sitemap-0.xml');
    // An empty path is equivalent to `/` (RFC 3986 6.2.3), so accept either
    // form for the root.
    const listed = [...html('sitemap-0.xml').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
      m[1]!.replace(/\/$/, ''),
    );
    expect(listed).toEqual([
      'https://www.erikrivera.com',
      'https://www.erikrivera.com/about',
      'https://www.erikrivera.com/press',
    ]);
  });

  it('allows all crawlers and advertises the sitemap', () => {
    const robots = html('robots.txt');
    expect(robots).toContain('Allow: /');
    expect(robots).not.toMatch(/Disallow:\s*\/\s*$/m);
    expect(robots).toContain('Sitemap: https://www.erikrivera.com/sitemap-index.xml');
  });
});
