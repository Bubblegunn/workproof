I wrote `change-review-evidence.csv` with 12 rows, one for each non-merge commit that touched `lib/` with an author date in Q1 2026. Only 4 of the 12 have clean independent review evidence.

**Reviewed (4):** `d21c30a`, `fa7f9fc`, `e37dd19` and `a54659a`.

**Expect the auditor to question these (8):**
- **No review recorded (5):**
  - `2f7f724`: safelist cache, Chloe Park.
  - `f70e6a8`: Marta Kowal's revert of the safelist cache. A revert is still a change to `lib/`.
  - `b07be54`: per-account limits, Chloe Park.
  - `268e72a`: limit docs hook, Chloe Park.
  - `ad96886`: log throttled keys, Marta Kowal. Its only trailer is `Acked-by: Ben Adeyemi`, which isn't a `Reviewed-by`.
- **Self-review only (2):**
  - `9e9751f`: Ben Adeyemi is listed as reviewer of his own commit. The author email is `ben.a@laptop.invalid` and the reviewer email is `ben.adeyemi@ledgerly.example`, so the auditor may think they are two different people.
  - `bc7e732`: Chloe Park is listed as reviewer of her own commit.
- **Review mentioned in prose only (1):** `8465169`, the cache key format change, which is the riskiest one. Marta Kowal's commit message says Chloe agreed to the change "in the PR thread", but there is no real trailer. A PR approval export would fix this one.

**Judgement calls:**
- `e37dd19` has two `Reviewed-by` trailers, one from the author and one from Chloe Park. I credited Chloe and ignored the author's.
- `fa7f9fc` uses a lowercase `reviewed-by`. Git trailers are case-insensitive, so I counted it, but the auditor may notice it.
- `a54659a` was authored on 30 March but committed on 2 April. I included it by author date. If the auditor goes by commit date it drops out of Q1.
- `192a8ba` ("q2 work") is dated 1 April, so it is out of scope. I left it out.
- Only `main` exists locally, and no merge commits touched `lib/` in the window. Work done on other branches or in PRs wouldn't show up here.