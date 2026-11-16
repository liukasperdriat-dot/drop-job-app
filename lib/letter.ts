// Lettre de motivation au format professionnel français, découpée en blocs
// (utilisée par l'API, l'aperçu à l'écran et le PDF).

export type LetterParts = {
  sender: string[]      // nom, ville, téléphone, e-mail du candidat
  recipient: string[]   // entreprise, service destinataire
  placeDate: string     // « Toulon, le 16 novembre 2026 »
  subject: string       // « Objet : Candidature au poste de … »
  salutation: string    // « Madame, Monsieur, »
  paragraphs: string[]  // corps de la lettre
  closing: string       // formule de politesse
  signature: string     // nom du candidat
}

// Version texte, pour copier-coller la lettre
export function letterToText(p: LetterParts): string {
  return [
    p.sender.join('\n'),
    p.recipient.join('\n'),
    p.placeDate,
    p.subject,
    p.salutation,
    ...p.paragraphs,
    p.closing,
    p.signature,
  ].filter(Boolean).join('\n\n')
}
