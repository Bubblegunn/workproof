<!--
Adapted from JD Resume Tailor (https://github.com/Day-Raval/jd-resume-tailor), skills/jd-resume-tailor/SKILL.md
(step 8 "Tag sources" and "Hard rules") and references/style-guide.md section 1 ("Bullet structure").
Copyright (c) 2026 Dayesh Raval. MIT License. The permission notice is at the end of this file.
Changes: the facts come from a workproof report instead of a portfolio bank, the source tag names a figure id and
the report hash, and the rules about numbers are about what git can and cannot show.
-->

# CV bullets and a self-review paragraph from a report

Run `npx workproof` first (see SKILL.md), then `check` and `verify`. Every bullet and sentence below is built from `workproof-report.json`. Nothing else is a fact.

## Source tags

End every bullet with a tag naming the figure and the first 8 characters of the report's `hash`: `[survivingLines #<first 8 characters of hash>]`. A bullet without a tag is invalid: delete it. Never add a number the report does not contain; do not round, estimate, combine or recount. The facts you may use, with their figure ids:

- `tenure`: first and last commit date, days.
- `commitShare`: the author's non-merge commits and the total inside the tenure window.
- `survivingLines`: the author's lines still in HEAD, out of the attributed lines.
- `filesAuthored`, `footprint` (files touched, languages), `cadence` (active weeks), `testsAndDocs`, `majorContributor`, `commitSize`, `absenceFactor`, `aiAssisted`.

## Bullet structure

Adapted from the Google XYZ arc, with the impact clause limited to what git can show.

- One bullet per figure family. Never two bullets from the same figure.
- Lead with a strong past-tense verb. Never reuse an opening verb within one set. Approved pool: Authored, Wrote, Contributed, Tested, Documented. Do not use verbs that claim what git cannot show, such as Shipped, Delivered, Released, Maintained or Led.
- State what was counted, then the number, then the scope: "Authored <lines> of the <attributed> lines still in the project today (<share>) [survivingLines #<hash8>]", with every value copied from the report.
- 35 words or fewer per bullet.
- Say what the number counts: commits are activity, surviving lines are what lasted. Keep the two shares in separate bullets.
- Name the repository by the name the report uses, or by a description the user gives ("a client billing service"). No paths, no emails.

## Banned

- Impact git cannot show: speed-ups, percent improvements, users, revenue, uptime, "led", "owned", "top contributor", "sole author", seniority.
- Em dashes and en dashes. Use commas or periods.
- Filler: "responsible for", "worked on", "helped", "various", "utilized".
- First-person pronouns in CV bullets.
- Any email address.

## How many

Write exactly the number of bullets the user asked for, in the file they named. If the report supports fewer distinct figures than requested, say so and write fewer; do not stretch. After the bullets add one line: `Check: npx workproof verify workproof-report.json --repo .` and the limits in one sentence: the figures show survival and activity, not quality.

## Self-review paragraph

For a promotion, review or "how much of this is mine" request.

- Under 120 words, plain prose, first person is fine here.
- Contains the commit figure and the surviving-lines figure as the report states them, with their windows ("in my tenure window", "still in the code today"), kept apart.
- Does not call the person the owner, the lead or the top contributor, and makes no claim about quality or impact.
- Tells the manager how to check it: the report hash prefix and `npx workproof verify workproof-report.json --repo .` in the repository.
- Ends with what the figures do not show.

Shape (fill from the report): "In <repo> I made <the commitShare author count> of the <commitShare total> commits in my tenure window (<share>), and <lines> of the <attributed> lines still in the code today (<share>). The first number counts activity; the second counts what survived, and I read them separately. The figures come from workproof report <hash prefix>; you can recompute them with `npx workproof verify workproof-report.json --repo .` in the repository. They show survival and activity, not quality or design."

## Final checklist

- [ ] Every bullet has a source tag and every number is in the report
- [ ] 35 words or fewer, past tense, opening verbs differ
- [ ] No impact claim, no email, no em or en dash
- [ ] The two shares are not merged into one claim
- [ ] The count matches what the user asked for
- [ ] `check` and `verify` ran and the answer says so

## Licence of the adapted material

MIT License

Copyright (c) 2026 Dayesh Raval

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
