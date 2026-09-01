# JobBoost AI — V1

Plateforme qui analyse, corrige et améliore un CV grâce à Google Gemini, génère un CV professionnel en PDF, et propose des plans payants via CinetPay (TMoney, Flooz, Visa, Mastercard — Togo).

Stack : HTML/CSS/JS Vanilla (frontend) + Node.js/Express (backend) + Firebase (Auth + Firestore) + Google Gemini API + CinetPay + jsPDF.

---

## 1. Arborescence complète

```
jobboost-ai/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── dashboard.html
│   ├── cv.html
│   ├── result.html
│   ├── pricing.html
│   ├── profile.html
│   ├── success.html
│   ├── cancel.html
│   ├── style.css
│   ├── app.js
│   ├── firebase-config.js
│   ├── gemini-client.js
│   ├── payment.js
│   ├── pdf.js
│   ├── README.md
│   └── assets/
└── backend/
    ├── server.js
    ├── package.json
    ├── .env.example
    ├── .gitignore
    ├── firestore.rules
    ├── api/
    │   ├── gemini.js
    │   ├── create-payment.js
    │   ├── verify-payment.js
    │   └── webhook.js
    └── lib/
        ├── config.js
        ├── firebaseAdmin.js
        └── rateLimit.js
```

**Pourquoi un backend est indispensable :** le frontend peut être hébergé gratuitement sur GitHub Pages ou Firebase Hosting, mais ni la clé Gemini ni les clés secrètes CinetPay ne doivent jamais apparaître dans du code exécuté dans le navigateur. Le backend (`/backend`) est la seule couche qui détient ces secrets, appelle Gemini, crée et vérifie les paiements, et met à jour Firestore de façon fiable.

---

## 2. Étapes Firebase

1. Va sur [console.firebase.google.com](https://console.firebase.google.com) et crée un projet.
2. **Authentication** → onglet Sign-in method → active **Email/Password** et **Google**.
3. **Firestore Database** → crée une base en mode production (les règles sont fournies dans `backend/firestore.rules`).
4. **Paramètres du projet → Vos applications** → ajoute une application Web → copie la config dans `frontend/firebase-config.js`.
5. **Paramètres du projet → Comptes de service** → clique "Générer une nouvelle clé privée" → télécharge le JSON → colle son contenu (une seule ligne) dans la variable d'environnement `FIREBASE_SERVICE_ACCOUNT` du backend.
6. Déploie les règles : `firebase deploy --only firestore:rules` (nécessite la CLI Firebase, `npm i -g firebase-tools`).

## 3. Étapes Gemini

1. Va sur [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey) et crée une clé API.
2. Colle-la dans `GEMINI_API_KEY` (backend `.env`, jamais dans le frontend).
3. Le modèle utilisé est défini une seule fois dans `backend/lib/config.js` (`GEMINI_MODEL`). Change-le ici si besoin (ex : passer à une version plus récente de Gemini Flash).
4. Reste conscient des limites du **free tier** Gemini (quota par minute/jour) : l'application gère l'erreur `QUOTA_EXCEEDED` proprement, mais ne promets jamais un usage illimité aux utilisateurs.

## 4. Étapes CinetPay

1. Crée un compte sur [cinetpay.com](https://cinetpay.com).
2. Dans le tableau de bord, récupère `API_KEY` et `SITE_ID`.
3. Active les moyens de paiement Togo : TMoney, Flooz, Visa, Mastercard.
4. Configure les URLs de retour dans le backend via `APP_BASE_URL` (ex : `https://jobboost-ai.example.com`) : le backend construit automatiquement `return_url`, `cancel_url` et `notify_url` à partir de cette variable.
5. Configure le **webhook** (notify_url) pour pointer vers `https://TON-BACKEND/api/payment/webhook` — c'est le canal fiable de confirmation, indépendant du retour navigateur.

## 5. Variables d'environnement (backend/.env)

```
GEMINI_API_KEY=
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
CINETPAY_SECRET_KEY=
FIREBASE_SERVICE_ACCOUNT=
APP_BASE_URL=https://votre-frontend.example.com
PORT=3000
```

Ne jamais committer `.env` (déjà exclu via `.gitignore`).

## 6. Règles Firestore

Voir `backend/firestore.rules`. Principe : chaque utilisateur ne lit/écrit que ses propres données ; les champs `plan` et `credits` ne sont modifiables que par le backend (Admin SDK, non soumis aux règles) ; aucune règle `allow read, write: if true`.

## 7. Étapes de déploiement

**Frontend (gratuit) :**
- GitHub Pages : push le contenu de `frontend/` sur une branche `gh-pages`, ou
- Firebase Hosting : `firebase init hosting` puis `firebase deploy --only hosting`.
- Avant de déployer, mets à jour `BACKEND_URL` dans `firebase-config.js` avec l'URL réelle du backend.

**Backend (offre gratuite/quota gratuit) :**
- Render.com (Web Service gratuit), Railway, Fly.io, ou Google Cloud Run (généreux free tier).
- Build command : `npm install` — Start command : `npm start`.
- Renseigne toutes les variables d'environnement listées ci-dessus dans le tableau de bord de l'hébergeur.

## 8. Tests à effectuer

- [ ] Créer un compte email/mot de passe, puis se déconnecter/reconnecter.
- [ ] Connexion Google.
- [ ] Coller un CV texte + poste recherché → lancer l'analyse → vérifier le JSON structuré affiché.
- [ ] Importer un PDF texte (non scanné) → vérifier l'extraction.
- [ ] Générer une lettre de motivation.
- [ ] Comparer un CV à une offre d'emploi.
- [ ] Télécharger le PDF en modèle Classique puis Moderne.
- [ ] Épuiser le crédit FREE → vérifier le blocage (`NO_CREDITS`) côté serveur, pas seulement côté écran.
- [ ] Lancer un paiement PRO en mode test CinetPay → vérifier que `success.html` n'affiche "Paiement reçu" qu'après confirmation serveur réelle.
- [ ] Simuler un paiement annulé → vérifier `cancel.html`.
- [ ] Couper Internet pendant une analyse → vérifier le message d'erreur réseau.
- [ ] Vérifier dans Firestore que `credits` n'est jamais modifiable depuis la console navigateur (tester une écriture directe : elle doit être refusée par les règles).
- [ ] Supprimer un document, puis supprimer le compte depuis `profile.html`.

## 9. Problèmes possibles

- **Extraction PDF imparfaite** : certains CV scannés ou mal structurés ne s'extraient pas bien. Solution prévue dès la V1 : champ "Coller mon CV" toujours disponible.
- **Quota Gemini gratuit dépassé** : géré par le code (`QUOTA_EXCEEDED`), mais peut arriver en cas de pic d'utilisation.
- **Double confirmation de paiement** : gérée par une transaction Firestore atomique (`applyConfirmedPayment`) qui vérifie le statut avant de créditer, donc aucun double crédit même si le webhook ET la vérification manuelle arrivent en même temps.
- **CORS** : si le frontend et le backend sont sur des domaines différents, vérifie que `APP_BASE_URL` correspond exactement à l'origine du frontend déployé.
- **Suppression de compte Firebase** : `auth.currentUser.delete()` échoue si la session n'est pas "récente" — l'utilisateur doit parfois se reconnecter avant de supprimer son compte (message affiché dans l'app).

## 10. Checklist finale avant mise en production

- [ ] Toutes les variables `.env` renseignées avec de vraies valeurs (jamais commitées).
- [ ] Règles Firestore déployées et testées (aucun accès non autorisé possible).
- [ ] `firebase-config.js` pointe vers le vrai projet Firebase et le vrai `BACKEND_URL`.
- [ ] CinetPay configuré en mode production (pas en mode test) avant l'ouverture au public.
- [ ] Webhook CinetPay testé avec au moins un paiement réel de faible montant.
- [ ] Politique de confidentialité visible (page `profile.html`).
- [ ] Suppression de compte et de documents fonctionnelle.
- [ ] Test sur un Android bas de gamme et sur connexion lente.
- [ ] Test aux largeurs 320px, 360px, 390px, 412px, 768px, 1024px, 1440px.

---

## V2 — Fonctionnalités prévues (hors périmètre V1 volontairement)

- Import DOCX (V1 se limite au PDF texte + collage manuel, comme demandé).
- Édition avancée des documents (historique de versions).
- Notifications d'expiration d'abonnement PREMIUM/GOLD (relance avant renouvellement).
- Tableau de bord "Mes documents" listant les analyses/lettres passées avec ré-export PDF.
- Limiteur de débit partagé (Redis) pour supporter plusieurs instances backend.
- Support multilingue (CV en anglais).
- Suivi analytique des candidatures.

Ces fonctionnalités n'ont volontairement pas été ajoutées en V1 pour ne pas complexifier le lancement initial, conformément au brief.
