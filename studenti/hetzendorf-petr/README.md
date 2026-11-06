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

