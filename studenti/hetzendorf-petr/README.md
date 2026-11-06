\# Objednávky v pizzerii



\## Co nástroj dělá

Nástroj z krátké české objednávky vytáhne názvy pizz,

počet kusů každé pizzy, doručovací adresu a způsob platby.

Výsledkem je JSON. Chybějící údaje si nevymýšlí.



\## Schéma výstupu

\- polozky: seznam objektů s poli:

&#x20; - nazev: řetězec, název pizzy malými písmeny;

&#x20; - pocet: celé kladné číslo nebo null, pokud počet nelze určit.

\- adresa: řetězec nebo null.

\- platba: "hotovost", "karta" nebo null.



Příklad vstupu:

„Prosím dvě margherity a jednu salámovou na adresu

Pizzová 12, Most. Zaplatím kartou.“



Příklad výstupu:

```json

{

&#x20; "polozky": \[

&#x20;   {"nazev": "margherita", "pocet": 2},

&#x20;   {"nazev": "salamova", "pocet": 1}

&#x20; ],

&#x20; "adresa": "Pizzová 12, Most",

&#x20; "platba": "karta"

}

```



\## Pravidla extrakce a porovnávání

\- Používám názvy pizz: margherita, salamova, hawai, quattro formaggi.

\- České tvary těchto názvů převádím na uvedené názvy.

\- Číslovky jako „dvě“ převádím na čísla.

\- Chybějící počet, adresu nebo platbu zapisuji jako null.

\- Při osobním odběru je adresa null.

\- Pokud text neobsahuje žádnou objednanou pizzu, polozky jsou \[].

Do polozky patří pouze skutečně objednané pizzy. Pouhá zmínka, dotaz na dostupnost nebo výslovně odmítnutá pizza se nezahrnuje.

\- Pořadí položek při porovnávání nerozhoduje.

\- U adres ignoruji velikost písmen a nadbytečné mezery;

&#x20; diakritiku a ostatní znaky zachovávám.

\- Úplná shoda znamená správné položky včetně počtů,

&#x20; správnou adresu a správnou platbu.

## Instalace a nastavení

Nainstalujte závislosti pomocí Node.js a npm:

```sh
npm install
```

Vytvořte soubor `.env` podle `.env.example` a doplňte příslušné API klíče.

## Ověření připojení

```sh
node src/smoke.js
node src/smoke-gemini.js
```

Model Gemini lze zadat také výslovně:

```sh
node src/smoke-gemini.js --model models/gemini-3.5-flash
```

Bez parametru skript vybere z dostupných modelů Gemini 3.5 Flash, případně textový Flash-Lite.

### Výsledky ověření

- **Groq** (`openai/gpt-oss-20b`): odpověď „Ahoj“, `prompt_tokens`: 82, `completion_tokens`: 58.
- **Google Gemini** (`models/gemini-3.5-flash`): odpověď „Ahoj“, `prompt_tokens`: 13, `completion_tokens`: 3. Předchozí pokus s `models/gemini-3.8-flash` skončil limitem nebo kvótou.
- **Mistral** blokoval vytvoření klíče na bezplatném plánu, proto nebylo připojení ověřeno.

Při programování jsem zkoušel Gemini a kvůli jeho přetížení přešel na GPT-6.1 Terra přes OpenCode.

## Evaluace

Po instalaci závislostí a nastavení příslušného klíče v `.env` lze spustit evaluaci například takto:

```sh
node src/eval.js --provider groq --model openai/gpt-oss-20b --split dev --prompt v1
node src/eval.js --provider gemini --model models/gemini-3.5-flash --split dev --prompt v1
node src/eval.js --provider openrouter --model google/gemma-4-31b-it:free --split dev --prompt v1
```

Parametr `--split` přijímá `dev` nebo `test`; `--prompt v1` načítá `prompts/v1.txt`. Každá objednávka se odesílá samostatně a správné odpovědi se porovnávají pouze lokálně.

Při použití OpenRouteru skript před měřením zjišťuje zbývající denní free kvótu; při méně než 15 požadavcích nebo nedostupné kvótě měření nespustí. Mezi API voláními OpenRouteru čeká 3,2 sekundy, které se nezapočítávají do latence odpovědi.

Parametr `--cache-only` přepočítá shodu vůči aktuálním referenčním odpovědím pouze z uložených odpovědí, bez síťových volání. Pokud některý záznam chybí, běh skončí bez aktualizace souhrnu.

Podrobné výsledky jednotlivých běhů se ukládají jako JSONL do `results/`, souhrn dokončených běhů do `results/summary.json` a odpovědi pro opakované použití do `cache/`. Pokud se běh přeruší nebo selže, jeho souhrn se neuloží; soubor jednotlivých výsledků může obsahovat jen dokončené případy. Skript při HTTP 429 respektuje `Retry-After` a počet opakování je omezený. API musí vrátit počty vstupních a výstupních tokenů, jinak se běh považuje za neúplný.

### Dosavadní měření

Hodnoty vycházejí z `results/summary.json`; podíly a latence jsou zaokrouhleny.

| Poskytovatel | Model | Prompt | Sada | Případů | Validní JSON | Úplná shoda | Položky | Adresa | Platba | Průměrná latence | Vstupní tokeny | Výstupní tokeny |
| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Groq | `openai/gpt-oss-20b` | v1 | dev | 15 | 100 % | 93,33 % | 93,33 % | 100 % | 100 % | 0,739 s | 5 774 | 4 844 |
| Groq | `openai/gpt-oss-120b` | v1 | dev | 15 | 100 % | 86,67 % | 93,33 % | 93,33 % | 100 % | 0,889 s | 5 774 | 3 873 |
| OpenRouter | `nvidia/nemotron-3.5-lightning:free` | v1 | dev | 15 | 100 % | 93,33 % | 93,33 % | 100 % | 100 % | 13,838 s | 5 008 | 19 501 |
| Groq | `openai/gpt-oss-20b` | v2 | dev | 15 | 100 % | 93,33 % | 93,33 % | 100 % | 100 % | 0,684 s | 8 699 | 5 142 |

### Porovnání promptů v1 a v2

Prompt v2 vznikl ještě před následnou ruční kontrolou referenčních odpovědí. Zpřesňuje povinné schéma, rozdíl mezi JSON hodnotou `null` a řetězcem `"null"`, neurčené počty a adresy, osobní odběr i rozlišení objednaných a pouze zmíněných pizz. Po přepočtu na stejném modelu Groq `openai/gpt-oss-20b` a sadě dev mají oba prompty úplnou shodu 93,33 % a stejné shody jednotlivých polí. Průměrná latence činila 0,739 s u v1 a 0,684 s u v2; vstupní tokeny vzrostly z 5 774 na 8 699 a výstupní z 4 844 na 5 142.

Student následně ručně zkontroloval referenční odpovědi a opravil chybný zápis chybějící adresy. Všechny čtyři dokončené běhy byly poté přepočítány z původních odpovědí v cache proti aktuálním referencím, bez API volání. Dřívější neshody proto nelze automaticky pokládat za chyby modelu.

### Nedokončená měření

Měření Gemini `models/gemini-3.5-flash` na sadě dev nebylo dokončeno: u případu 7 API opakovaně vrátilo HTTP 429. Není proto zahrnuto mezi dokončené běhy v souhrnu.

Měření OpenRouteru `google/gemma-4-31b-it:free` na sadě dev také nebylo dokončeno: u případu 1 API opakovaně vrátilo HTTP 429. Při kontrole před během zbývalo 50 denních free požadavků.

