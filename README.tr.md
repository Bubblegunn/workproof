<p align="center"><img src="assets/wordmark.svg" width="480" alt="workproof"></p>

<p align="center"><a href="README.md">English</a> | Türkçe</p>

<p align="center"><em>En iyi işin özel repolarda. Yine de kanıtla.</em></p>

<p align="center">
  <img src="https://img.shields.io/npm/v/workproof?style=flat-square&color=111111&label=npm" alt="npm">
  <img src="https://img.shields.io/github/stars/Bubblegunn/workproof?style=flat-square&color=111111" alt="stars">
  <img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="MIT">
</p>

workproof, bir git deposunu tek bir yazar için doğrulanabilir bir mühendislik raporuna
çevirir; hiçbir kod göstermeden. Paylaşamadığınız depoda çalıştırırsınız. Okuyan kişi altı
figür, her birinin arkasındaki tam komutu, her birinin neyi gösteremediğini ve bir hash alır.
Aynı depoya sahip herkes `verify` çalıştırıp sayıların yeniden üretilip üretilmediğini görür.

## 30 saniye

```
cd your-private-repo
npx workproof
```

Bu, `workproof-report.md` (bir özgeçmişe, portfolyoya, vize başvurusuna yapıştırın) ve
`workproof-report.json` (araçlar ve doğrulama için) dosyalarını yazar. Birinin raporunu
kontrol etmek için:

```
npx workproof verify workproof-report.json
```

## Bir rapor neye benzer

Bu, [langchain-ai/openwiki](https://github.com/langchain-ai/openwiki) deposunun `1e6d54c`
sürümünde bir bakımcı için 5 Eylül 2026'da `--author "Colin Francis" --sample 5` ile alınan
gerçek çıktıdır; yollar ve e-postalar gizli (varsayılanlar):

```
## openwiki

HEAD 1e6d54cdfeec · fingerprint 82aa401bbba056f1 · identities: Colin Francis

### Tenure window
2026-07-06 to 2026-09-03 (60 days)

### Share of commits in tenure
71 of 295 non-merge commits, 24.1%

### Cadence
9 active weeks of 9, 7.9 commits per active week, longest streak 9 weeks
1 of 21 release tags in tenure

### Footprint
694 files touched
16 directories with a commit share at or above the threshold (paths hidden; run with --paths)
languages by lines added: TypeScript 80.4%, JSON 9.6%, Markdown 7.0%, JavaScript 1.6%, YAML 1.4%

### Tests and documentation
393 of 657 test-file changes, 59.8%
116 documents authored

### Surviving lines at HEAD
23,317 of 33,038 surviving lines, 70.6% (files 123/548, sample 1 in 5)
```

Her figürün altında rapor iki satır daha basar: onu üreten git komutuyla `How:` ve
`What this cannot show:`. Son bölüm `Integrity`: rapor hash'i ve depo parmak izi.

İki payı birlikte okuyun. Bu kişi penceresindeki commit'lerin %24,1'ini ve hâlâ yaşayan
satırların %70,6'sını yazmış. Bir commit sayısı onu küçük bir katkıcı olarak adlandırırdı. Bu
boşluk, iki yönde de, bir raporun birinin işi hakkında söyleyebileceği en dürüst şeydir.

## Ne ölçer

Altı figürün hepsi git'ten gelir, başka hiçbir şeyden değil.

| figür | ne | neyi gösteremez |
|---|---|---|
| Görev penceresi | yazarın ilk ve son commit'i, ya da `--since/--until` | ilk commit'ten önceki ya da sonuncudan sonraki iş |
| Commit payı | penceredeki merge dışı commit'ler içinde yazarın merge dışı commit'leri | neyin sağ kaldığı; bir yazım hatası ile bir alt sistem aynı sayılır |
| Tempo | aktif haftalar, aktif hafta başına commit, en uzun seri, penceredeki sürüm etiketleri ve yazarınkiler | bir commit'lik hafta ile kırk commit'lik hafta ikisi de aktif sayılır |
| Ayak izi | dokunulan dosyalar, commit payı eşiğin üstündeki dizinler, eklenen satıra göre diller | üretilmiş ve vendored dosyalar commit'leyeni şişirir |
| Testler ve dokümanlar | test dosyası değişikliklerinin payı, yazılan dokümanlar | test vakaları, kapsam ya da bir dokümanın kalitesi |
| Hayatta kalan satırlar | HEAD'de yaşayan satırların payı, deterministik dosya örneği üzerinde `git blame -w -M`, [surviving-lines](https://github.com/Bubblegunn/surviving-lines) ile | liyakat; bilerek silinen kod kimseye sayılmaz |

## Doğrulama nasıl çalışır

- JSON deponun HEAD'ini, bir **parmak izi** (kök commit ve normalleştirilmiş remote adresinin
  sha256'sı; depo adı verilmeden tanımlanır), kullanılan kimlik adlarını, `surviving-lines`
  sürümünü, her parametreyi ve parametreler ile figürlerin bir **hash**'ini taşır.
- `workproof verify report.json` her figürü gösterdiğiniz depoda yeniden hesaplar ve bir
  eşleşme tablosu basar. HEAD rapordan beri ilerlediyse bunu söyler ve hangi figürlerin
  değiştiğini gösterir.
- Bir işe alım yöneticisinin iki şeye ihtiyacı vardır: rapor ve depoya okuma erişimi (ya da
  şirket içinde tek komutu çalıştıracak bir çalışan). Depodan hiçbir şey çıkmaz.

## Gizlilik

- Kod içeriği, asla. Araç `git log --numstat` ve `git blame` okur ve sayılar üretir.
- Varsayılan olarak dosya yolu yok. `--paths`, yapılandırılan `--depth` (varsayılan 2)
  derinliğinde dizin adları ekler, dosya asla.
- Varsayılan olarak e-posta adresi yok. `--emails` ekler; onsuz, yazdığınız `--author`
  bile saklanan parametrelerde `(email hidden)` ile değiştirilir.
- İsteğe bağlı anlatı (`--narrate`) figürleri, yalnızca figürleri, seçtiğiniz bir model uç
  noktasına gönderir (`WORKPROOF_API_URL`, `WORKPROOF_API_KEY`, `WORKPROOF_MODEL`;
  OpenAI uyumlu ya da Anthropic). Paragraf "Generated narrative (not verified)" başlığı
  altına eklenir ve hash'in dışındadır.

## Seçenekler

```
workproof [options] [--repo <dir>]...
workproof verify <report.json> [--repo <dir>]...

--author <email|name>  identity to report on (repeatable; default: git config user.email)
--repo <dir>           repository to analyse (repeatable; several produce one combined report)
--since / --until      override the tenure window
--sample <n>           blame every n-th file (default: 1; 7 for very large repositories)
--max-commits <n>      read only the newest n commits (escape hatch for enormous histories)
--depth <n>            directory depth for ownership (default: 2)
--paths                include directory paths
--emails               include author emails
--narrate              append a model-written paragraph
--out <basename>       output basename (default: workproof-report)
--json                 print the JSON to stdout instead of writing files
```

Depodaki bir `.mailmap`, bir yazarın birden çok adresini birleştirir. Geçmiş okunurken ve
dosyalar blame'lenirken ilerleme satırları stderr'e gider, uzun bir çalıştırma canlı
görünür; yüz binlerce commit'lik bir geçmişte `--max-commits` okumayı sınırlar ve rapor bunu
kaydeder.

## Oyunlanabilir mi?

Kısmen; rapor, oyunun görünmesi için tasarlandı.

- Commit spam'i commit payını ve tempoyu oynatır, başka bir şeyi değil. Hayatta kalan satırlar
  HEAD'deki `git blame`'den gelir; bin boş commit sıfır hayatta kalan satır ekler ve iki pay
  yan yana basılır.
- Bir kütüphaneyi vendor'lamak eklenen satırları şişirir. Diller figürü ve (`--paths` ile)
  sahiplenilen dizin listesi o satırların nereye düştüğünü gösterir; inceleyen, satırların
  çoğunu `vendor` ya da `node_modules` adlı bir dizinin sahiplendiğini görür.
- Yazarlığı değiştirmek için geçmişi yeniden yazmak kök commit'i ya da HEAD'i değiştirir;
  eski bir rapordaki parmak izi ve HEAD eşleşmez olur.
- Doğrulayıcı aynı depoya karşı çalışır. Yeniden üretilemeyen bir rapor, hiç rapor
  olmamasından kötüdür; aracın dayandığı teşvik budur.

Yakalayamadığı: gerçekten büyük ama düşük değerli bir katkı. Referanslar bunun içindir.

## Adaylar için

Gurur duyduğunuz ve gösteremediğiniz her depoda çalıştırın. Markdown'ı portfolyonuza, zaten
yazacağınız cümlenin ("frontend'i ben yaptım") yanına koyun ve sayılar cümleyi taşısın. JSON'u
saklayın; inceleyenin doğruladığı odur.

## İşe alanlar için

JSON'u ve adayın eski şirketinden birinin üzerinde `npx workproof verify` çalıştırmasını
isteyin. Tablo ya yeniden üretilir ya üretilmez. Depo ilerlediyse araç hangi figürlerin
değiştiğini ve bunun neden beklendiğini söyler.

## Vize ve göç kanıtı için

workproof, en güçlü işin özel depolarda olduğu ve "bana güven"in kanıt sayılmadığı bir
Birleşik Krallık Global Talent başvurusu için yapıldı. Bir rapor, yöntemi ekli bir ölçümdür,
bir tavsiye değil; orada bulunmuş insanların mektuplarıyla birlikte kullanın.

## Bunu yapmaz

Hayatta kalmayı ve etkinliği ölçer; kaliteyi, incelemeyi, tasarımı ya da mentorluğu değil.
İnsanları sıralamaz. Referansların yerine geçmez. Hukuki bir belge değildir.

## Nereden geliyor

Yöntem
[How to show engineering ownership when the repositories are private](https://efe-genc-portfolio.vercel.app/writing/showing-ownership-private-repositories/)
yazısında anlatılıyor. Blame örneklemesi workproof'un tek bağımlılığı olan
[surviving-lines](https://github.com/Bubblegunn/surviving-lines) paketidir.

## Geliştirme

```
npm ci
npm test        # tsc build, then node:test over the compiled tests (fixture repositories built in a temp dir)
```

MIT.
