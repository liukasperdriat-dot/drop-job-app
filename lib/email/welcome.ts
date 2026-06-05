import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, firstName?: string) {
  const name = firstName || email.split('@')[0]

  await resend.emails.send({
    from: 'Drop-Job <noreply@drop-job.fr>',
    to: email,
    subject: 'Bienvenue sur Drop-Job 👋',
    html: buildHtml(name),
  })
}

function buildHtml(firstName: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Bienvenue sur Drop-Job</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:40px 16px;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:#2563eb;padding:32px 40px 28px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <svg width="28" height="28" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="5" y="5" width="30" height="30" rx="7" transform="rotate(45 20 20)" stroke="#ffffff" stroke-width="2.2" fill="none"/>
                    <rect x="9" y="9" width="22" height="22" rx="5" transform="rotate(45 20 20)" stroke="#ffffff" stroke-width="1.5" fill="none" opacity="0.55"/>
                    <circle cx="20" cy="20" r="7.5" stroke="#ffffff" stroke-width="1.8" fill="none"/>
                    <line x1="20" y1="15.5" x2="20" y2="22.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
                    <polyline points="17,20.5 20,23.5 23,20.5" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                  </svg>
                </td>
                <td style="padding-left:10px;vertical-align:middle;">
                  <span style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.03em;">Drop-Job</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 32px;">
            <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#111827;letter-spacing:-0.02em;">
              Bonjour ${firstName}&nbsp;!
            </h1>
            <p style="margin:0 0 24px;font-size:15px;color:#6b7280;line-height:1.6;">
              Votre compte Drop-Job est créé. Vous pouvez maintenant&nbsp;:
            </p>

            <!-- Features list -->
            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:1px;">
                        <span style="display:inline-block;width:20px;height:20px;background:#dbeafe;border-radius:50%;text-align:center;line-height:20px;font-size:11px;">🔍</span>
                      </td>
                      <td style="padding-left:10px;font-size:14px;color:#374151;line-height:1.5;">
                        Rechercher des offres <strong>France Travail</strong> et <strong>Adzuna</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #f3f4f6;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:1px;">
                        <span style="display:inline-block;width:20px;height:20px;background:#dbeafe;border-radius:50%;text-align:center;line-height:20px;font-size:11px;">⚡</span>
                      </td>
                      <td style="padding-left:10px;font-size:14px;color:#374151;line-height:1.5;">
                        Générer votre <strong>CV adapté</strong> à chaque offre en 1 clic
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;">
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="width:28px;vertical-align:top;padding-top:1px;">
                        <span style="display:inline-block;width:20px;height:20px;background:#dbeafe;border-radius:50%;text-align:center;line-height:20px;font-size:11px;">📄</span>
                      </td>
                      <td style="padding-left:10px;font-size:14px;color:#374151;line-height:1.5;">
                        Télécharger votre CV en <strong>PDF</strong>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- CTA primaire -->
            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
              <tr>
                <td align="center">
                  <a href="https://www.drop-job.fr/jobs"
                     style="display:inline-block;background:#2563eb;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;letter-spacing:-0.01em;">
                    Commencer ma recherche
                  </a>
                </td>
              </tr>
            </table>

            <!-- Info quota -->
            <p style="margin:0 0 20px;font-size:13px;color:#6b7280;text-align:center;line-height:1.6;background:#f9fafb;border-radius:8px;padding:14px 16px;">
              Vous avez droit à <strong>1 CV gratuit par mois</strong>.<br/>
              Pour des CV illimités, passez Premium.
            </p>

            <!-- CTA secondaire -->
            <table cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:32px;">
              <tr>
                <td align="center">
                  <a href="https://buy.stripe.com/6oUcN4cMAbJX553a1o4wM00"
                     style="display:inline-block;color:#2563eb;text-decoration:none;font-size:14px;font-weight:600;padding:11px 28px;border-radius:10px;border:1.5px solid #2563eb;letter-spacing:-0.01em;">
                    Découvrir Premium
                  </a>
                </td>
              </tr>
            </table>

            <!-- Signature -->
            <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
              À bientôt,<br/>
              <strong>L'équipe Drop-Job</strong>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #f3f4f6;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9ca3af;">
              <a href="https://www.drop-job.fr" style="color:#2563eb;text-decoration:none;font-weight:500;">drop-job.fr</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}
