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

\- Pořadí položek při porovnávání nerozhoduje.

\- U adres ignoruji velikost písmen a nadbytečné mezery;

&#x20; diakritiku a ostatní znaky zachovávám.

\- Úplná shoda znamená správné položky včetně počtů,

&#x20; správnou adresu a správnou platbu.

