import xlsx from 'xlsx';
import fs from 'fs';

const workbook = xlsx.readFile('src/data/translations.xlsx');

const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];

const rows = xlsx.utils.sheet_to_json(sheet);

const norwegian = {};
const swedish = {};
const danish = {};
const english = {};

rows.forEach(row => {
  const englishWord = row["ENGLISH"];
  norwegian[englishWord] = row["NORSK"];
  swedish[englishWord] = row["SVENSKA"];
  danish[englishWord] = row["DANSK"];
  english[englishWord] = row["ENGLISH"]
});

// write to frontend/src/locales
fs.writeFileSync("src/locales/no.json", JSON.stringify(norwegian, null, 2));
fs.writeFileSync("src/locales/dk.json", JSON.stringify(danish, null, 2));
fs.writeFileSync("src/locales/se.json", JSON.stringify(swedish, null, 2));
fs.writeFileSync("src/locales/en.json", JSON.stringify(english, null, 2));


console.log("Translation files created!")
