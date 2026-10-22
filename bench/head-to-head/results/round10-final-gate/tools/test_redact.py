import os, sys, unittest
from unittest import mock
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from redact import redact

SHA40 = "e4d9057" + "a" * 33
SHA64 = "0123456789abcdef" * 4


class RedactTests(unittest.TestCase):
    def gone(self, secret, text=None):
        out = redact(text or f"token {secret} end")
        self.assertNotIn(secret, out)
        self.assertEqual(redact(out), out)
        return out

    def test_secret_shapes(self):
        for s in ["sk-ant-api03-FAKEFAKEFAKEFAKEfake_-1234",
                  "sk-FAKEFAKEFAKEFAKEFAKE1234",
                  "ghp_FAKEFAKEFAKEFAKEFAKEFAKE1234",
                  "gho_FAKEFAKEFAKEFAKEFAKEFAKE1234",
                  "github_pat_FAKEFAKEFAKEFAKE_1234567890",
                  "AKIAFAKEFAKEFAKE1234",
                  "xoxb-1234567890-FAKEFAKEFAKE",
                  "xoxp-1234567890-FAKEFAKEFAKE",
                  "AIzaFAKEFAKEFAKEFAKEFAKEFAKEFAKEFAKE12",
                  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJmYWtlIn0.FAKEsignature123"]:
            with self.subTest(s=s): self.gone(s)

    def test_bearer_and_apikey(self):
        out = self.gone("FAKEtokenFAKEtoken12345", "Authorization: Bearer FAKEtokenFAKEtoken12345")
        self.assertIn("Bearer", out)
        out = self.gone("hunter2hunter2", "config: api_key = hunter2hunter2 ok")
        self.assertIn("api_key", out)
        self.gone("fakevalue99", '{"apiKey": "fakevalue99", "x": 1}')
        self.gone("fakevalue98", "API-KEY: fakevalue98")

    def test_short_sk_not_redacted(self):
        self.assertEqual(redact("sk-short and task-list-with-many-parts-here-1234567890"),
                         "sk-short and task-list-with-many-parts-here-1234567890")

    def test_emails(self):
        for a in ["jane.doe@gmail.com", "Bob@Corp-Inc.co.uk", "x+tag@proton.me"]:
            out = redact(f"mail {a} now")
            self.assertNotIn(a, out)
            self.assertRegex(out, r"<email:[0-9a-f]{8}>")
            self.assertEqual(redact(out), out)
        a, b = redact("A@Gmail.com"), redact("a@gmail.com")
        self.assertEqual(a, b)  # stable: lowercase hash
        for ok in ["u@host.example", "u@mail.invalid", "u@corp.test", "u@example.com", "u@example.org", "u@example.net"]:
            self.assertEqual(redact(ok), ok)
        self.assertEqual(redact("pkg@1.2.3 and foo@bar here"), "pkg@1.2.3 and foo@bar here")

    def test_keep_emails(self):
        self.assertEqual(redact("Jo@Fix.dev", {"jo@fix.dev"}), "Jo@Fix.dev")
        self.assertNotIn("jo@fix.dev", redact("jo@fix.dev").lower())

    def test_shas_intact(self):
        t = f"commit {SHA40} and {SHA64}"
        self.assertEqual(redact(t), t)

    def test_paths(self):
        out = redact("/Users/alice/Desktop/x and /home/alice/proj and /private/tmp/claude-501/-Users-alice-Desktop-portfolio/s")
        self.assertEqual(out, "/Users/user/Desktop/x and /home/user/proj and /private/tmp/claude-uid/-Users-user-Desktop-portfolio/s")
        self.assertEqual(redact(out), out)
        self.assertEqual(redact("claude-sonnet-5-5 claude-3"), "claude-sonnet-5-5 claude-3")

    def test_ls_owner(self):
        out = redact('drwxr-xr-x   4 alice  wheel    128 Oct 22 20:10 .')
        self.assertEqual(out, 'drwxr-xr-x   4 user  wheel    128 Oct 22 20:10 .')
        self.assertEqual(redact(out), out)

    def test_truncated_address_and_os_user(self):
        self.assertNotIn('jo@gmail.c', redact('x <jo@gmail.c'))
        with mock.patch('getpass.getuser', return_value='zorbax'):
            self.assertEqual(redact('owner zorbax ran; zorbaxy stays'), 'owner user ran; zorbaxy stays')

    def test_cut_address(self):
        out = redact('a ; jonathanr@gma\nnext pkg@latest\nb ; foo@users.')
        self.assertNotIn('@gma', out); self.assertNotIn('@users', out); self.assertIn('pkg@latest', out)
        self.assertEqual(redact(out), out)

    def test_idempotent_mixed(self):
        t = (f"a@gmail.com sk-ant-FAKEFAKEFAKE1234 /Users/alice/x Bearer abcdefgh1234 {SHA40} "
             "api_key: zzz /home/bob/y eyJabcde.fghijk.lmnopq")
        once = redact(t)
        self.assertEqual(redact(once), once)

    def test_env_key_removed(self):
        fake = "FAKE-literal-key-value-not-a-known-shape-0042"
        with mock.patch.dict(os.environ, {"ANTHROPIC_API_KEY": fake}):
            out = redact(f"the key is {fake}, again {fake}")
            self.assertNotIn(fake, out)
            self.assertEqual(redact(out), out)
        with mock.patch.dict(os.environ, {}, clear=False):
            os.environ.pop("ANTHROPIC_API_KEY", None)
            self.assertIn(fake, redact(f"key {fake}"))


if __name__ == "__main__":
    unittest.main()
