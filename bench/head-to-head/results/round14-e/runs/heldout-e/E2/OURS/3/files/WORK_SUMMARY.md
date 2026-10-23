# Summary of work at Northwind Logistics

**Prepared for:** skilled-worker visa application
**Person:** Dmitri Volkov
**Employer:** Northwind Logistics
**Period covered:** January 2025 to October 2025 (the dates on which the work was recorded)

## What this document is

Northwind Logistics keeps a dated record of every change its engineers make to its shipping software. This summary is drawn from that record. It describes what was built, in plain terms. It does not show the software itself, which belongs to the company.

## The area I worked in

The software reads shipping manifests, the lists of goods carried on each delivery, and answers questions about them. It is built on a widely used open-source tool for searching structured data. That tool was not written by me or by Northwind. My work was the company-specific layer on top of it.

## What I built and fixed

1. **Searching shipment manifests (January 2025).** I added a way for staff and other systems to look up specific details inside a manifest, such as one item on one delivery, without reading the whole document by hand.
2. **Correcting invoice totals (February 2025).** I fixed a rounding mistake that made invoice totals for a retail customer slightly wrong.
3. **Handling very large manifests (April 2025).** I added a reader that processes big manifests in pieces. Before this, very large files were slow or hard to open.
4. **Retiring the old export tool (May 2025).** Once the new search made it unnecessary, I removed the older export tool that fed the company's previous business system. A colleague wrote that tool. My part was the removal.
5. **Correcting dates across time zones.** I fixed how delivery dates in manifests are read, so a date does not shift when the data crosses time zones.
6. **Testing unusual cases (August 2025).** I wrote a set of checks for unusual manifests, so that future changes do not quietly break the search.
7. **Writing the user guide (October 2025).** I documented how to use the manifest search, so other staff can use it without asking me.

## Size of the work

- The record contains **10** changes credited to me.
- **7** of them are the pieces of work above.
- **3** are not counted as finished work: a settings change, an automatically generated data table, and an unfinished draft.
- I added **5,622** lines in total. **5,000** of those were produced automatically by a tool, so the lines I wrote are **622**.
- I also deleted **2,500** lines when the old export tool was retired.

## What this record does and does not show

- It shows what changed, who made the change and when. It does not show how long the work took or how well it worked in daily use.
- One change (the time-zone fix) carries an unreliable date in the record, so I have not given a date for it. It was recorded in July 2025.
- Colleagues also worked on this software, including the route calculations, the connection to delivery carriers and the old export tool. I have not included their work.

*An employment letter from Northwind Logistics accompanies this summary.*
