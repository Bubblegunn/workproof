I've written `promotion-evidence.md` in the repo folder. Everything in it comes from the git history for January–June 2025.

**Delivered:**
- **Table-of-contents plugin (14 Jan):** about 60 lines plus 30 lines of tests.
- **Heading ID collision fix (3 Feb):** 4 lines.
- **LaTeX footnote output (12 Mar):** about 120 lines.
- **Math plugin v2 with block-level equations (15–16 Apr):** about 75 lines plus 36 lines of tests.

**Supporting work:** I listed the offline-build vendoring of `python-slugify` (about 6,000 lines of third-party code) separately and said it isn't your own authored code. The one-line header you added to 37 files is listed as a mechanical change, not feature work.

**Things to check before you submit:**
- **Personal-email commit:** The 3 Feb fix is under `dana.reyes@gmail.example` (user `dreyes`), not your work email. It's signed off as Dana Reyes, so I included it, but please confirm it's yours.
- **Reverted speedup:** The "30% faster" inline parser change was reverted two days later, and the history has no benchmark or reason. I told you not to cite it as an achievement.
- **Excluded commits:**
  - The abbreviation plugin is dated 30 Nov 2024, outside your window.
  - Priya Nair's commits (the footnote refactor and the abbreviation output tweak) and the dependabot bump are excluded.
- **What git can't show:** The history doesn't capture reviews, design work, mentoring or user impact. The file says so, and you'll want to add those yourself.