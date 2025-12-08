# Speak and Spell

A web application to learn the scandinavian languages.

## Installation

Backend:

Windows
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate 
pip install -r .\requirements.txt
```

MacOS
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r .\requirements.txt
```

Frontend: on another terminal

```bash
cd frontend
npm install
```

## Run locally

on \backend:

```bash
python .\main.py
```

on \frontend:

```bash
npm run dev
```

## Translation
(this is the UI translation)

The xlsx file for the translations can be found in frontend\src\data\translations.xlsx

The script for translating words to scandenavic can be found in frontend\src\scripts\translations.js

Translations in the website are done with the module i18next, which uses the json files found in frontend\src\locales, that are produced by the script above.

To run the script (to produce the json files):

``` bash
cd frontend
node src/scripts/translations.js
```

## Parse excel files

Use scripts/new_db.py to read the excel files of trias, words and rules. Trials will not be added to the database if its word is not in the word file or if the bin's rule is not in the rule file. The script deletes all exercise data in the database before parsing.

If you want to keep italicized characters from the excel file you first need to convert them to <i></i> format. This can be done by pasting scripts/italics.vba into an excel macro. This script will convert every cell in every sheet of an excel file into this format.
