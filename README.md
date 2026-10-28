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

Optional: `data-webflow-form="my-form-id"` points the tool at a different
hidden Webflow form element (default ID: `gcc-webflow-form`).

| `data-flow` | Page slug |
|---|---|
| `motor-vehicle` | `/free-claim-check/motor-vehicle` |
| `workers-compensation` | `/free-claim-check/workers-compensation` |
| `public-liability` | `/free-claim-check/public-liability` |
| `medical-negligence` | `/free-claim-check/medical-negligence` |
| `abuse` | `/free-claim-check/abuse` |
| `other` | `/free-claim-check/other` |

The hub page `/free-claim-check` is pure Webflow design — no embed.

### Lead capture — native Webflow form (primary path)

Add one **hidden native Webflow Form** to each flow page (in a hidden div or
a section set to `display:none`), with element ID `gcc-webflow-form` and one
field per name below. On submit the tool fills these fields and calls
`form.requestSubmit()`, so Webflow's own handler stores the submission in
**Site settings → Forms** and sends the standard form notification email.

| Field name | Content |
|---|---|
| `name` | Full name (required) |
| `phone` | Phone (required except abuse flow) |
| `email` | Email (optional; abuse flow accepts phone OR email) |
| `callback-time` | morning / afternoon / evening |
| `note` | Optional free text |
| `story` | Optional free text (medical-negligence flow only) |
| `flow` | e.g. `motor-vehicle` |
| `routed-out` | `yes`/`no` — user picked a non-QLD/NSW location |
| `summary` | All answers, one "Question Answer" per line |
| `timestamp` | ISO timestamp |
| `page-url` | Page the lead came from |

Webflow form-field names are set per input in the Designer (Field settings →
Name). Keep them exactly as above.

**Fallback:** if no `#gcc-webflow-form` element exists on the page, the tool
POSTs JSON to `data-endpoint` (or the `ENDPOINT` constant in the JS) — useful
for staging or a future custom endpoint.

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

## Lead payload (fallback POST JSON, when no Webflow form is present)

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

## Backend — native Webflow forms, no Lambda

Decision: leads are captured by a **hidden native Webflow form** on each flow
page — Webflow stores submissions and emails the intake inbox. No Lambda or
custom endpoint needed for v1.

Setup per page:

1. Drop a Form Block on the page, name its fields per the table above, and
   give the form element ID `gcc-webflow-form` (or set `data-webflow-form`).
2. Wrap it in a hidden div (`display:none`) — the tool fills + submits it
   programmatically; users never see it.
3. Site settings → Forms → set the notification email to the intake inbox.
4. If the hidden form is missing, the tool falls back to POSTing to
   `data-endpoint`/`ENDPOINT` — currently a placeholder; the user then sees
   the "something went wrong — call 1300 11 GAIN" error.

Note: spam protection is Webflow's (they recommend reCAPTCHA in Site
settings); our client-side honeypot field also stays.

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
- [ ] Build the hidden Webflow form on each flow page (fields per table)
- [ ] Site settings → Forms: set intake notification email
- [ ] Actionstep delivery if needed later (Webflow → Zapier/Make, or revisit)
- [ ] Behzad: page-level SEO structure, internal links, nav placement
- [ ] Confirm `tel:` target for "1300 11 GAIN" (`1300114246`)
