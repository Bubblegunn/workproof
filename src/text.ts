/**
 * Text that has to survive being embedded in someone else's sentence.
 */

/** Scripts written right to left, whose first strong character sets a paragraph's direction. */
const RTL = /[\p{sc=Arabic}\p{sc=Hebrew}\p{sc=Syriac}\p{sc=Thaana}\p{sc=Nko}\p{sc=Samaritan}\p{sc=Mandaic}\p{sc=Adlam}]/u;

/**
 * Wrap a name, a repository name or any other borrowed string in the first strong isolate, so it
 * cannot reorder the sentence it is dropped into.
 *
 * The plain-language paragraph puts the author's name at the start of a sentence and the
 * repository's name in the middle of it. An Arabic or Hebrew name there is the first strong
 * character of the paragraph, which under the bidirectional algorithm makes the whole paragraph
 * right to left: the English words after it reverse, and the numbers land in the wrong order.
 * U+2068 and U+2069 are what UAX #9 provides for embedding text of unknown direction
 * (https://www.unicode.org/reports/tr9/, section 2.7). They are default-ignorable, so they take
 * no width, and they are added only to strings that carry strong right-to-left characters, so
 * every other report is byte for byte what it was.
 *
 * This is presentation only. The report's data, and therefore its hash, keeps the exact string
 * git holds: `workproof verify` on a report written before this change still passes.
 */
export function isolate(s: string): string {
  if (!RTL.test(s) || /\p{Bidi_Control}/u.test(s)) return s;
  return `⁨${s}⁩`;
}
