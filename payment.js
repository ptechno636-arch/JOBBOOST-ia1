// payment.js
// Ce fichier ne contient AUCUN secret CinetPay. Il demande au backend de
// créer une transaction réelle, puis redirige l'utilisateur vers le
// checkout officiel CinetPay. La vérification se fait aussi côté backend.

/**
 * Démarre le paiement pour un plan donné ("pro" | "premium" | "gold").
 * Redirige le navigateur vers l'URL de paiement CinetPay retournée par le backend.
 */
async function startPayment(planId) {
  const result = await callBackend('/api/payment/create', { body: { planId } });
  if (!result.paymentUrl) {
    throw { error: 'CINETPAY_ERROR', message: 'Impossible d\'obtenir l\'URL de paiement.' };
  }
  // On garde une trace locale de la transaction en cours pour l'écran de retour.
  sessionStorage.setItem('jobboost_pending_tx', result.transactionId);
  window.location.href = result.paymentUrl;
}

/**
 * Vérifie RÉELLEMENT une transaction auprès du backend (qui interroge
 * CinetPay). À appeler sur success.html / cancel.html.
 */
async function verifyPayment(transactionId) {
  return callBackend('/api/payment/verify', { body: { transactionId } });
}
