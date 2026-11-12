import Link from 'next/link';

export const metadata = {
  title: 'Politique de Confidentialité — Drop-Job',
  description: 'Politique de confidentialité et traitement des données personnelles de Drop-Job, conforme au RGPD.',
  alternates: { canonical: '/legal/confidentialite' },
};

const s = {
  bg: '#f5f5f7',
  white: '#fff',
  text: '#1d1d1f',
  text2: '#6e6e73',
  line: 'rgba(0,0,0,.08)',
  blue: '#0071e3',
  shadow: '0 1px 2px rgba(0,0,0,.05), 0 2px 12px rgba(0,0,0,.05)',
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600, color: s.text, letterSpacing: '-0.02em', marginBottom: 12 }}>
        {title}
      </h2>
      <div style={{ fontSize: 15, lineHeight: 1.7, color: s.text2 }}>{children}</div>
    </section>
  );
}

function P({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return <p style={{ marginBottom: 10, ...style }}>{children}</p>;
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul style={{ paddingLeft: 20, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>{children}</ul>;
}

function Li({ children }: { children: React.ReactNode }) {
  return <li style={{ listStyleType: 'disc' }}>{children}</li>;
}

function Right({ article, title, desc }: { article: string; title: string; desc: string }) {
  return (
    <div style={{ background: s.bg, borderRadius: 12, padding: '14px 16px', marginBottom: 10 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <span style={{ fontWeight: 600, color: s.text, fontSize: 13, minWidth: 56 }}>{article}</span>
        <div>
          <div style={{ fontWeight: 600, color: s.text, fontSize: 14, marginBottom: 2 }}>{title}</div>
          <div style={{ fontSize: 14, color: s.text2 }}>{desc}</div>
        </div>
      </div>
    </div>
  );
}

export default function ConfidentialitePage() {
  return (
    <div style={{ background: s.bg, minHeight: '100vh', fontFamily: "var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif", color: s.text, WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @media (max-width: 600px) {
          .legal-card { padding: 28px 20px !important; }
          .legal-wrap { padding: 32px 16px 64px !important; }
          .processor-table { font-size: 13px !important; }
          .processor-table th, .processor-table td { padding: 10px 8px !important; }
        }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(245,245,247,0.92)', backdropFilter: 'blur(24px) saturate(180%)', borderBottom: `1px solid ${s.line}`, height: 52, display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', width: '100%', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ fontWeight: 700, fontSize: 17, color: s.text, textDecoration: 'none', letterSpacing: '-0.02em' }}>
            Drop-Job
          </Link>
          <Link href="/" style={{ fontSize: 14, color: s.blue, textDecoration: 'none', fontWeight: 500 }}>
            ← Retour à l'accueil
          </Link>
        </div>
      </nav>

      {/* Content */}
      <div className="legal-wrap" style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px 80px' }}>
        <div className="legal-card" style={{ background: s.white, borderRadius: 18, border: `1px solid ${s.line}`, boxShadow: s.shadow, padding: '48px 48px' }}>

          <h1 style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.03em', color: s.text, marginBottom: 8 }}>
            Politique de Confidentialité
          </h1>
          <p style={{ fontSize: 14, color: s.text2, marginBottom: 12 }}>
            Dernière mise à jour : 12 novembre 2026
          </p>
          <p style={{ fontSize: 14, color: s.text2, marginBottom: 40 }}>
            Conforme au Règlement (UE) 2016/679 (RGPD) et à la loi n°78-17 du 6 janvier 1978 modifiée (loi Informatique et Libertés).
          </p>

          <Section title="1. Responsable du traitement">
            <P>Le responsable du traitement des données personnelles collectées via le Service Drop-Job est :</P>
            <div style={{ background: s.bg, borderRadius: 12, padding: '16px 20px', marginTop: 8 }}>
              <div><strong style={{ color: s.text }}>Liukas Guillaume PERDRIAT</strong></div>
              <div>Entrepreneur individuel (micro-entreprise)</div>
              <div>SIREN : 105 128 920 — SIRET : 105 128 920 00011</div>
              <div>250 Chemin des Bosquets, 83390 Puget-Ville, France</div>
              <div style={{ marginTop: 4 }}>
                Contact :{' '}
                <a href="mailto:dropjob.contact@gmail.com" style={{ color: s.blue, textDecoration: 'none' }}>
                  dropjob.contact@gmail.com
                </a>
                {' — Tél. : 06 14 49 26 88'}
              </div>
            </div>
          </Section>

          <Section title="2. Données collectées">
            <P style={{ fontWeight: 600, color: s.text }}>2.1. Données de compte</P>
            <Ul>
              <Li>Adresse email (identifiant unique)</Li>
              <Li>Mot de passe (stocké sous forme hachée, jamais en clair)</Li>
              <Li>Date d'inscription et de dernière connexion</Li>
              <Li>Prénom et nom transmis par Google si vous vous connectez avec votre compte Google</Li>
            </Ul>

            <P style={{ fontWeight: 600, color: s.text, marginTop: 16 }}>2.2. Données de profil professionnel</P>
            <Ul>
              <Li>Nom et prénom, titre professionnel et résumé</Li>
              <Li>Coordonnées indiquées sur le CV : e-mail, téléphone, ville, profil LinkedIn</Li>
              <Li>Expériences professionnelles, formations, compétences et langues</Li>
              <Li>Photo de profil, si vous choisissez d'en ajouter une (stockée chez Supabase et accessible uniquement par un lien difficile à deviner)</Li>
            </Ul>

            <P style={{ fontWeight: 600, color: s.text, marginTop: 16 }}>2.3. Données de paiement</P>
            <P>
              Les données de carte bancaire sont gérées exclusivement par Stripe. Drop-Job n'accède jamais aux numéros de carte, date d'expiration ou cryptogramme. Nous conservons uniquement les identifiants client et d'abonnement Stripe et le statut de l'abonnement (Premium ou non).
            </P>

            <P style={{ fontWeight: 600, color: s.text, marginTop: 16 }}>2.4. Données d'utilisation</P>
            <Ul>
              <Li>Nombre de CV générés dans le mois en cours (pour appliquer la limite de l'offre gratuite)</Li>
              <Li>Candidatures suivies dans le tableau de bord : intitulé du poste, entreprise, lieu, contrat, salaire, statut et date</Li>
              <Li>Le contenu des CV et des lettres de motivation générés n'est pas conservé sur nos serveurs : il est créé à la demande puis affiché et téléchargé dans votre navigateur.</Li>
            </Ul>

            <P style={{ fontWeight: 600, color: s.text, marginTop: 16 }}>2.5. Données techniques</P>
            <Ul>
              <Li>Adresse IP, type de navigateur et pages appelées, enregistrés uniquement dans les journaux techniques de nos hébergeurs (Vercel, Supabase)</Li>
              <Li>Journaux d'erreurs du Service</Li>
            </Ul>
          </Section>

          <Section title="3. Finalités et bases légales du traitement">
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 8 }}>
                <thead>
                  <tr style={{ background: s.bg }}>
                    <th style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 600, color: s.text, borderBottom: `1px solid ${s.line}`, whiteSpace: 'nowrap' }}>Finalité</th>
                    <th style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 600, color: s.text, borderBottom: `1px solid ${s.line}`, whiteSpace: 'nowrap' }}>Base légale</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Fourniture du Service (recherche d\'offres, génération de CV et de lettres, suivi des candidatures)', 'Exécution du contrat (art. 6.1.b RGPD)'],
                    ['Gestion des abonnements et paiements', 'Exécution du contrat (art. 6.1.b RGPD)'],
                    ['E-mails liés au compte (confirmation d\'inscription, bienvenue)', 'Exécution du contrat (art. 6.1.b RGPD)'],
                    ['Respect des obligations légales (comptabilité, fiscalité)', 'Obligation légale (art. 6.1.c RGPD)'],
                    ['Sécurité du Service et prévention des fraudes', 'Intérêt légitime (art. 6.1.f RGPD)'],
                  ].map(([fin, base], i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${s.line}` }}>
                      <td style={{ padding: '11px 14px', color: s.text2, verticalAlign: 'top' }}>{fin}</td>
                      <td style={{ padding: '11px 14px', color: s.text2, verticalAlign: 'top' }}>{base}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="4. Sous-traitants et destinataires">
            <P>
              Vos données peuvent être transmises aux sous-traitants suivants, dans le strict cadre de la fourniture du Service :
            </P>
            <div className="processor-table" style={{ overflowX: 'auto', marginTop: 8 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: s.bg }}>
                    {['Sous-traitant', 'Finalité', 'Localisation', 'Garanties'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 14px', fontWeight: 600, color: s.text, borderBottom: `1px solid ${s.line}`, whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Supabase Inc.', 'Base de données, authentification, stockage des photos', 'Irlande (UE) — société américaine', 'Clauses contractuelles types (art. 46 RGPD)'],
                    ['Vercel Inc.', 'Hébergement du site, journaux techniques', 'États-Unis / UE', 'Data Privacy Framework UE–États-Unis et/ou clauses contractuelles types'],
                    ['Stripe', 'Paiement, gestion des abonnements, factures', 'Irlande (UE) / États-Unis', 'Data Privacy Framework UE–États-Unis et/ou clauses contractuelles types'],
                    ['OpenAI', 'Génération des CV et lettres de motivation (votre profil et l\'offre visée sont transmis à chaque génération)', 'États-Unis', 'Data Privacy Framework UE–États-Unis et/ou clauses contractuelles types'],
                    ['Resend Inc.', 'Envoi des e-mails (adresse e-mail, prénom)', 'États-Unis', 'Data Privacy Framework UE–États-Unis et/ou clauses contractuelles types'],
                  ].map(([st, fin, loc, gar], i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${s.line}` }}>
                      <td style={{ padding: '11px 14px', color: s.text, fontWeight: 500, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{st}</td>
                      <td style={{ padding: '11px 14px', color: s.text2, verticalAlign: 'top' }}>{fin}</td>
                      <td style={{ padding: '11px 14px', color: s.text2, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{loc}</td>
                      <td style={{ padding: '11px 14px', color: s.text2, verticalAlign: 'top' }}>{gar}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <P style={{ marginTop: 12 }}>
              Aucune donnée n'est vendue à des tiers ni utilisée à des fins publicitaires.
            </P>
            <P>
              Les recherches d'offres sont transmises à France Travail et Adzuna (mots-clés, ville, filtres) sans aucune donnée vous concernant. Les logos des entreprises sont affichés depuis le service Logo.dev : comme pour toute image chargée depuis un autre site, votre navigateur lui transmet techniquement votre adresse IP.
            </P>
          </Section>

          <Section title="5. Transferts hors Union européenne">
            <P>
              Votre base de données est hébergée en Irlande (Union européenne). Certains prestataires (Vercel, Stripe, OpenAI, Resend, ainsi que la maison mère de Supabase) sont établis aux États-Unis et peuvent y traiter des données. Ces transferts sont encadrés par le Data Privacy Framework UE–États-Unis (décision d'adéquation du 10 juillet 2023) pour les sociétés certifiées, et/ou par des clauses contractuelles types approuvées par la Commission européenne (décision d'exécution 2021/914), conformément aux articles 45 et 46 du RGPD. Vous pouvez obtenir une copie de ces garanties en contactant dropjob.contact@gmail.com.
            </P>
          </Section>

          <Section title="6. Durée de conservation">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Données de compte, de profil et photo', 'Jusqu\'à la suppression du compte (effacement dans un délai d\'un mois après la demande)'],
                ['Candidatures et compteur de CV', 'Jusqu\'à la suppression du compte'],
                ['CV et lettres générés', 'Non conservés sur nos serveurs'],
                ['Factures et pièces comptables (Stripe)', '10 ans (obligation comptable, art. L.123-22 du Code de commerce)'],
                ['Journaux techniques (IP, accès)', '30 jours au plus, selon les durées appliquées par nos hébergeurs'],
              ].map(([cat, dur], i) => (
                <div key={i} style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: `1px solid ${s.line}`, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 500, color: s.text, minWidth: 240, flexShrink: 0, fontSize: 14 }}>{cat}</span>
                  <span style={{ fontSize: 14 }}>{dur}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="7. Vos droits (RGPD)">
            <P>Conformément au RGPD, vous disposez des droits suivants sur vos données personnelles :</P>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              <Right article="Art. 15" title="Droit d'accès" desc="Obtenir une copie de toutes les données personnelles que nous détenons vous concernant." />
              <Right article="Art. 16" title="Droit de rectification" desc="Corriger toute donnée inexacte ou incomplète vous concernant." />
              <Right article="Art. 17" title="Droit à l'effacement" desc="Demander la suppression de vos données (« droit à l'oubli »), sous réserve des obligations légales de conservation." />
              <Right article="Art. 18" title="Droit à la limitation" desc="Demander la suspension du traitement de vos données dans certaines circonstances." />
              <Right article="Art. 20" title="Droit à la portabilité" desc="Recevoir vos données dans un format structuré et lisible par machine, ou les faire transférer à un autre responsable." />
              <Right article="Art. 21" title="Droit d'opposition" desc="Vous opposer au traitement fondé sur l'intérêt légitime ou à des fins de marketing direct." />
              <Right article="Art. 7.3" title="Retrait du consentement" desc="Retirer votre consentement à tout moment, sans que cela n'affecte la licéité du traitement antérieur." />
            </div>
            <P style={{ marginTop: 16 }}>
              Pour exercer l'un de ces droits, envoyez votre demande à{' '}
              <a href="mailto:dropjob.contact@gmail.com" style={{ color: s.blue, textDecoration: 'none' }}>
                dropjob.contact@gmail.com
              </a>
              . Nous nous engageons à répondre dans un délai d'un mois (délai pouvant être porté à 3 mois pour les demandes complexes, avec notification).
            </P>
            <P>
              Si vous estimez que le traitement de vos données ne respecte pas la réglementation, vous disposez du droit d'introduire une réclamation auprès de la{' '}
              <strong style={{ color: s.text }}>CNIL (Commission Nationale de l'Informatique et des Libertés)</strong>{' '}
              — 3 Place de Fontenoy, 75007 Paris —{' '}
              <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" style={{ color: s.blue, textDecoration: 'none' }}>
                www.cnil.fr
              </a>.
            </P>
          </Section>

          <Section title="8. Cookies et traceurs">
            <P style={{ fontWeight: 600, color: s.text }}>8.1. Cookies strictement nécessaires</P>
            <P>
              Ces cookies sont indispensables au fonctionnement du Service et ne nécessitent pas votre consentement :
            </P>
            <Ul>
              <Li>Cookies de connexion (Supabase) : ils vous gardent connecté et sont supprimés lors de la déconnexion, ou au plus tard après 400 jours.</Li>
              <Li>Cookie « dropjob_next » : retient la page à rouvrir après une connexion ou une inscription ; il expire au bout d'une heure.</Li>
            </Ul>
            <P>
              Le site enregistre aussi dans votre navigateur, sans les transmettre à des tiers : l'offre que vous avez choisie pour générer un CV (effacée à l'ouverture de la page CV ou au bout d'une heure) et une copie des pages consultées, afin que le site reste utilisable hors connexion.
            </P>

            <P style={{ fontWeight: 600, color: s.text, marginTop: 16 }}>8.2. Cookies tiers</P>
            <P>
              Aucun cookie publicitaire, de ciblage comportemental ou de suivi tiers n'est déposé sur votre navigateur. Stripe peut déposer des cookies lors du processus de paiement, dans le cadre de sa politique propre de sécurité et de prévention des fraudes.
            </P>

            <P style={{ fontWeight: 600, color: s.text, marginTop: 16 }}>8.3. Gestion des cookies</P>
            <P>
              Vous pouvez configurer votre navigateur pour refuser tout ou partie des cookies. Le refus des cookies strictement nécessaires peut altérer le fonctionnement du Service.
            </P>
          </Section>

          <Section title="9. Sécurité des données">
            <P>
              L'Éditeur met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction :
            </P>
            <Ul>
              <Li>Chiffrement des communications via TLS/HTTPS</Li>
              <Li>Hachage des mots de passe (bcrypt)</Li>
              <Li>Accès aux données restreint aux seuls traitements nécessaires (principe du moindre privilège)</Li>
              <Li>Hébergement chez des prestataires spécialisés appliquant des standards de sécurité reconnus (Vercel, Supabase)</Li>
              <Li>Règles d'accès en base de données : chaque utilisateur n'accède qu'à ses propres données</Li>
            </Ul>
            <P>
              En cas de violation de données, la CNIL sera notifiée dans les 72 heures (article 33 du RGPD) et, si la violation présente un risque élevé pour vos droits et libertés, vous en serez informé dans les meilleurs délais (article 34 du RGPD).
            </P>
          </Section>

          <Section title="10. Modification de la politique de confidentialité">
            <P>
              La présente politique peut être mise à jour pour refléter les évolutions du Service, de nos pratiques ou de la réglementation applicable. Toute modification substantielle sera notifiée par email. La date de dernière mise à jour est indiquée en tête de ce document.
            </P>
          </Section>

          <Section title="11. Contact">
            <P>
              Pour toute question relative à vos données personnelles ou à la présente politique, contactez l'Éditeur à :{' '}
              <a href="mailto:dropjob.contact@gmail.com" style={{ color: s.blue, textDecoration: 'none', fontWeight: 500 }}>
                dropjob.contact@gmail.com
              </a>
            </P>
          </Section>

          {/* Footer links */}
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${s.line}`, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: s.text2, fontWeight: 500 }}>Pages légales :</span>
            <Link href="/legal/cgu" style={{ fontSize: 14, color: s.blue, textDecoration: 'none', fontWeight: 500 }}>
              CGU
            </Link>
            <Link href="/legal/mentions-legales" style={{ fontSize: 14, color: s.blue, textDecoration: 'none', fontWeight: 500 }}>
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
