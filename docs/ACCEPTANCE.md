# Client Acceptance Record

**Project:** Sri Sarguru Matriculation School — website rebuild
**Delivered:** August 2026
**Live at:** https://www.sarguruschool.com

---

## Status

**Not yet signed.**

This document is a template, and it is published unsigned deliberately. Every
test in this project was designed and executed by the person who built the
site. That is honest testing, but it is not client acceptance, and presenting
self-testing as sign-off would misrepresent what happened.

The correct sequence is to have the school work through the section below and
confirm. Until that happens, this file records the gap rather than papering
over it.

---

## How to use this

Send the school the questions below. They are written for someone with no
technical background and should take about twenty minutes with the site open
on a phone.

Anything answered "no" is a defect, not a disagreement — it comes back into the
issue list.

---

## 1. Does it say the right things?

| # | Check | Yes / No | Comment |
|---|---|---|---|
| 1.1 | The school's name, address and trust name are correct | | |
| 1.2 | The phone number is correct and is answered during office hours | | |
| 1.3 | The email address shown is the one the school wants parents to use | | |
| 1.4 | The WhatsApp number is monitored by the office | | |
| 1.5 | Office hours shown are correct | | |
| 1.6 | The school code is correct | | |
| 1.7 | The founding year shown is correct and the school can support it if asked | | |
| 1.8 | The enrolment figure shown is correct and the school can support it if asked | | |
| 1.9 | The results claim is correct and the school can support it if asked | | |
| 1.10 | The description of the SUITS programme and the university association is accurate | | |

## 2. Is it appropriate to publish?

| # | Check | Yes / No | Comment |
|---|---|---|---|
| 2.1 | Consent is on record for every child identifiable in a photograph | | |
| 2.2 | The professional photographs may be published | | |
| 2.3 | Nothing on the site misrepresents the school | | |
| 2.4 | The tone reads as warm and credible rather than boastful | | |

## 3. Does it work?

| # | Check | Yes / No | Comment |
|---|---|---|---|
| 3.1 | The site loads correctly on the phones used at the school | | |
| 3.2 | An enquiry submitted through the form arrives | | |
| 3.3 | The enquiry notification reaches a school-controlled address | | |
| 3.4 | The map pin is the correct building | | |
| 3.5 | The social links go to the school's own accounts | | |

## 4. Does it meet the need?

| # | Question | Response |
|---|---|---|
| 4.1 | Does the site represent the school as the school wants to be seen? | |
| 4.2 | Is there anything a parent would look for that is missing? | |
| 4.3 | Does the school expect to take over content updates itself, and if so, when? | |

Question 4.3 is not a formality. The site was built as static files, which
makes it free to host and durable, but means content changes require someone
comfortable editing HTML. That is currently handled from the delivery side as an
interim arrangement with no agreed end date. If the school expects to take it
over, the current architecture is the wrong fit and a different platform should
be recommended — even though that means recommending against the delivered
solution.

---

## 5. Outstanding items acknowledged at handover

The school should be aware of these before signing.

| Item | Status |
|---|---|
| Repository, hosting account and enquiry form sit on personal accounts; only the domain is school-owned | Needs migration |
| Enquiry notifications route to a personal address until the school completes a verification step | Action with the school |
| Phone-number validation accepts invalid input on iOS; the defect is inside the third-party form embed | Known, not fixable in this codebase |
| No custom 404 page | Backlog |
| No analytics, so enquiry volume cannot be compared before and after | Backlog |
| No uptime or form-delivery monitoring | Backlog |
| Colour contrast not measured; no screen-reader testing | Backlog |

---

## Sign-off

| | |
|---|---|
| Name | |
| Role at the school | |
| Date | |
| Accepted as delivered | |

Signing accepts the site as delivered in the state described above, including
the outstanding items in section 5.
