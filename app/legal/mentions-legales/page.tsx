import Link from 'next/link';

export const metadata = {
  title: 'Mentions Légales — Drop-Job',
  description: 'Mentions légales de la plateforme Drop-Job, conformément à la loi LCEN du 21 juin 2004.',
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, paddingBottom: 10, borderBottom: `1px solid ${s.line}`, marginBottom: 10, flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 500, color: s.text, minWidth: 180, flexShrink: 0 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function MentionsLegalesPage() {
  return (
    <div style={{ background: s.bg, minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: s.text, WebkitFontSmoothing: 'antialiased' }}>
      <style>{`
        @media (max-width: 600px) {
          .legal-card { padding: 28px 20px !important; }
          .legal-wrap { padding: 32px 16px 64px !important; }
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
            Mentions Légales
          </h1>
          <p style={{ fontSize: 14, color: s.text2, marginBottom: 40 }}>
            Conformément à la loi n°2004-575 du 21 juin 2004 pour la Confiance dans l'Économie Numérique (LCEN).
          </p>

          <Section title="1. Éditeur du site">
            <InfoRow label="Nom légal" value="Liukas Guillaume PERDRIAT" />
            <InfoRow label="Forme juridique" value="Entrepreneur individuel (micro-entreprise)" />
            <InfoRow label="SIREN" value="105 128 920" />
            <InfoRow label="SIRET" value="105 128 920 00011" />
            <InfoRow label="Code APE" value="6201Z" />
            <InfoRow label="Adresse" value="250 Chemin des Bosquets, 83390 Puget-Ville, France" />
            <InfoRow label="Email de contact" value="dropjob.contact@gmail.com" />
            <InfoRow label="Téléphone" value="06 14 49 26 88" />
            <InfoRow label="Date d'immatriculation" value="19/05/2026" />
            <InfoRow label="Régime TVA" value="Franchise en base de TVA (non assujetti à TVA)" />
          </Section>

          <Section title="2. Directeur de la publication">
            <P>
              Le directeur de la publication du site Drop-Job est <strong style={{ color: s.text }}>Liukas Guillaume PERDRIAT</strong>, en qualité d'éditeur du Service.
            </P>
          </Section>

          <Section title="3. Hébergeur">
            <InfoRow label="Société" value="Vercel Inc." />
            <InfoRow label="Adresse" value="340 Pine Street, Suite 701, San Francisco, CA 94104, États-Unis" />
            <InfoRow label="Site web" value="vercel.com" />
            <P style={{ marginTop: 8 }}>
              Vercel Inc. est le prestataire d'hébergement du Service. En cas d'urgence (contenu illicite, sécurité), vous pouvez contacter l'Éditeur à dropjob.contact@gmail.com.
            </P>
          </Section>

          <Section title="4. Propriété intellectuelle">
            <P>
              L'ensemble des éléments constituant le site Drop-Job (textes, graphismes, logo, icônes, code source, algorithmes, structure) est la propriété exclusive de Liukas Guillaume PERDRIAT, à l'exception des marques, logos ou contenus appartenant à des tiers (France Travail, entreprises partenaires, etc.) qui demeurent la propriété de leurs détenteurs respectifs.
            </P>
            <P>
              Toute reproduction, représentation, modification, publication, adaptation, totale ou partielle, des éléments du site, par quelque procédé que ce soit, est interdite sans autorisation écrite préalable de l'Éditeur. Toute utilisation non autorisée peut constituer une contrefaçon passible de poursuites judiciaires.
            </P>
            <P>
              Les marques et logos des entreprises citées dans les offres d'emploi appartiennent à leurs propriétaires respectifs et sont utilisés à titre informatif.
            </P>
          </Section>

          <Section title="5. Liens hypertextes">
            <P>
              Le site Drop-Job peut contenir des liens hypertextes vers des sites tiers. Ces liens sont fournis à titre informatif. L'Éditeur n'exerce aucun contrôle sur le contenu de ces sites et décline toute responsabilité quant à leur contenu, leur disponibilité ou leur politique de confidentialité.
            </P>
            <P>
              Tout lien hypertexte vers le site Drop-Job doit faire l'objet d'une autorisation préalable de l'Éditeur.
            </P>
          </Section>

          <Section title="6. Limitation de responsabilité">
            <P>
              L'Éditeur s'efforce d'assurer l'exactitude et la mise à jour des informations diffusées sur le Service, mais ne saurait garantir l'exhaustivité ou l'absence d'erreurs. Les informations sont fournies à titre indicatif et peuvent évoluer sans préavis.
            </P>
            <P>
              L'Éditeur ne peut être tenu responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le Service, notamment en cas d'interruption, de virus ou de perte de données.
            </P>
          </Section>

          <Section title="7. Droit applicable">
            <P>
              Le présent site et ses contenus sont soumis au droit français. Tout litige relatif à l'interprétation ou à l'exécution des présentes mentions légales est soumis à la compétence exclusive des juridictions françaises, et notamment au tribunal compétent dans le ressort de la Cour d'appel d'Aix-en-Provence.
            </P>
          </Section>

          <Section title="8. Signalement de contenus illicites">
            <P>
              Conformément à l'article 6 de la LCEN, si vous constatez un contenu manifestement illicite sur le Service, vous pouvez le signaler à l'Éditeur à l'adresse dropjob.contact@gmail.com. L'Éditeur s'engage à traiter votre signalement dans les plus brefs délais.
            </P>
          </Section>

          <Section title="9. Cookies">
            <P>
              Le Service utilise des cookies strictement nécessaires au fonctionnement technique (authentification, session). Aucun cookie publicitaire ou de suivi comportemental tiers n'est déposé. Pour plus d'informations, consultez notre{' '}
              <Link href="/legal/confidentialite" style={{ color: s.blue, textDecoration: 'none' }}>Politique de confidentialité</Link>.
            </P>
          </Section>

          {/* Footer links */}
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${s.line}`, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: s.text2, fontWeight: 500 }}>Pages légales :</span>
            <Link href="/legal/cgu" style={{ fontSize: 14, color: s.blue, textDecoration: 'none', fontWeight: 500 }}>
              CGU
            </Link>
            <Link href="/legal/confidentialite" style={{ fontSize: 14, color: s.blue, textDecoration: 'none', fontWeight: 500 }}>
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
