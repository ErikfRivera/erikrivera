# erikrivera.com

The entity home for the person **Erik Rivera** — a static Astro site on Vercel whose
job is to be the one place Google's Knowledge Graph can read his facts from, and to
disambiguate him from the stand-up comedian of the same name.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server on http://localhost:4321 |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serve the built output |
| `npm run typecheck` | `astro check` — must report 0 errors |
| `npm test` | Schema regression suite (requires a build first) |
| `npm run vercel-build` | `build && test` — what Vercel runs |

Tests read `dist/`, so run `npm run build` before `npm test`. Vercel's build
command is `npm run build && npm test`: **a broken entity signal fails the deploy.**

## The one rule

Every person-fact on this site comes from [`src/data/entity.ts`](src/data/entity.ts).
No page, component, or meta tag may hard-code a name, job title, bio string, or
image URL. If you need to change a fact, change it there — the homepage copy, the
`<title>`, the meta description, the Open Graph tags, the JSON-LD, and the press kit
all re-derive from it, which is what keeps them from drifting apart.

Three values are load-bearing and must not change casually:

- **`entityId`** (`https://www.erikrivera.com/#erik-rivera`) — the stable node the
  whole graph hangs off. Every page references it; only the homepage defines it.
- **`imageUrl` / `ogImageUrl`** — permanent asset URLs. Renaming either one throws
  away the image association Google has built and forces a re-upload on every
  off-site profile in `sameAs`.
- **`shortBio`** — appears byte-identical as the visible first paragraph, the meta
  description, `og:description`, `twitter:description`, and `Person.description`.
  Keep it at or under 160 characters; the test suite enforces this.

## Structure

```
src/data/entity.ts          Single source of truth
src/components/SEOHead      Canonical URL, OG/Twitter, rel=me, JSON-LD — one place
src/components/PersonSchema  Builds the JSON-LD @graph
src/layouts/Base.astro      Shell + all styles
src/pages/{index,about,press,404}.astro
tests/schema.test.ts        Regression suite (33 assertions)
public/images/              Permanent headshot assets
```

## Open items that need a human

These four cannot be done from the repo. They are the remaining gap between what is
deployed and a claimable Knowledge Panel.

### 1. Replace the placeholder headshot — blocking

`public/images/erik-rivera.jpg` and `erik-rivera-og.jpg` are currently **generated
"ER" monogram placeholders**, not photographs. They exist so that nothing 404s (the
previously-deployed site referenced `/images/erik-rivera.jpg`, which did not exist and
301'd to the homepage — meaning the `ImageObject` in its schema resolved to HTML).

Replace both files in place, keeping the exact filenames:

| File | Size | Notes |
| --- | --- | --- |
| `public/images/erik-rivera.jpg` | 1200×1200 square | ≤400 KB, face-forward, neutral background, no watermark |
| `public/images/erik-rivera-og.jpg` | 1200×630 | Same shoot, same crop feel, face left-of-centre |

Use the same photo everywhere off-site — LinkedIn, X, Crunchbase, Wellfound — so
Google sees one face for one entity.

### 2. Verify the domain in Google Search Console

Required later to claim the panel; the panel has to exist first.

1. Add the **domain property** `erikrivera.com` (not the URL-prefix property — the
   domain property covers www, non-www, http and https in one).
2. Verify with the DNS TXT record in GoDaddy: host `@`, value `google-site-verification=…`.
3. Submit `https://www.erikrivera.com/sitemap-index.xml`.
4. Confirm `/`, `/about`, and `/press` each report "URL is on Google" via URL Inspection.

Use the **same Google account that owns the YouTube channel `@erikfrivera`** — shared
account ownership is a corroborating signal, and panel claiming later runs through it.

If the DNS record is not workable, set `googleSiteVerification` in `entity.ts` to the
HTML-tag token instead; the meta tag then renders on every page. DNS is preferred.

### 3. Add the Wikidata QID

Once the Wikidata item exists (off-site PRD), set `wikidataQid` in `entity.ts` to the
QID. The Wikidata URL is appended to `sameAs` automatically — no code change.

### 4. Confirm the Vercel domain settings

`https://www.erikrivera.com` is canonical. Non-www must 301 to www in the Vercel
project's Domains tab, or the canonical tag and the sitemap will disagree with what
actually resolves.

## Decisions taken, worth revisiting

- **AdEspresso is an investment, never a founded company.** `entity.ts` enforces the
  role, and a test asserts founder wording never appears within 100 characters of
  "AdEspresso" in any rendered page — in the raw HTML *and* in the visible text.
- **Bullets2Bandages is labelled "Co-Founder"**, the PRD default. If off-site sources
  will not corroborate it, soften the label in `entity.ts` and add a citation to the
  `/about` timeline entry.
- **Altva is not listed.** Kept off the entity home to hold the OnePet association
  tight; add it to `ventures` if that changes.
- **`birthDate` / `birthPlace` are omitted.** They would enrich a panel, but they are
  personal data the site does not otherwise disclose. Add to `entity.ts` and to
  `PersonSchema.astro` if the trade-off is worth it.
- **The X handle `@erikfrivera` is treated as permanent.** Renaming it breaks a
  `sameAs` entry and a `rel="me"` link.
