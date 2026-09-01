// app.js
// Fonctions partagées par toutes les pages : gestion de session, alertes,
// appels backend authentifiés, formatage.

const PLANS_DISPLAY = {
  free: { label: 'FREE', badgeClass: 'badge--free' },
  pro: { label: 'PRO', badgeClass: 'badge--pro' },
  premium: { label: 'PREMIUM', badgeClass: 'badge--premium' },
  gold: { label: 'GOLD', badgeClass: 'badge--gold' }
};

/** Affiche une alerte dans un élément portant l'id donné. */
function showAlert(elementId, message, type = 'error') {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent = message;
  el.className = `alert alert--visible alert--${type}`;
}

function hideAlert(elementId) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.className = 'alert';
}

/** Bascule un bouton en état de chargement (spinner + désactivation). */
function setButtonLoading(button, loading, loadingText = 'Chargement...') {
  if (!button) return;
  if (loading) {
    button.dataset.originalText = button.innerHTML;
    button.innerHTML = `<span class="spinner"></span> ${loadingText}`;
    button.disabled = true;
  } else {
    button.innerHTML = button.dataset.originalText || button.innerHTML;
    button.disabled = false;
  }
}

/** Traduit les codes d'erreur backend/Firebase en messages compréhensibles. */
function translateError(code) {
  const messages = {
    'auth/invalid-email': 'Adresse email invalide.',
    'auth/user-not-found': 'Aucun compte ne correspond à cet email.',
    'auth/wrong-password': 'Mot de passe incorrect.',
    'auth/email-already-in-use': 'Un compte existe déjà avec cet email.',
    'auth/weak-password': 'Le mot de passe doit contenir au moins 6 caractères.',
    'auth/popup-closed-by-user': 'Connexion annulée.',
    'auth/network-request-failed': 'Connexion Internet indisponible.',
    NO_CREDITS: 'Vous n\'avez plus de crédits d\'analyse. Passez à un plan payant.',
    QUOTA_EXCEEDED: 'Le quota gratuit Gemini est atteint pour le moment. Réessayez plus tard.',
    GEMINI_UNAVAILABLE: 'Le service d\'analyse IA est momentanément indisponible.',
    TIMEOUT: 'La demande a pris trop de temps. Réessayez.',
    NETWORK_ERROR: 'Vérifiez votre connexion Internet et réessayez.',
    PARSE_ERROR: 'L\'analyse n\'a pas pu être traitée correctement. Réessayez.',
    EMPTY_RESPONSE: 'Aucune réponse reçue de l\'IA. Réessayez.',
    INVALID_KEY: 'Erreur de configuration du service. Contactez le support.',
    EMPTY_CV: 'Merci de coller ou importer votre CV.',
    EMPTY_JOB: 'Merci d\'indiquer le poste recherché.',
    CV_TOO_LONG: 'Votre CV est trop long (20 000 caractères maximum).',
    UNAUTHENTICATED: 'Merci de vous connecter.',
    INVALID_TOKEN: 'Votre session a expiré, reconnectez-vous.',
    CINETPAY_UNAVAILABLE: 'Le service de paiement est momentanément indisponible.',
    RATE_LIMITED: 'Trop de tentatives. Patientez un instant.',
    INTERNAL_ERROR: 'Une erreur est survenue. Réessayez.'
  };
  return messages[code] || 'Une erreur inattendue est survenue.';
}

/** Redirige vers login.html si l'utilisateur n'est pas connecté. */
function requireLogin(onReady) {
  auth.onAuthStateChanged((user) => {
    if (!user) {
      window.location.href = 'login.html';
      return;
    }
    onReady(user);
  });
}

/** Récupère (ou crée) le document Firestore users/{uid}. */
async function ensureUserProfile(user) {
  const ref = db.collection('users').doc(user.uid);
  const snap = await ref.get();
  if (!snap.exists) {
    await ref.set({
      email: user.email || '',
      displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Utilisateur'),
      plan: 'free',
      credits: 1,
      letters: 0,
      cvGold: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return (await ref.get()).data();
  }
  return snap.data();
}

/** Appelle le backend sécurisé avec le token Firebase de l'utilisateur connecté. */
async function callBackend(path, { method = 'POST', body } = {}) {
  const user = auth.currentUser;
  if (!user) throw { error: 'UNAUTHENTICATED', message: translateError('UNAUTHENTICATED') };

  let idToken;
  try {
    idToken = await user.getIdToken();
  } catch (e) {
    throw { error: 'INVALID_TOKEN', message: translateError('INVALID_TOKEN') };
  }

  let response;
  try {
    response = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch (networkErr) {
    throw { error: 'NETWORK_ERROR', message: translateError('NETWORK_ERROR') };
  }

  let json;
  try {
    json = await response.json();
  } catch (e) {
    throw { error: 'INTERNAL_ERROR', message: translateError('INTERNAL_ERROR') };
  }

  if (!response.ok) {
    throw { error: json.error, message: json.message || translateError(json.error) };
  }
  return json;
}

/** Renseigne le badge de plan + crédits dans un header de page. */
function renderPlanBadge(elId, planId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const info = PLANS_DISPLAY[planId] || PLANS_DISPLAY.free;
  el.textContent = info.label;
  el.className = `badge ${info.badgeClass}`;
}

function logout() {
  auth.signOut().then(() => { window.location.href = 'index.html'; });
}
