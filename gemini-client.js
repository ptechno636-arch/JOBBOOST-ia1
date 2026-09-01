// gemini-client.js
// IMPORTANT : ce fichier ne contient AUCUNE clé Gemini. Il appelle
// uniquement le backend sécurisé (BACKEND_URL défini dans firebase-config.js)
// qui, lui, détient la clé côté serveur.
//
// buildGeminiPrompt() est répliquée ici en documentation seulement : le vrai
// prompt envoyé à Gemini est construit et exécuté côté serveur
// (backend/api/gemini.js) pour ne jamais exposer la logique/clé au client.

/**
 * Documente la structure du prompt envoyé à Gemini (source de vérité :
 * backend/api/gemini.js -> buildGeminiPrompt). Utile pour audit/tests.
 */
function describeGeminiPrompt(cvText, targetJob) {
  return {
    role: 'Expert international en recrutement, CV, ATS et rédaction professionnelle',
    targetJob,
    cvLength: cvText.length,
    constraints: [
      'corriger les erreurs',
      'améliorer la clarté',
      'professionnaliser les formulations',
      'conserver strictement les faits fournis',
      'optimiser pour le poste',
      'améliorer la structure',
      'identifier les faiblesses',
      'interdiction absolue d\'inventer des informations'
    ]
  };
}

/**
 * Envoie le CV et le poste recherché au backend pour analyse Gemini.
 * Retourne { success, result, documentId, creditsRemaining }.
 */
async function analyzeCv(cvText, targetJob) {
  return callBackend('/api/gemini/analyze', {
    body: { cvText, targetJob }
  });
}

/**
 * Génère une lettre de motivation via le backend (même règle : ne rien inventer).
 */
async function generateCoverLetter({ cvText, targetJob, company, jobOffer }) {
  return callBackend('/api/gemini/cover-letter', {
    body: { cvText, targetJob, company, jobOffer }
  });
}

/**
 * Compare le CV à une offre d'emploi via le backend.
 */
async function matchJobOffer({ cvText, jobOffer }) {
  return callBackend('/api/gemini/match', {
    body: { cvText, jobOffer }
  });
}
