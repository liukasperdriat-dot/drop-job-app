import Link from 'next/link';

export const metadata = {
  title: 'Conditions Générales d\'Utilisation — Drop-Job',
  description: 'Conditions générales d\'utilisation de la plateforme Drop-Job.',
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', gap: 16, paddingBottom: 10, borderBottom: `1px solid ${s.line}`, marginBottom: 10, flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 500, color: s.text, minWidth: 200, flexShrink: 0 }}>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export default function CGUPage() {
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
            Conditions Générales d'Utilisation
          </h1>
          <p style={{ fontSize: 14, color: s.text2, marginBottom: 40 }}>
            Dernière mise à jour : 10 mai 2026
          </p>

          <Section title="Éditeur / Vendeur">
            <InfoRow label="Nom légal" value="Liukas Guillaume PERDRIAT" />
            <InfoRow label="Forme juridique" value="Entrepreneur individuel (micro-entreprise)" />
            <InfoRow label="SIREN" value="105 128 920" />
            <InfoRow label="SIRET" value="105 128 920 00011" />
            <InfoRow label="Code APE" value="6201Z" />
            <InfoRow label="Adresse" value="250 Chemin des Bosquets, 83390 Puget-Ville, France" />
            <InfoRow label="Email" value="dropjob.contact@gmail.com" />
            <InfoRow label="Téléphone" value="06 14 49 26 88" />
            <InfoRow label="Date d'immatriculation" value="19/05/2026" />
            <InfoRow label="Régime TVA" value="Franchise en base de TVA (non assujetti à TVA)" />
          </Section>

          <Section title="Article 1 — Objet">
            <P>
              Les présentes conditions générales d'utilisation (ci-après « CGU ») régissent l'accès et l'utilisation de la plateforme Drop-Job (ci-après « le Service »), éditée par Liukas Guillaume PERDRIAT, entrepreneur individuel (micro-entreprise), SIREN 105 128 920.
            </P>
            <P>
              Tout accès ou utilisation du Service implique l'acceptation sans réserve des présentes CGU. Si vous n'acceptez pas ces conditions, vous devez cesser d'utiliser le Service.
            </P>
          </Section>

          <Section title="Article 2 — Définitions">
            <Ul>
              <Li>« Service » : la plateforme Drop-Job et l'ensemble de ses fonctionnalités (agrégation d'offres, génération de CV, suivi de candidatures).</Li>
              <Li>« Utilisateur » : toute personne physique accédant et utilisant le Service.</Li>
              <Li>« Compte » : espace personnel créé par l'Utilisateur lors de son inscription.</Li>
              <Li>« Contenu » : toute donnée saisie par l'Utilisateur (profil, expériences, formations, compétences, etc.).</Li>
              <Li>« CV Généré » : document PDF produit automatiquement par le Service à partir du Contenu de l'Utilisateur.</Li>
              <Li>« Éditeur » : Liukas Guillaume PERDRIAT, entrepreneur individuel (micro-entreprise), SIREN 105 128 920, 250 Chemin des Bosquets, 83390 Puget-Ville, France.</Li>
            </Ul>
          </Section>

          <Section title="Article 3 — Accès au Service">
            <P>
              L'accès au Service est réservé aux personnes physiques majeures (18 ans ou plus) ou aux mineurs ayant obtenu l'autorisation expresse de leurs représentants légaux.
            </P>
            <P>
              L'inscription nécessite la fourniture d'une adresse email valide et la création d'un mot de passe sécurisé. L'Utilisateur est seul responsable de la confidentialité de ses identifiants et de toute activité réalisée depuis son Compte.
            </P>
            <P>
              En cas de suspicion d'utilisation frauduleuse, l'Utilisateur doit contacter l'Éditeur immédiatement à l'adresse dropjob.contact@gmail.com.
            </P>
          </Section>

          <Section title="Article 4 — Offres et tarifs">
            <P style={{ fontWeight: 600, color: s.text }}>4.1. Offre Gratuite (« Free »)</P>
            <Ul>
              <Li>Génération d'1 (un) CV par mois calendaire.</Li>
              <Li>Le CV généré comporte un filigrane (watermark) visible indiquant son origine.</Li>
              <Li>Accès aux fonctionnalités de recherche et de consultation des offres d'emploi.</Li>
              <Li>Sans engagement de durée, résiliable à tout moment.</Li>
            </Ul>

            <P style={{ fontWeight: 600, color: s.text, marginTop: 16 }}>4.2. Offre Premium</P>
            <Ul>
              <Li>Tarif : <strong>9,90 € TTC par mois</strong>.</Li>
              <Li>Génération de CV illimitée, sans filigrane.</Li>
              <Li>Accès à l'ensemble des fonctionnalités avancées du Service.</Li>
              <Li>Facturation mensuelle, par prélèvement automatique via Stripe, renouvelable tacitement.</Li>
              <Li>L'Utilisateur peut résilier à tout moment depuis son espace personnel ; la résiliation prend effet à la fin de la période mensuelle en cours.</Li>
            </Ul>

            <P style={{ fontWeight: 600, color: s.text, marginTop: 16 }}>4.3. Droit de rétractation</P>
            <P>
              Conformément à l'article L.221-28 12° du Code de la consommation, le droit de rétractation de 14 jours ne s'applique pas aux contenus numériques dont l'exécution a commencé avec l'accord exprès de l'Utilisateur et renonciation expresse à son droit de rétractation avant le début de l'exécution du contrat.
            </P>

            <P style={{ fontWeight: 600, color: s.text, marginTop: 16 }}>4.4. Modification des tarifs</P>
            <P>
              L'Éditeur se réserve le droit de modifier ses tarifs. Toute modification sera notifiée à l'Utilisateur au moins 30 jours à l'avance par email. L'absence d'opposition dans ce délai vaut acceptation.
            </P>
          </Section>

          <Section title="Article 5 — Obligations de l'Utilisateur">
            <P>L'Utilisateur s'engage à utiliser le Service de manière loyale et conforme aux lois et règlements en vigueur.</P>
            <P>Il est strictement interdit de :</P>
            <Ul>
              <Li>Usurper l'identité d'un tiers ou fournir des informations erronées lors de l'inscription.</Li>
              <Li>Tenter d'accéder frauduleusement au Service ou aux comptes d'autres utilisateurs.</Li>
              <Li>Diffuser des contenus illicites, diffamatoires, obscènes ou portant atteinte à des droits de tiers.</Li>
              <Li>Utiliser le Service à des fins commerciales non autorisées préalablement par l'Éditeur.</Li>
              <Li>Procéder à de l'ingénierie inverse, décompiler ou tenter d'extraire le code source du Service.</Li>
              <Li>Utiliser des robots, scripts ou tout autre outil automatisé pour accéder au Service de manière non autorisée.</Li>
              <Li>Surcharger délibérément l'infrastructure du Service (attaque par déni de service, etc.).</Li>
            </Ul>
          </Section>

          <Section title="Article 6 — Propriété intellectuelle">
            <P>
              Le Service, sa structure, son design, son code source, ses textes, ses algorithmes et l'ensemble de ses composants sont la propriété exclusive de l'Éditeur et sont protégés par les dispositions du Code de la propriété intellectuelle.
            </P>
            <P>
              L'Utilisateur conserve la pleine propriété de ses données personnelles et du Contenu qu'il saisit. Il accorde à l'Éditeur une licence non exclusive, mondiale, gratuite et limitée, pour stocker et traiter ce Contenu aux seules fins de la fourniture du Service.
            </P>
            <P>
              Les CV générés sont destinés à l'usage personnel de l'Utilisateur. Toute exploitation commerciale nécessite l'accord préalable écrit de l'Éditeur.
            </P>
          </Section>

          <Section title="Article 7 — Responsabilité">
            <P>
              L'Éditeur s'efforce d'assurer la disponibilité du Service mais ne peut garantir une disponibilité ininterrompue ou sans erreur. Des interruptions de service peuvent survenir pour maintenance, mise à jour ou en cas de force majeure.
            </P>
            <P>
              L'Éditeur décline toute responsabilité quant à la pertinence, l'exactitude ou l'exhaustivité des offres d'emploi agrégées depuis des sources tierces (France Travail, etc.), dont il n'est pas l'auteur.
            </P>
            <P>
              Les CV générés par intelligence artificielle sont fournis à titre d'outil d'aide à la rédaction. L'Éditeur ne saurait être tenu responsable du résultat obtenu lors de candidatures effectuées sur la base de ces documents.
            </P>
            <P>
              La responsabilité de l'Éditeur est limitée aux dommages directs prouvés. En aucun cas, l'Éditeur ne pourra être tenu responsable des dommages indirects, pertes de chance ou pertes d'exploitation.
            </P>
          </Section>

          <Section title="Article 8 — Données personnelles">
            <P>
              Le traitement des données personnelles collectées dans le cadre de l'utilisation du Service est décrit en détail dans la{' '}
              <Link href="/legal/confidentialite" style={{ color: s.blue, textDecoration: 'none' }}>Politique de confidentialité</Link>{' '}
              disponible à l'adresse /legal/confidentialite.
            </P>
            <P>
              Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi n°78-17 du 6 janvier 1978 modifiée (loi Informatique et Libertés), l'Utilisateur dispose de droits d'accès, de rectification, d'effacement, de portabilité et d'opposition sur ses données personnelles.
            </P>
          </Section>

          <Section title="Article 9 — Résiliation et suspension">
            <P>
              L'Utilisateur peut clôturer son Compte à tout moment depuis son espace personnel ou en contactant l'Éditeur à dropjob.contact@gmail.com. En cas d'abonnement Premium actif, la résiliation prend effet à la fin de la période mensuelle en cours, sans remboursement prorata temporis.
            </P>
            <P>
              L'Éditeur se réserve le droit de suspendre ou supprimer, sans préavis ni indemnité, tout Compte en cas de violation manifeste des présentes CGU, d'activité frauduleuse ou de comportement nuisible au Service ou à d'autres utilisateurs.
            </P>
          </Section>

          <Section title="Article 10 — Modification des CGU">
            <P>
              L'Éditeur se réserve le droit de modifier les présentes CGU à tout moment afin de les adapter aux évolutions du Service ou du cadre légal. Les Utilisateurs seront informés de toute modification substantielle par email au moins 15 jours avant son entrée en vigueur.
            </P>
            <P>
              La poursuite de l'utilisation du Service après modification vaut acceptation des nouvelles CGU. En cas de refus, l'Utilisateur doit cesser d'utiliser le Service et peut clôturer son Compte.
            </P>
          </Section>

          <Section title="Article 11 — Médiation et règlement des litiges">
            <P>
              En cas de litige, l'Utilisateur est invité à contacter en premier lieu l'Éditeur à dropjob.contact@gmail.com pour tenter une résolution amiable.
            </P>
            <P>
              Conformément à l'article L.612-1 du Code de la consommation, l'Utilisateur consommateur peut recourir gratuitement à un médiateur de la consommation. La Commission européenne met à disposition une plateforme de règlement en ligne des litiges accessible à l'adresse ec.europa.eu/consumers/odr.
            </P>
          </Section>

          <Section title="Article 12 — Droit applicable et juridiction compétente">
            <P>
              Les présentes CGU sont soumises au droit français. En cas de litige persistant après tentative de résolution amiable, les tribunaux compétents du ressort de la Cour d'appel d'Aix-en-Provence seront seuls compétents, sous réserve des règles de compétence impératives applicables aux consommateurs.
            </P>
          </Section>

          {/* Footer links */}
          <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${s.line}`, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 14, color: s.text2, fontWeight: 500 }}>Pages légales :</span>
            <Link href="/legal/mentions-legales" style={{ fontSize: 14, color: s.blue, textDecoration: 'none', fontWeight: 500 }}>
              Mentions légales
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
