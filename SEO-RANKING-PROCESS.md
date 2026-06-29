# SEO Ranking Process — AI-Assisted Playbook (HS Global Export)

_A repeatable, 9-step workflow to give each blog post the best shot at ranking #1, using AI at every step._

> **Honest caveat:** No process *guarantees* #1 — it depends on competition and domain authority. But this is the exact workflow that consistently gets posts onto page 1 and climbing. Run all 9 steps for **every** post.

---

## The 9-step ranking process (per blog)

### Step 1 — Pick ONE keyword with winnable intent
Choose the keyword **before** writing.
- Pick a primary keyword from a cluster (see `SEO-CONTENT-PLAN.md` Section 2), e.g. `marble dining table buying guide`.
- **Winnability test:** Google it. If page 1 is all giants (Wayfair, Pottery Barn), go more specific — `marble dining table for interior designers usa`. Long-tail = easier #1.
- **AI prompt:** _"Give me 15 long-tail keyword variations of '[topic]' with buyer or research intent, for a marble furniture exporter targeting USA/UK. Mark which are low-competition."_

### Step 2 — Mine the SERP (the real ranking secret)
Google ranks pages that answer the query **better than the current #1**. Study that #1.
- Open the top 5 results. Note: word count, H2/H3 sections, questions answered, and what they **miss**.
- Grab "People Also Ask" + "Related searches" — free subtopics Google wants covered.
- **AI prompt:** _"Here are the top 5 articles ranking for '[keyword]' [paste headings/excerpts]. Build me an outline that covers everything they cover PLUS 3 angles they all miss. Group into H2/H3."_

### Step 3 — Build the outline (search intent + your edge)
- Match the dominant intent (guide? comparison? buying?).
- Your unique edge = **first-party authority**: you're the manufacturer/exporter. AI can't fake "we crate and ship this internationally." Bake it in — it's your E-E-A-T moat.

### Step 4 — Draft with AI, then inject real expertise
- Let AI write the structural draft from the outline.
- **Then add what AI can't know:** real lead times, real duty/shipping notes, actual material specs, photos of *your* pieces, a real customer scenario. This is what beats thin AI content.
- **AI prompt:** _"Write a [1500-word] article from this outline for HS Global Export, a marble furniture manufacturer/exporter. Tone: expert, helpful, not salesy. Leave [BRACKETED PLACEHOLDERS] where I should insert our real shipping times, specs, and product examples."_

### Step 5 — On-page SEO pass
Run the checklist (`SEO-CONTENT-PLAN.md` Section 5):
- Primary keyword in: H1, first 100 words, one H2, meta title, URL slug, image alt.
- Title ≤ 60 chars, meta description ≤ 155 with the keyword.
- 2–3 internal links to the pillar category + product pages; 1–2 links to sibling posts.
- **AI prompt:** _"Audit this draft for on-page SEO for keyword '[keyword]'. Check keyword placement, heading structure, meta title/description, and suggest internal anchor text linking to our category and product pages."_

### Step 6 — Add structured data + media
- `BlogPosting` JSON-LD (author = HS Global Export, real dates).
- Add an FAQ section → `FAQPage` schema (can win the "People Also Ask" box).
- Original images with descriptive alt text (your visuals = Google Images + trust signal).

### Step 7 — Publish, then force indexing
- Confirm it's in `sitemap.xml` (static blogs need the `STATIC_BLOGS` entry — already wired in `frontend-new/app/sitemap.ts`).
- Submit the exact URL in **Google Search Console → URL Inspection → Request Indexing**. Don't wait for the crawler.

### Step 8 — Build internal + external links
- Link to the new post from related existing posts and the category page (internal links pass authority fast).
- External: get 1–2 mentions (interior-design directories, a supplier listing, a guest mention). For a small domain, even a few quality links move rankings hard.

### Step 9 — Measure, then improve (the step everyone skips)
Rankings are won on the **second** edit, not the first.
- After 3–4 weeks, check Search Console: which queries get impressions but rank #8–20?
- **Update the post** to answer those exact queries, re-request indexing. Google rewards freshness.
- **AI prompt:** _"This post ranks #12 for '[query]' but gets impressions. Here's the current content. Suggest specific additions/edits to push it onto page 1 for that query."_

---

## What actually decides #1 (priorities, honest)

1. **Match intent + be more complete than the current #1** (Steps 2–4) — ~50% of it.
2. **Topical authority** — having the *whole cluster* (all 12 posts) makes each one rank better. One post alone is weak.
3. **First-party expertise** — your manufacturer angle is the thing competitors can't copy.
4. **Internal links + indexing speed** (Steps 5, 7, 8).
5. **Patience** — new content typically takes 4–12 weeks to settle. Step 9 is where you win.

---

## Per-post quick checklist (copy this per blog)

```
[ ] 1. Keyword chosen + winnability checked
[ ] 2. Top-5 SERP mined, PAA captured
[ ] 3. Outline covers all competitors + 3 missing angles
[ ] 4. Draft written, real specs/shipping/photos injected
[ ] 5. On-page pass: H1, meta, slug, alt, internal links
[ ] 6. BlogPosting + FAQPage JSON-LD added, images with alt
[ ] 7. Published, in sitemap, indexing requested in GSC
[ ] 8. Internal links added, 1–2 external mentions chased
[ ] 9. (3–4 wks later) Reviewed GSC, post updated, re-indexed
```
