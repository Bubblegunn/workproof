# Q3 2025 Summary (July–September): Ines Kowalski

## Highlights

- **Shipped hex color support with an alpha channel** (mid-July). Colors written like `#ff000080` now work. This fixed washed-out colors that a customer had reported. The full test suite passed (212 tests) before the change was committed.
- **Added Node 22 to the CI matrix** (August), so the library is tested against the newest Node release.
- **Documented the new alpha color syntax in the readme** (end of September), so users can find the feature that shipped in July.

## Also worked on (not shipped)

- **Chained style lookup performance** (August). A first attempt measured about 2x faster on the chain benchmark. I held it back before merging because the numbers looked off. It needs a re-measurement before it can be trusted.
- **TypeScript types for level detection** (September). I added them, then reverted them a few days later. The work is parked and will need another pass.

## Themes

- **Customer-driven fixes.** The main deliverable came from a real customer report, and I followed it through from code to documentation.
- **Measure before merging.** I held back the performance change when the benchmark results didn't add up.
- **Compatibility upkeep.** I extended CI coverage to the latest Node version.

## Carry-over

- Re-benchmark the style lookup optimization and decide whether to ship it.
- Redo the TypeScript types for level detection.
