Tutor2.0
Web Application per la gestione verifiche, studio e tutoraggio studenti.

Tutor2.0 è una piattaforma pensata per studenti e tutor, utile per pianificare verifiche, gestire materie, calcolare medie automatiche e monitorare il percorso di studio con facilità. Include anche una dashboard speciale per tutor che permette di seguire e annotare lo stato degli studenti.

Funzionalità principali

- Login e Registrazione per studenti e tutor
- Gestione verifiche: inserimento, modifica e visualizzazione delle verifiche in calendario
- Gestione materie: aggiunta/eliminazione, liste e medie voti per materia
- Calcolo automatico medie
- Dashboard tutor: panoramica studenti, annotazioni, visualizzazione materie insufficienti
- Storico verifiche, annotazioni e calendario futuro
- Eliminazione profilo
- Responsive design per desktop e mobile

Struttura del progetto
Tutor2.0/
├── frontend/
│ ├── index.html
│ ├── registrazione.html
│ ├── home-studente.html
│ ├── materie.html
│ ├── medie.html
│ ├── home-tutor.html
│ ├── scheda-studente.html
│ ├── css/
│ │ └── styles.css
│ ├── js/
│ │ ├── auth.js
│ │ ├── calendario.js
│ │ ├── materie.js
│ │ ├── medie.js
│ │ ├── tutor.js
│ │ └── api.js
│ └── assets/
│ ├── img/
│ └── icons/
├── backend/
│ ├── server.js
│ ├── routes/
│ ├── models/
│ ├── middleware/
│ ├── config/
│ ├── utils/
│ └── .env
├── .gitignore
├── README.md
├── LICENSE
├── package.json
└── .vscode/
└── settings.json

Tech Stack

- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Backend: Node.js, Express.js
- Database: MongoDB Atlas
- Versionamento: Git + GitHub
- Collaborazione: VS Code + Live Share

Come avviare il progetto

1. Clonazione repository --> git clone https://github.com/[tuo_nome]/Tutor2.0.git
2. Installazione dipendenze (backend) --> cd Tutor2.0/backend
   npm install
3. Avvio backend --> npm start
   Usa nodemon (npm run dev) per sviluppo locale
4. Avvio frontend
   Apri i file HTML direttamente nel browser o usa Live Server su VS Code.
5. Configurazione ambiente
   - Crea un file .env nella cartella /backend/ con le informazioni per la connessione a MongoDB Atlas (vedi istruzioni interne)
   - Non caricare mai .env su GitHub (gestito da .gitignore)

Regole di collaborazione

- Ogni collaboratore lavora su branch dedicati per le diverse feature (feature/login, feature/tutor-dashboard, ecc.)
- Commit frequenti e descrittivi
- Review e merge su branch main solo dopo test e consenso
- Frontend e backend separati per evitare conflitti

Licenza
Questo progetto è rilasciato sotto licenza MIT. Vedi file LICENSE per dettagli.

Autori

- Matteo Greco ([GitHub username])
- Francesco Merenda ([GitHub username])
