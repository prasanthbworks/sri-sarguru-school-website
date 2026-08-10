# Solution Design (As-Built)

System documentation for the Sri Sarguru website as delivered.

**Compiled:** August 2026, after implementation. This is an as-built record of
the delivered system, not a specification that drove the build. It is written
after the fact and does not claim otherwise.

**Scope note:** operational details — account credentials, exact DNS record
values, notification addresses — are deliberately excluded from this public
document. They live in a private handover held with the client.

---

## 1. Overview

A two-page static marketing website for a matriculation school in Coimbatore,
serving prospective parents researching schools for their children.

| | |
|---|---|
| Type | Static marketing site |
| Pages | Home, Our School |
| Stack | Hand-coded HTML, CSS, JavaScript |
| Framework | None |
| Build step | None |
| Dependencies | None at build time; two third-party embeds at runtime |
| Hosting | Vercel, free tier |
| Deployment | Automatic on push to the main branch |
| Domain | School-owned, registered elsewhere, DNS pointed at the host |

## 2. Architecture

The architecture is deliberately close to nothing. Files are served exactly as
they sit in the repository. There is no server, no database, no build pipeline
and no authentication.

```
Author  →  Git repository  →  Host (build + CDN)  →  Browser
                                                        ├── enquiry form embed
                                                        └── video player embeds
```

Two runtime dependencies reach outside the site: a hosted enquiry form loaded
into the page, and video players loaded on demand when a visitor clicks a
video. Both fail soft — if either is unavailable, the rest of the page renders
and the alternative contact routes still work.

**Why this shape.** The site has fixed content, no users to authenticate and no
data to store. Every layer that could have been added — a CMS, a framework, a
backend for the form — is a component that can fail at a school with nobody
available to fix it. The architecture optimises for surviving neglect.

## 3. Components

### Pages

Two HTML files. The home page carries the school introduction, academic
positioning, the SUITS programme, life beyond the classroom, galleries,
community videos, the enquiry form and contact details. The Our School page
carries the school's story, its beliefs and vision, and further galleries.

### Styling

A single stylesheet. Layout uses CSS Grid and Flexbox. Three breakpoints
matter: wide desktop, the point at which the navigation collapses, and mobile.

### Behaviour

One JavaScript file, no dependencies. It handles navigation scroll-spy, reveal
animations on scroll, the galleries, the marquee, click-to-play video facades,
and loading the enquiry form.

### Media

Roughly 37 photographs from the school's own archive, uniformly colour-graded,
plus two institutional marks extracted from a photograph of the school's own
signage. All assets are flat at the repository root — there is no `images/`
directory, and this is load-bearing (see §7).

## 4. Enquiry flow

1. A parent lands on the home page, most often on a phone.
2. The enquiry form loads into the page from a hosted third-party service.
3. The parent submits name, contact details and their enquiry.
4. The service stores the submission and sends a notification email.
5. The school follows up by phone or WhatsApp.

Alternative routes are always visible: a phone number, a WhatsApp link and an
email address, all in the contact section and the footer. The form is a
convenience, not a single point of failure.

## 5. Deployment

Push to the main branch. The host builds and publishes automatically, usually
within a minute. There is no manual deployment step and no staging environment
— for a two-page static site with a full pre-release test cycle, a staging
environment would be ceremony rather than safety.

Verification after any change: check at desktop width, at the navigation
breakpoint and at mobile width, with a hard refresh. The navigation and the
framed image ratios behave differently at each.

## 6. Non-functional characteristics

**Performance.** No framework, no build output, no render-blocking third-party
scripts on initial load. Video players load only on click. Images are sized for
their display dimensions. Served from the host's CDN.

**Accessibility.** Alt text on all content images, a single `<h1>` per page,
visible focus states, skip-to-content link, dialog semantics and focus trapping
on overlays, Escape to close with focus returned to the trigger, keyboard
control of galleries, `prefers-reduced-motion` honoured, and a no-JavaScript
fallback for the enquiry form. Verified by 13 automated cases plus keyboard
walkthrough.

**Not verified:** colour contrast was not measured against WCAG AA, and the
site has not been tested with a screen reader. Both are open work rather than
completed work, and are named here rather than implied by the list above.

**Responsiveness.** Three breakpoints, verified on real iOS and Android devices
as well as at simulated widths.

**Availability.** Static files on a CDN. The realistic failure modes are the
host's platform, the domain's DNS, and the third-party form — not the site
itself.

**Security.** No server, no database, no authentication, no user data stored in
the application. The attack surface is the repository, the hosting account and
the form provider. Enquiry data — names and contact details of prospective
students' families — sits with the form provider, which is the most significant
data-protection consideration in the system.

**Maintainability.** No dependencies means no dependency upgrades and no
security patching treadmill. It also means content changes require editing HTML.
That trade-off is discussed in the decision log.

**Cost.** No recurring hosting or platform cost. The only recurring cost is
domain renewal, which the school already carried.

## 7. Operational notes

Things that cost time once.

**Asset paths are flat.** There is no `images/` directory. A build once shipped
with nested paths against a flat repository and returned 404 for every
photograph in production. Every asset reference is now verified against the
deployed tree before release.

**The DNS zone contains more than this site.** A live mail service runs on the
domain. Any DNS change must leave the mail records untouched. The registrar
does not permit external nameservers, so records are edited individually.

**Navigation styling has a specificity trap.** A selector for navigation links
outranks the general button class. Any button placed in the navigation needs
styling at matching specificity or it is silently overridden.

**Hosting is IPv4 only** for custom domains via third-party DNS.

## 8. Known limitations

- Content changes require editing HTML and pushing to the repository.
- Enquiry notification routing is constrained by the form provider's free tier.
- A phone-number validation defect on iOS sits inside the third-party form
  embed and cannot be fixed from this codebase.
- No custom 404 page; the host's generic page is served.
- No analytics, and therefore no measurement of the objective the site was
  built to serve.
- No uptime or delivery monitoring.

## 9. Governance

The domain is school-owned. The repository, the hosting account and the form
account are all held on personal accounts belonging to the implementer.

This is the most significant non-technical risk in the system. If the project
transfers or the implementer becomes unavailable, the school controls its
domain and nothing else. Migrating these three accounts to school ownership is
the first recommended action of any handover.

It is recorded here rather than omitted, because a handover document that
leaves out its own weakest point is not doing its job.

## 10. Recommended next work

**Before anything else.** Migrate account ownership to the school. Resolve
enquiry notification routing to a school-controlled address. Obtain written
confirmation of the content figures currently held only as a verbal assurance.

**Then.** Add analytics so the site's objective becomes measurable. Add a
custom 404 page. Resolve or replace the form to fix the iOS validation defect.
Measure colour contrast and run a screen-reader pass.

**Decide.** Who maintains content once the current interim arrangement ends.
The static architecture is correct only while someone comfortable editing HTML
is available. That answer determines whether this design remains right.
