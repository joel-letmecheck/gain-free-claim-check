# Gain Lawyers — Free Claim Check

A Webflow-embeddable, client-side questionnaire that qualifies personal-injury
enquiry leads and submits them to a backend endpoint. Companion piece to the
Compensation Payout Calculator — same visual language, different job:

| | Compensation Calculator | Free Claim Check |
|---|---|---|
| Answers | How much could I get? | Do I have a claim? |
| Time | 5–10 min | 60–90 sec |
| Output | Dollar range | Callback request |
| Lead capture | Ungated | Built into the flow |

> **Important:** the tool never tells a user they *don't* have a claim and
> never produces a legal determination. Every path ends at the callback form.

## Files

| File | Purpose |
|---|---|
| `gain-claim-check.js` | All logic + all flow content (~25 KB). No dependencies. |
| `gain-claim-check.css` | Styling, mirrors the Calculator's olive/cream/sage palette (~5 KB). |
| `test.html` | Local/Pages preview harness. Not for production. |

Combined ~30 KB — well under Webflow's 50 KB single-embed limit.

## Embedding in Webflow

Each flow page gets one embed element:

```html
<link rel="stylesheet" href="gain-claim-check.css">
<div id="gain-claim-check" data-flow="motor-vehicle"></div>
<script src="gain-claim-check.js"></script>
```

| `data-flow` | Page slug |
|---|---|
| `motor-vehicle` | `/free-claim-check/motor-vehicle` |
| `workers-compensation` | `/free-claim-check/workers-compensation` |
| `public-liability` | `/free-claim-check/public-liability` |
| `medical-negligence` | `/free-claim-check/medical-negligence` |
| `abuse` | `/free-claim-check/abuse` |
| `other` | `/free-claim-check/other` |

The hub page `/free-claim-check` is pure Webflow design — no embed.

Optional override for the submission endpoint (e.g. staging):

```html
<div id="gain-claim-check" data-flow="motor-vehicle"
     data-endpoint="https://staging.example.com/submit"></div>
```

## Design notes

- Matches the Calculator: olive `#365E32`, cream `#F5F1E6`, sage `#7ABA78`,
  All Round Gothic headings + Graphik body, radio cards, numbered-dot progress.
- Fonts are inherited from the Webflow site (same as the Calculator); nothing
  is bundled.
- Classes use the `gcc-` prefix so both tools can coexist on one page.

## Architecture

- **Vanilla JS IIFE**, no framework, no build step — same approach as the
  Calculator's front end.
- All flow content lives in the `FLOWS` config object at the top of the JS.
  Copy edits (e.g. Jeremy's legal review tweaks) are find-and-replace.
- Inline legal notes are conditional — the QLD-specific deadline notes only
  render when the user selected Queensland.
- Route-out: picking "Another state" / "Overseas" (except the WC
  QLD/NSW-employer case) skips remaining questions and goes straight to the
  callback form, flagged as `routedOut` in the payload.
- Abuse flow has a modified form: phone **or** email suffices, and crisis-line
  copy appears before and after.
- Spam: hidden honeypot field (`website`) — server should also reject
  non-empty values.

## Lead payload (POST JSON)

```json
{
  "flow": "motor-vehicle",
  "routedOut": false,
  "answers": {
    "location": {"question": "Where did it happen?", "value": "qld", "label": "Queensland"},
    "impact":   {"question": "How has it affected you?", "value": ["pain","timeoff"], "label": "Ongoing pain or reduced movement, Time off work"}
  },
  "fullName": "Jo Bloggs",
  "phone": "0400 000 000",
  "email": "",
  "callbackTime": "morning",
  "note": "...",
  "story": "...",
  "timestamp": "2026-10-28T...",
  "pageUrl": "https://...",
  "website": ""
}
```

Multi-select answers send arrays; `story` is the optional medical-negligence
free-text box; `website` is the honeypot.

## Backend status — NOT YET BUILT

`ENDPOINT` in the JS is a **placeholder** (`https://claim-check.gainlawyers.com.au/submit`).
Until the backend exists, every submit falls back to the "something went
wrong — call 1300 11 GAIN" message.

Planned (per Joel): dedicated Lambda behind a subdomain — not a raw API
Gateway URL. It should:

- validate + sanitise the payload
- CORS-allow the Gain Webflow domain(s) only
- rate-limit + honour the honeypot
- respond with `X-Robots-Tag: noindex, nofollow`
- deliver the lead (intake inbox email and/or Actionstep API — still open)
- optional confirmation email to the user (open question in the brief)

## Preview

Local:

```bash
python3 -m http.server 8765
# open http://localhost:8765/test.html?flow=abuse
```

GitHub Pages: Settings → Pages → deploy `main` root →
`https://joel-letmecheck.github.io/gain-free-claim-check/test.html?flow=<flow>`

## Open items

- [ ] Jeremy's legal review → find-and-replace copy in `FLOWS`
- [ ] Verify Blue Knot Helpline number (1300 657 380) before launch
- [ ] Jeremy to decide: dedicated abuse email, National Redress Scheme note
- [ ] Confirm DVA handling (direct vs referral) for the `other` flow
- [ ] Footer disclaimer wording — currently drafted, needs legal sign-off
- [ ] Lambda + subdomain, email/Actionstep delivery, confirmation email decision
- [ ] Behzad: page-level SEO structure, internal links, nav placement
- [ ] Confirm `tel:` target for "1300 11 GAIN" (`1300114246`)
