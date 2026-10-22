#!/usr/bin/env python3
"""redact.py - replace personal and secret data in text with stable placeholders (stdlib only, no network).

usage: redact.py [--keep ADDRESS ...] [FILE]     reads FILE or stdin, writes the redacted text to stdout
As a module: redact(text, keep_emails=set()) -> str.  The function is idempotent: redact(redact(x)) == redact(x).

What is replaced:
  e-mail addresses   -> <email:xxxxxxxx>  (first 8 hex of sha256 of the lowercased address). Kept unchanged: addresses whose
                        domain ends in .example .invalid .test, addresses at example.com/.org/.net, and addresses in keep_emails.
  (an address cut off by a length cap at the end of a line, e.g. name@gma, is replaced too)
  secret-like tokens -> <redacted:secret>  (sk-ant-, sk- with 20 or more characters, ghp_, gho_, github_pat_, AKIA, xox[abprs]-,
                        AIza, JWT, "Bearer <token>", "api_key: value"); also the value of the environment variable ANTHROPIC_API_KEY.
  home paths         -> /Users/user, /home/user, claude-501 -> claude-uid, -Users-<name>- -> -Users-user-, owner column of `ls -l` -> user,
  the local OS user name as a whole word -> user
Git SHAs (40 or 64 hex characters) are not changed."""
import getpass, hashlib, os, re, sys

SECRET_MARK = "<redacted:secret>"
_EMAIL = re.compile(r"(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]+(?![A-Za-z0-9-])")
# Address cut off by a length cap (no complete domain) at the end of a line or string: "name@gma", "name@users."
_EMAIL_CUT = re.compile(r"(?m)(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]{2,}@(?!(?:latest|next|beta|alpha|canary|rc)\b)[A-Za-z][A-Za-z0-9.-]*(?=\s*$)")
_SAFE_SUFFIX = (".example", ".invalid", ".test")
_SAFE_AT = ("@example.com", "@example.org", "@example.net")

# Order matters: the longer, more specific shapes first.
_SECRETS = [
    re.compile(r"\bsk-ant-[A-Za-z0-9_-]{8,}"),
    re.compile(r"\bsk-[A-Za-z0-9_-]{20,}"),
    re.compile(r"\bghp_[A-Za-z0-9]{16,}"),
    re.compile(r"\bgho_[A-Za-z0-9]{16,}"),
    re.compile(r"\bgithub_pat_[A-Za-z0-9_]{16,}"),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"\bxox[abprs]-[A-Za-z0-9-]{10,}"),
    re.compile(r"\bAIza[0-9A-Za-z_-]{20,}"),
    re.compile(r"\beyJ[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}\.[A-Za-z0-9_-]{5,}"),
]
_BEARER = re.compile(r"(\bBearer\s+)[A-Za-z0-9._~+/=-]{8,}")
_APIKEY = re.compile(r"""(?i)(api[_-]?key["']?\s*[:=]\s*)("[^"\n]*"|'[^'\n]*'|[^\s,;"'}\])]+)""")
_HOME_MAC = re.compile(r"/Users/(?!user(?![A-Za-z0-9_.-])|Shared(?![A-Za-z0-9_.-]))[^/\s\"'`\\:;,)(\]\[<>]+")
_HOME_LIN = re.compile(r"/home/(?!user(?![A-Za-z0-9_.-]))[^/\s\"'`\\:;,)(\]\[<>]+")
_TMPUSER = re.compile(r"(?<=/)claude-\d+(?=/|\b)")
_LS_OWNER = re.compile(r"([-dlbcps][rwxsStT-]{9}[@+.]?\s+\d+\s+)(?!user\s)[A-Za-z0-9_.-]+(?=\s)")
_ENCODED_CWD = re.compile(r"-Users-(?!user-)[^-/\s]+-")


def _email(m, keep):
    addr = m.group(0)
    low = addr.lower()
    if low.endswith(_SAFE_SUFFIX) or low.endswith(_SAFE_AT) or low in keep:
        return addr
    return "<email:" + hashlib.sha256(low.encode()).hexdigest()[:8] + ">"


def redact(text, keep_emails=set()):
    keep = {a.lower() for a in keep_emails}
    key = os.environ.get("ANTHROPIC_API_KEY", "")
    if len(key) >= 8:
        text = text.replace(key, SECRET_MARK)
    for rx in _SECRETS:
        text = rx.sub(SECRET_MARK, text)
    text = _BEARER.sub(lambda m: m.group(1) + SECRET_MARK, text)
    text = _APIKEY.sub(lambda m: m.group(1) + SECRET_MARK, text)
    text = _EMAIL.sub(lambda m: _email(m, keep), text)
    text = _EMAIL_CUT.sub(lambda m: _email(m, keep), text)
    text = _HOME_MAC.sub("/Users/user", text)
    text = _HOME_LIN.sub("/home/user", text)
    text = _TMPUSER.sub("claude-uid", text)
    text = _LS_OWNER.sub(lambda m: m.group(1) + "user", text)
    try: me = getpass.getuser()
    except Exception: me = ""
    if len(me) >= 3 and me != "user": text = re.sub(r"(?<![A-Za-z0-9_-])" + re.escape(me) + r"(?![A-Za-z0-9_-])", "user", text)
    text = _ENCODED_CWD.sub("-Users-user-", text)
    return text


def redact_obj(o, keep_emails=set()):
    """Redact every string inside a JSON-like value (keys unchanged), so a JSON line stays valid."""
    if isinstance(o, str): return redact(o, keep_emails)
    if isinstance(o, list): return [redact_obj(x, keep_emails) for x in o]
    if isinstance(o, dict): return {k: redact_obj(v, keep_emails) for k, v in o.items()}
    return o


def main(argv):
    keep, path, i = set(), None, 0
    while i < len(argv):
        if argv[i] == "--keep": keep.add(argv[i + 1]); i += 2
        else: path = argv[i]; i += 1
    data = open(path, encoding="utf-8", errors="replace").read() if path else sys.stdin.read()
    sys.stdout.write(redact(data, keep))


if __name__ == "__main__":
    main(sys.argv[1:])
