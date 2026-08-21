/**
 * Canonical entity data for the person Erik Rivera.
 *
 * This file is the SINGLE SOURCE OF TRUTH for every person-fact on this site.
 * No page, component, or meta tag may hard-code a name, job title, bio string,
 * or image URL — everything is derived from `ERIK` below.
 *
 * Three rules that keep the Knowledge Graph signals stable:
 *   1. `entityId` never changes. It is referenced (never redefined) by every page.
 *   2. `imageUrl` / `ogImageUrl` are PERMANENT URLs. Renaming either one breaks
 *      the image association Google has built up, and requires re-uploading the
 *      headshot on every off-site profile listed in `sameAs`.
 *   3. `shortBio` is byte-identical everywhere it appears: the visible first
 *      paragraph on the homepage, `<meta name="description">`, `og:description`,
 *      `twitter:description`, and `Person.description` in JSON-LD.
 */

export type VentureRole = 'Founder' | 'Co-Founder' | 'CEO' | 'Investor';

export interface Venture {
  name: string;
  url?: string;
  /** 'operating' renders under "Founded / Operate"; 'investment' under "Investments". */
  kind: 'operating' | 'investment';
  role: VentureRole;
  /** Optional qualifier shown next to the role in the visible ventures list. */
  note?: string;
}

export interface SameAsProfile {
  /** Anchor text on the homepage. Google reads anchor text, so name the platform. */
  label: string;
  url: string;
}

export interface TimelineEntry {
  years: string;
  organization: string;
  role: string;
  url?: string;
  description: string;
}

export interface PressMention {
  title: string;
  publisher: string;
  url: string;
}

const CANONICAL_URL = 'https://www.erikrivera.com/';

export const ERIK = {
  name: 'Erik Rivera',
  givenName: 'Erik',
  familyName: 'Rivera',

  canonicalUrl: CANONICAL_URL,

  /** Stable entity node id. NEVER change this value. */
  entityId: 'https://www.erikrivera.com/#erik-rivera',
  websiteId: 'https://www.erikrivera.com/#website',

  /** <= 160 characters. Asserted by tests/schema.test.ts. */
  shortBio:
    'Erik Rivera is the CEO of OnePet, the pet wellness company behind CertaPet and Honest Paws. Naval Academy graduate and former Navy EOD officer.',

  longBio: [
    'Erik Rivera is an American entrepreneur and the CEO of OnePet, the pet wellness holding company behind CertaPet, Honest Paws, Vets Preferred, ServiceDogs.com, and Total Vet. He graduated from the United States Naval Academy and served as an Explosive Ordnance Disposal (EOD) officer in the U.S. Navy, leading teams in environments where clarity and precision were non-negotiable.',
    'After leaving the Navy he founded CertaPet and grew it into OnePet, a group of direct-to-consumer brands serving millions of pet owners across the United States. He also invests in internet businesses where strong fundamentals meet scalable distribution, and lives in San Juan, Puerto Rico.',
  ],

  /** Fixed by the entity PRD (FR-9). Disambiguates from the stand-up comedian. */
  disambiguatingDescription:
    'American entrepreneur; CEO of OnePet (CertaPet, Honest Paws); U.S. Naval Academy graduate and former Navy EOD officer. Not the comedian.',

  notToBeConfusedWith:
    'Erik Rivera the entrepreneur is not the stand-up comedian of the same name.',

  jobTitle: 'Chief Executive Officer',
  approvedTitleString: 'Erik Rivera, CEO of OnePet',

  worksFor: {
    '@id': 'https://one.pet/#organization',
    name: 'OnePet',
    url: 'https://one.pet',
    foundingDate: '2017',
    description:
      'Pet wellness holding company behind CertaPet, Honest Paws, Vets Preferred, ServiceDogs.com, and Total Vet.',
  },

  /** Rendered verbatim in the homepage "At a glance" block. */
  brands: ['CertaPet', 'Honest Paws', 'Vets Preferred', 'ServiceDogs.com', 'Total Vet'],

  alumniOf: {
    name: 'United States Naval Academy',
    url: 'https://www.usna.edu/',
    sameAs: [
      'https://en.wikipedia.org/wiki/United_States_Naval_Academy',
      'https://www.wikidata.org/wiki/Q1378038',
    ],
  },

  service: 'U.S. Navy EOD officer',
  serviceOccupation: 'Explosive Ordnance Disposal Officer, U.S. Navy',

  location: {
    label: 'San Juan, Puerto Rico',
    addressLocality: 'San Juan',
    addressRegion: 'PR',
    addressCountry: 'US',
  },

  nationality: 'United States',

  /**
   * PERMANENT asset URLs — see rule 2 above. Square image feeds Person.image;
   * the 1200x630 crop feeds og:image / twitter:image.
   */
  imageUrl: 'https://www.erikrivera.com/images/erik-rivera.jpg',
  imageWidth: 1200,
  imageHeight: 1200,
  ogImageUrl: 'https://www.erikrivera.com/images/erik-rivera-og.jpg',
  ogImageWidth: 1200,
  ogImageHeight: 630,
  imageCaption: 'Erik Rivera, CEO of OnePet',

  twitterHandle: '@erikfrivera',

  /**
   * Only URLs that currently resolve to Erik's own profiles. Order here is the
   * order rendered on the homepage and emitted in JSON-LD `sameAs`.
   */
  profiles: [
    { label: 'LinkedIn', url: 'https://www.linkedin.com/in/erik-rivera/' },
    { label: 'X', url: 'https://x.com/erikfrivera' },
    { label: 'Instagram', url: 'https://www.instagram.com/erik.f.rivera/' },
    { label: 'Facebook', url: 'https://www.facebook.com/mr.erik.rivera' },
    { label: 'YouTube', url: 'https://www.youtube.com/@erikfrivera' },
    { label: 'Crunchbase', url: 'https://www.crunchbase.com/person/erik-rivera' },
    { label: 'Wellfound', url: 'https://wellfound.com/p/erikrivera' },
  ] satisfies SameAsProfile[],

  /**
   * Google Search Console HTML-tag verification token, e.g.
   * 'AbCdEf1234...'. The DNS TXT method on the erikrivera.com domain property
   * is preferred (it covers www and non-www); set this only if the DNS record
   * cannot be used. Non-null values emit <meta name="google-site-verification">.
   */
  googleSiteVerification: null as string | null,

  /**
   * Set to the QID (e.g. 'Q123456789') once the Wikidata item exists. The
   * Wikidata URL is then added to `sameAs` automatically — no code change.
   */
  wikidataQid: null as string | null,

  knowsAbout: [
    'Pet wellness',
    'Direct-to-consumer brands',
    'E-commerce',
    'Entrepreneurship',
    'Venture investing',
    'Holding companies',
    'Consumer health',
  ],

  /**
   * AdEspresso is an INVESTMENT ONLY. It must never carry a founder role and
   * must never appear in the "Founded / Operate" list (FR-5). Enforced by
   * tests/schema.test.ts.
   */
  ventures: [
    { name: 'OnePet', url: 'https://one.pet', kind: 'operating', role: 'CEO' },
    { name: 'CertaPet', url: 'https://www.certapet.com', kind: 'operating', role: 'Founder' },
    { name: 'Honest Paws', url: 'https://www.honestpaws.com', kind: 'operating', role: 'Founder' },
    { name: 'Vets Preferred', url: 'https://www.vetspreferred.co', kind: 'operating', role: 'Founder' },
    { name: 'Bullets2Bandages', kind: 'operating', role: 'Co-Founder' },
    { name: 'ServiceDogs.com', url: 'https://www.servicedogs.com', kind: 'operating', role: 'CEO', note: 'OnePet brand' },
    { name: 'Total Vet', kind: 'operating', role: 'CEO', note: 'OnePet brand' },
    { name: 'AdEspresso', kind: 'investment', role: 'Investor' },
    { name: 'Sellbrite', kind: 'investment', role: 'Investor' },
    { name: 'Shift.org', kind: 'investment', role: 'Investor' },
    { name: 'Circufiber', kind: 'investment', role: 'Investor' },
  ] satisfies Venture[],

  timeline: [
    {
      years: '2003–2007',
      organization: 'United States Naval Academy',
      role: 'Midshipman',
      url: 'https://www.usna.edu/',
      description: 'Graduated from the United States Naval Academy in Annapolis, Maryland.',
    },
    {
      years: '2007–2013',
      organization: 'U.S. Navy',
      role: 'Explosive Ordnance Disposal (EOD) Officer',
      description:
        'Served as a Navy EOD officer, leading teams through high-stakes environments where clarity and precision were non-negotiable.',
    },
    {
      years: '2012–2016',
      organization: 'Bullets2Bandages',
      role: 'Co-Founder',
      description:
        'Co-founded a veteran-run venture that turned spent ammunition into products funding wounded-veteran charities.',
    },
    {
      years: '2016–present',
      organization: 'CertaPet',
      role: 'Founder',
      url: 'https://www.certapet.com',
      description:
        'Founded CertaPet, connecting pet owners with licensed mental health professionals for emotional support animal evaluations.',
    },
    {
      years: '2017–present',
      organization: 'OnePet',
      role: 'Chief Executive Officer',
      url: 'https://one.pet',
      description:
        'Built CertaPet into OnePet, the pet wellness holding company behind CertaPet, Honest Paws, Vets Preferred, ServiceDogs.com, and Total Vet.',
    },
  ] satisfies TimelineEntry[],

  /**
   * Genuine third-party coverage only. Populated by the off-site corroboration
   * PRD; an empty list renders an honest "coverage is being collected" note
   * rather than fabricated links.
   */
  press: [] as PressMention[],

  /**
   * Rendered directly under the "Investments" heading. Beyond being accurate,
   * this sentence guarantees the FR-5 separation: no founder wording may appear
   * within 100 characters of "AdEspresso" anywhere in rendered site content.
   */
  investmentsLede:
    'Minority stakes in companies Erik has backed with his own capital. He holds no operating or executive role at any of them.',

  principles: ['Action generates information.', 'Simple is better.'],
} as const;

/** `sameAs` for JSON-LD: profile URLs plus Wikidata once the QID exists. */
export function sameAs(): string[] {
  const urls = ERIK.profiles.map((p) => p.url);
  if (ERIK.wikidataQid) urls.push(`https://www.wikidata.org/wiki/${ERIK.wikidataQid}`);
  return urls;
}

export const operatingVentures = ERIK.ventures.filter((v) => v.kind === 'operating');
export const investments = ERIK.ventures.filter((v) => v.kind === 'investment');
