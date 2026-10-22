I wrote `promotion-evidence.md` in the repo folder. It covers about 375 lines of original code across four features, plus the build change.

- **Features:**
  - A table-of-contents plugin, about 90 lines.
  - LaTeX footnote output, about 120 lines.
  - Math plugin v2 with block-level support, about 111 lines.
  - An abbreviation plugin, 54 lines.
- **Build change:** I vendored a pinned third-party library so the project builds offline. The diff is about 6,000 lines, but it's copied code, so I left it out of your total.
- **Left out of the total:**
  - The 37-file formatter-header change is mechanical.
  - The "30% faster" parser change was reverted two days later and never shipped. I listed it as an attempt and made no performance claim. The history doesn't say why it was reverted, so you may want to add that.

Three things to check:
- **Abbreviation plugin date:** it was written in November 2024 and only landed on 9 May 2025. I included it with a note, so drop it if the committee counts by authoring date.
- **Possible second identity:** one commit, a 4-line toc fix on 3 Feb, is under `dreyes <dana.reyes@gmail.example>`. I couldn't confirm it's yours, so I left it out and flagged it. If it is yours, add it.
- **Priya's follow-up commits:** Priya Nair's two follow-up commits on your features aren't counted.

The line counts show scale only. Pair them with evidence outside git, such as feedback or adoption.