const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const args = process.argv.slice(2);
if (args.length !== 2 || args[0] !== '--split' || !['dev', 'test'].includes(args[1])) {
  console.error('Použití: node src/label.js --split dev|test');
  process.exitCode = 1;
} else {
  main(args[1]).catch((error) => {
    console.error('Označování se nezdařilo:', error.message);
    process.exitCode = 1;
  });
}

async function main(split) {
  const file = path.join(__dirname, '..', 'data', `${split}.jsonl`);
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((line) => line.trim());
  const cases = lines.map((line, index) => {
    try {
      return JSON.parse(line);
    } catch {
      throw new Error(`Neplatný JSON na řádku ${index + 1} v ${file}.`);
    }
  });

  const rl = readline.createInterface({ input: stdin, output: stdout });
  const pizzas = ['margherita', 'salamova', 'hawai', 'quattro formaggi'];

  async function askYesNo(question) {
    while (true) {
      const answer = (await rl.question(question)).trim().toLowerCase();
      if (['a', 'ano'].includes(answer)) return true;
      if (['n', 'ne'].includes(answer)) return false;
      console.log('Zadejte ano (a) nebo ne (n).');
    }
  }

  async function askCount(name) {
    while (true) {
      const answer = (await rl.question(`Počet (${name}; kladné celé číslo nebo null): `)).trim();
      if (answer.toLowerCase() === 'null') return null;
      const count = Number(answer);
      if (/^[0-9]+$/.test(answer) && Number.isSafeInteger(count) && count > 0) return count;
      console.log('Zadejte kladné celé číslo nebo null.');
    }
  }

  async function askPayment() {
    while (true) {
      const answer = (await rl.question('Platba (hotovost, karta nebo null): ')).trim().toLowerCase();
      if (answer === 'null') return null;
      if (answer === 'hotovost' || answer === 'karta') return answer;
      console.log('Zadejte hotovost, karta nebo null.');
    }
  }

  try {
    for (const item of cases) {
      if (item.expected != null) continue;

      console.log(`\nID: ${item.id}\nVstup: ${item.input}`);
      let confirmed = false;
      while (!confirmed) {
        const polozky = [];
        for (const nazev of pizzas) {
          if (await askYesNo(`Je objednána pizza ${nazev}? (a/n): `)) {
            polozky.push({ nazev, pocet: await askCount(nazev) });
          }
        }
        const address = (await rl.question('Adresa (prázdná odpověď znamená null): ')).trim();
        const expected = { polozky, adresa: address || null, platba: await askPayment() };
        console.log('\nExpected:');
        console.log(JSON.stringify(expected, null, 2));
        confirmed = await askYesNo('Uložit tento výsledek? (a/n): ');
        if (confirmed) {
          item.expected = expected;
          const temporaryFile = `${file}.${process.pid}.tmp`;
          let temporaryFileCreated = false;
          try {
            fs.writeFileSync(temporaryFile, `${cases.map((entry) => JSON.stringify(entry)).join('\n')}\n`, { encoding: 'utf8', flag: 'wx' });
            temporaryFileCreated = true;
            fs.renameSync(temporaryFile, file);
          } finally {
            if (temporaryFileCreated && fs.existsSync(temporaryFile)) fs.unlinkSync(temporaryFile);
          }
          console.log('Uloženo.');
        } else {
          console.log('Výsledek nebyl uložen. Zadejte případ znovu.');
        }
      }
    }
    console.log('\nVšechny případy v této sadě jsou vyplněné.');
  } finally {
    rl.close();
  }
}
