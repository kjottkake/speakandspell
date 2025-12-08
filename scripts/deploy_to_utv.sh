#!/bin/bash
source /home/local/teneste/.bashrc
cp -a backend /home/local/teneste/speaknspell/.
cp -a frontend /home/local/teneste/speaknspell/.
cp /home/local/teneste/speaknspell/utvenv_backend /home/local/teneste/speaknspell/backend/.env
cp /home/local/teneste/speaknspell/utvenv_frontend /home/local/teneste/speaknspell/frontend/.env
cd /home/local/teneste/speaknspell/backend
source venv/bin/activate
pip install -r requirements.txt
cd /home/local/teneste/speaknspell/frontend
npm install
npm run build
cp -r ./build/* /var/www/html/speaknspell/.
