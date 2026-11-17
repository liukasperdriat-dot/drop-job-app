// Contenu des pages « Modèle de CV » par métier (/modeles-cv/[metier]).
// Les exemples sont fictifs (personnes et entreprises inventées).

export type ModeleCv = {
  slug: string
  metier: string
  intro: string
  exemple: {
    nom: string
    titre: string
    ville: string
    accroche: string
    experiences: { poste: string; entreprise: string; periode: string; missions: string[] }[]
    formation: { diplome: string; ecole: string; annee: string }[]
    langues: string[]
  }
  competences: string[]
  qualites: string[]
  conseils: string[]
}

export const MODELES_CV: ModeleCv[] = [
  {
    slug: 'vendeur',
    metier: 'Vendeur',
    intro: "Le recruteur d'un vendeur cherche d'abord trois choses : le sens du contact, des résultats de vente et la fiabilité en magasin. Votre CV doit montrer les rayons ou produits que vous connaissez, les outils de caisse maîtrisés et, si possible, un chiffre (panier moyen, objectif atteint).",
    exemple: {
      nom: 'Camille Martin',
      titre: 'Vendeuse en prêt-à-porter',
      ville: 'Lyon',
      accroche: "Vendeuse depuis 3 ans en prêt-à-porter, à l'aise avec l'accueil, le conseil et l'encaissement. Habituée aux objectifs de vente et à la mise en rayon en période de forte affluence.",
      experiences: [
        { poste: 'Vendeuse conseil', entreprise: 'Boutique de prêt-à-porter, Lyon', periode: '2023 – aujourd’hui', missions: ['Accueil et conseil de 80 à 120 clients par jour', 'Objectif mensuel de vente atteint 10 mois sur 12', 'Mise en place des collections et du merchandising'] },
        { poste: 'Vendeuse saisonnière', entreprise: 'Grand magasin, Lyon', periode: '2022', missions: ['Renfort pendant les soldes et les fêtes', 'Encaissement et gestion des retours', 'Réassort des rayons'] },
      ],
      formation: [{ diplome: 'Bac pro Métiers du commerce et de la vente', ecole: 'Lycée professionnel, Villeurbanne', annee: '2022' }],
      langues: ['Anglais : intermédiaire (B1)'],
    },
    competences: ['Accueil et conseil client', 'Techniques de vente', 'Encaissement', 'Merchandising', 'Gestion des stocks', 'Fidélisation', 'Logiciel de caisse', 'Inventaire'],
    qualites: ['Sens du contact', 'Dynamisme', 'Ponctualité', 'Travail en équipe'],
    conseils: ["Citez un chiffre concret : objectif atteint, panier moyen ou nombre de clients par jour.", "Précisez le type de produits vendus (textile, high-tech, alimentaire…) : c'est souvent le premier filtre du recruteur.", "Mentionnez vos disponibilités (week-ends, soldes, fêtes) si l'offre les demande."],
  },
  {
    slug: 'preparateur-de-commandes',
    metier: 'Préparateur de commandes',
    intro: "Pour un poste de préparateur de commandes, le recruteur vérifie votre cadence, votre rigueur et vos habilitations. Les CACES, la préparation avec scanner ou commande vocale et le travail en horaires décalés doivent apparaître dès la première lecture.",
    exemple: {
      nom: 'Mehdi Benali',
      titre: 'Préparateur de commandes – CACES R489 cat. 1 et 3',
      ville: 'Marseille',
      accroche: "Préparateur de commandes depuis 4 ans en entrepôt logistique, titulaire des CACES R489 1 et 3. Rapide et fiable, habitué au picking par scanner et aux horaires en 2x8.",
      experiences: [
        { poste: 'Préparateur de commandes', entreprise: 'Plateforme logistique e-commerce, Vitrolles', periode: '2022 – aujourd’hui', missions: ['Préparation de 150 à 200 lignes par heure par scanner', 'Taux d’erreur inférieur à 0,5 %', 'Chargement et déchargement des camions au chariot'] },
        { poste: 'Manutentionnaire (intérim)', entreprise: 'Entrepôt de grande distribution, Marseille', periode: '2020 – 2022', missions: ['Réception et contrôle des marchandises', 'Filmage et étiquetage des palettes', 'Participation aux inventaires'] },
      ],
      formation: [{ diplome: 'CAP Opérateur/opératrice logistique', ecole: 'Lycée professionnel, Marseille', annee: '2020' }],
      langues: ['Arabe : courant'],
    },
    competences: ['Picking et préparation par scanner', 'Commande vocale', 'CACES R489 cat. 1 et 3', 'Contrôle qualité', 'Filmage et étiquetage', 'Chargement / déchargement', 'Inventaire', 'Respect des règles de sécurité'],
    qualites: ['Rigueur', 'Rapidité', 'Endurance', 'Ponctualité'],
    conseils: ["Placez vos CACES (catégories et date de validité) tout en haut du CV.", "Indiquez votre cadence ou votre taux d'erreur si vous les connaissez.", "Précisez les horaires acceptés (nuit, 2x8, week-end) : c'est décisif en logistique."],
  },
  {
    slug: 'developpeur-web',
    metier: 'Développeur web',
    intro: "Le CV d'un développeur web est souvent lu d'abord par un logiciel de tri (ATS), puis par un responsable technique. Il doit lister clairement votre stack, relier chaque technologie à un projet concret et donner un lien vers vos réalisations (GitHub, portfolio).",
    exemple: {
      nom: 'Lucas Petit',
      titre: 'Développeur web full stack – React / Node.js',
      ville: 'Toulouse',
      accroche: "Développeur full stack avec 3 ans d'expérience sur React, TypeScript et Node.js. J'ai livré des applications utilisées par plus de 20 000 personnes et je soigne la qualité du code (tests, revues, intégration continue).",
      experiences: [
        { poste: 'Développeur full stack', entreprise: 'Éditeur de logiciels RH, Toulouse', periode: '2023 – aujourd’hui', missions: ['Refonte du front en React et TypeScript : temps de chargement divisé par 2', 'API REST en Node.js et PostgreSQL', 'Mise en place de tests automatisés et d’une intégration continue'] },
        { poste: 'Développeur front-end (alternance)', entreprise: 'Agence web, Toulouse', periode: '2021 – 2023', missions: ['Intégration de sites responsive en HTML, CSS et JavaScript', 'Développement de thèmes et de modules sur mesure', 'Optimisation SEO et accessibilité'] },
      ],
      formation: [{ diplome: 'Bachelor Développeur web (Bac+3)', ecole: 'École du numérique, Toulouse', annee: '2023' }],
      langues: ['Anglais : professionnel (B2)'],
    },
    competences: ['JavaScript / TypeScript', 'React', 'Node.js', 'HTML / CSS', 'SQL / PostgreSQL', 'Git', 'API REST', 'Tests automatisés'],
    qualites: ['Autonomie', 'Curiosité', 'Esprit d’équipe', 'Rigueur'],
    conseils: ["Reprenez exactement les technologies de l'offre (React, Vue, Symfony…) : les logiciels de tri cherchent ces mots-clés.", "Ajoutez un lien GitHub ou portfolio avec 2 ou 3 projets représentatifs.", "Pour chaque expérience, donnez un résultat mesurable (performance, nombre d'utilisateurs, délai)."],
  },
  {
    slug: 'infirmier',
    metier: 'Infirmier',
    intro: "Un CV d'infirmier doit rassurer immédiatement sur le diplôme d'État, le numéro RPPS et les services dans lesquels vous avez exercé. Les recruteurs d'hôpitaux et de cliniques regardent aussi les spécialités, les gestes techniques maîtrisés et l'expérience en horaires de nuit.",
    exemple: {
      nom: 'Sarah Lefèvre',
      titre: 'Infirmière diplômée d’État – Médecine et chirurgie',
      ville: 'Nantes',
      accroche: "Infirmière diplômée d'État depuis 5 ans, expérimentée en médecine polyvalente et en chirurgie. Habituée à prendre en charge 12 à 15 patients par poste, de jour comme de nuit.",
      experiences: [
        { poste: 'Infirmière en chirurgie digestive', entreprise: 'Centre hospitalier, Nantes', periode: '2022 – aujourd’hui', missions: ['Soins pré et post-opératoires, pansements complexes', 'Surveillance clinique et gestion de la douleur', 'Encadrement des étudiants infirmiers'] },
        { poste: 'Infirmière en médecine polyvalente', entreprise: 'Clinique privée, Saint-Nazaire', periode: '2020 – 2022', missions: ['Préparation et administration des traitements', 'Prélèvements et pose de perfusions', 'Coordination avec l’équipe médicale et les familles'] },
      ],
      formation: [{ diplome: 'Diplôme d’État d’infirmier', ecole: 'IFSI, Nantes', annee: '2020' }],
      langues: ['Anglais : intermédiaire (B1)'],
    },
    competences: ['Soins techniques', 'Pansements complexes', 'Pose de perfusions', 'Prélèvements', 'Surveillance clinique', 'Dossier patient informatisé', 'Hygiène et asepsie', 'Gestion des urgences'],
    qualites: ['Empathie', 'Sang-froid', 'Rigueur', 'Travail en équipe pluridisciplinaire'],
    conseils: ["Indiquez votre diplôme d'État et votre numéro RPPS dès l'en-tête.", "Listez les services où vous avez exercé : c'est le premier critère des cadres de santé.", "Précisez si vous acceptez la nuit, les week-ends ou les remplacements."],
  },
  {
    slug: 'commercial',
    metier: 'Commercial',
    intro: "Un CV de commercial se juge sur les résultats. Chiffre d'affaires réalisé, taux d'atteinte des objectifs, nombre de clients ou de rendez-vous : chaque expérience doit contenir au moins un chiffre, avec le type de clientèle (B2B, B2C) et le secteur.",
    exemple: {
      nom: 'Thomas Girard',
      titre: 'Commercial B2B – Services aux entreprises',
      ville: 'Bordeaux',
      accroche: "Commercial terrain depuis 5 ans en B2B, spécialisé dans la prospection et la négociation auprès des PME. 118 % de mon objectif annuel atteint en 2024, avec un portefeuille de 150 clients actifs.",
      experiences: [
        { poste: 'Commercial terrain', entreprise: 'Société de services aux entreprises, Bordeaux', periode: '2021 – aujourd’hui', missions: ['Prospection de PME : 15 rendez-vous qualifiés par semaine', 'Chiffre d’affaires annuel de 650 000 € (118 % de l’objectif)', 'Suivi du portefeuille dans le CRM'] },
        { poste: 'Conseiller commercial sédentaire', entreprise: 'Fournisseur d’énergie, Bordeaux', periode: '2019 – 2021', missions: ['Vente par téléphone et relances de devis', 'Fidélisation des clients professionnels', 'Meilleur vendeur de l’équipe sur 2 trimestres'] },
      ],
      formation: [{ diplome: 'BTS Négociation et digitalisation de la relation client', ecole: 'Lycée, Bordeaux', annee: '2019' }],
      langues: ['Anglais : professionnel (B2)', 'Permis B'],
    },
    competences: ['Prospection', 'Négociation', 'Closing', 'Gestion de portefeuille', 'CRM (Salesforce, HubSpot)', 'Élaboration de devis', 'Fidélisation', 'Reporting commercial'],
    qualites: ['Persévérance', 'Aisance relationnelle', 'Goût du challenge', 'Autonomie'],
    conseils: ["Donnez vos résultats en chiffres et en pourcentage d'objectif.", "Précisez la cible (PME, grands comptes, particuliers) et le secteur vendu.", "Mentionnez le permis B si le poste est itinérant."],
  },
  {
    slug: 'comptable',
    metier: 'Comptable',
    intro: "Le recruteur d'un comptable veut savoir jusqu'où vous allez dans le cycle comptable (saisie, rapprochements, clôtures, bilan), sur quels logiciels et pour quel type de structure. Ces trois éléments doivent figurer dans l'accroche et dans chaque expérience.",
    exemple: {
      nom: 'Julie Moreau',
      titre: 'Comptable générale – Clôtures et déclarations fiscales',
      ville: 'Lille',
      accroche: "Comptable générale avec 6 ans d'expérience en cabinet puis en entreprise. Autonome jusqu'au bilan, je gère les clôtures mensuelles et les déclarations de TVA sur Sage et Cegid.",
      experiences: [
        { poste: 'Comptable générale', entreprise: 'PME industrielle (120 salariés), Lille', periode: '2021 – aujourd’hui', missions: ['Clôtures mensuelles et annuelles jusqu’au bilan', 'Déclarations de TVA et liasse fiscale', 'Rapprochements bancaires et suivi de trésorerie'] },
        { poste: 'Collaboratrice comptable', entreprise: 'Cabinet d’expertise comptable, Roubaix', periode: '2018 – 2021', missions: ['Tenue d’un portefeuille de 40 dossiers TPE', 'Saisie, révision et préparation des bilans', 'Relation avec les clients et les administrations'] },
      ],
      formation: [{ diplome: 'DCG (Diplôme de comptabilité et de gestion)', ecole: 'Lycée, Lille', annee: '2018' }],
      langues: ['Anglais : intermédiaire (B1)'],
    },
    competences: ['Comptabilité générale', 'Clôtures et bilan', 'Déclarations de TVA', 'Rapprochements bancaires', 'Sage', 'Cegid', 'Excel (tableaux croisés)', 'Comptabilité fournisseurs et clients'],
    qualites: ['Rigueur', 'Discrétion', 'Organisation', 'Sens de l’analyse'],
    conseils: ["Indiquez jusqu'où vous êtes autonome : saisie, révision, bilan, liasse fiscale.", "Citez les logiciels maîtrisés (Sage, Cegid, Quadra, SAP) : c'est un filtre fréquent.", "Précisez la taille des structures ou le nombre de dossiers gérés."],
  },
  {
    slug: 'serveur',
    metier: 'Serveur',
    intro: "Un CV de serveur doit être court et concret : type d'établissement, nombre de couverts, outils de prise de commande et langues parlées. Les restaurateurs recrutent vite et lisent en quelques secondes ; mettez votre disponibilité en évidence.",
    exemple: {
      nom: 'Léa Dubois',
      titre: 'Serveuse en restauration traditionnelle',
      ville: 'Nice',
      accroche: "Serveuse depuis 4 ans en brasserie et restaurant traditionnel, habituée aux services de 150 couverts. Souriante et rapide, je parle anglais et italien avec la clientèle touristique.",
      experiences: [
        { poste: 'Serveuse', entreprise: 'Brasserie (150 couverts), Nice', periode: '2022 – aujourd’hui', missions: ['Accueil, prise de commande sur tablette et service', 'Conseil sur les vins et les plats du jour', 'Encaissement et clôture de caisse'] },
        { poste: 'Serveuse saisonnière', entreprise: 'Restaurant de plage, Antibes', periode: '2020 – 2022 (saisons)', missions: ['Service en terrasse à fort débit', 'Mise en place et dressage des tables', 'Préparation des boissons au bar'] },
      ],
      formation: [{ diplome: 'CAP Commercialisation et services en hôtel-café-restaurant', ecole: 'Lycée hôtelier, Nice', annee: '2020' }],
      langues: ['Anglais : courant', 'Italien : intermédiaire'],
    },
    competences: ['Service en salle', 'Prise de commande sur tablette', 'Conseil vins et accords', 'Encaissement', 'Mise en place', 'Service au bar', 'Règles d’hygiène (HACCP)', 'Gestion des réservations'],
    qualites: ['Sourire et amabilité', 'Rapidité', 'Résistance au stress', 'Esprit d’équipe'],
    conseils: ["Indiquez le nombre de couverts et le type d'établissement (brasserie, gastronomique, hôtel).", "Mettez vos langues en avant, surtout en zone touristique.", "Précisez vos disponibilités : coupures, soirées, week-ends, saison."],
  },
  {
    slug: 'aide-soignant',
    metier: 'Aide-soignant',
    intro: "Pour un poste d'aide-soignant, les recruteurs vérifient le diplôme d'État (DEAS), les services ou établissements connus (EHPAD, hôpital, domicile) et votre capacité à travailler en équipe et en horaires variables. La dimension humaine doit transparaître sans prendre le pas sur les compétences.",
    exemple: {
      nom: 'Nadia Robert',
      titre: 'Aide-soignante diplômée d’État – Gériatrie',
      ville: 'Montpellier',
      accroche: "Aide-soignante diplômée d'État avec 6 ans d'expérience en EHPAD et en service de soins de suite. Attentive au confort et à l'autonomie des résidents, habituée aux horaires en 12 heures.",
      experiences: [
        { poste: 'Aide-soignante', entreprise: 'EHPAD (90 résidents), Montpellier', periode: '2021 – aujourd’hui', missions: ['Soins d’hygiène et de confort, aide aux repas', 'Observation et transmissions dans le dossier de soins', 'Accompagnement des résidents atteints de troubles cognitifs'] },
        { poste: 'Aide-soignante', entreprise: 'Service de soins de suite, Sète', periode: '2018 – 2021', missions: ['Aide à la mobilisation et prévention des escarres', 'Prise des constantes', 'Participation aux projets d’animation'] },
      ],
      formation: [{ diplome: 'Diplôme d’État d’aide-soignant (DEAS)', ecole: 'IFAS, Montpellier', annee: '2018' }],
      langues: ['Espagnol : intermédiaire'],
    },
    competences: ['Soins d’hygiène et de confort', 'Prise des constantes', 'Prévention des escarres', 'Aide à la mobilité', 'Transmissions écrites et orales', 'Accompagnement de fin de vie', 'Hygiène et protocoles', 'Gestes et postures'],
    qualites: ['Bienveillance', 'Patience', 'Sens de l’observation', 'Travail en équipe'],
    conseils: ["Mettez le DEAS et son année d'obtention en avant.", "Précisez le type de public : personnes âgées, handicap, soins aigus.", "Indiquez les rythmes acceptés (12 h, nuit, week-end)."],
  },
  {
    slug: 'cuisinier',
    metier: 'Cuisinier',
    intro: "Un chef qui recrute un cuisinier regarde votre poste en brigade, le type de cuisine et le volume de couverts. Le CV doit aussi montrer la maîtrise des normes d'hygiène (HACCP) et votre capacité à tenir un poste en plein coup de feu.",
    exemple: {
      nom: 'Antoine Lambert',
      titre: 'Cuisinier – Chef de partie',
      ville: 'Paris',
      accroche: "Cuisinier depuis 6 ans en restauration traditionnelle et bistronomique, actuellement chef de partie chaud. Rigoureux sur les fiches techniques et les normes HACCP, à l'aise sur des services de 120 couverts.",
      experiences: [
        { poste: 'Chef de partie chaud', entreprise: 'Restaurant bistronomique, Paris 11e', periode: '2022 – aujourd’hui', missions: ['Responsable du poste viandes et sauces', 'Mise en place et respect des fiches techniques', 'Encadrement d’un commis'] },
        { poste: 'Commis de cuisine', entreprise: 'Brasserie (200 couverts), Paris 8e', periode: '2019 – 2022', missions: ['Préparations froides et chaudes', 'Réception et rangement des marchandises', 'Nettoyage selon le plan HACCP'] },
      ],
      formation: [{ diplome: 'CAP Cuisine', ecole: 'Lycée hôtelier, Paris', annee: '2019' }],
      langues: ['Anglais : notions'],
    },
    competences: ['Cuisine traditionnelle', 'Fiches techniques', 'Normes HACCP', 'Gestion des stocks', 'Dressage', 'Cuissons et sauces', 'Pâtisserie de base', 'Travail en brigade'],
    qualites: ['Rigueur', 'Résistance au stress', 'Créativité', 'Esprit d’équipe'],
    conseils: ["Précisez votre poste en brigade (commis, chef de partie, second).", "Indiquez le type de cuisine et le nombre de couverts par service.", "Mentionnez votre formation HACCP et sa date."],
  },
  {
    slug: 'agent-d-entretien',
    metier: "Agent d'entretien",
    intro: "Pour un poste d'agent d'entretien, le recruteur vérifie le type de locaux connus (bureaux, santé, hôtellerie), la maîtrise des produits et du matériel, et votre fiabilité. Un CV simple et précis, avec vos horaires possibles, fait la différence.",
    exemple: {
      nom: 'Fatou Diallo',
      titre: 'Agente d’entretien – Bureaux et milieu médical',
      ville: 'Strasbourg',
      accroche: "Agente d'entretien depuis 5 ans en bureaux et en clinique, formée aux protocoles d'hygiène en milieu sensible. Autonome sur mes secteurs, disponible tôt le matin et en soirée.",
      experiences: [
        { poste: 'Agente d’entretien', entreprise: 'Entreprise de propreté, Strasbourg', periode: '2021 – aujourd’hui', missions: ['Entretien de 1 500 m² de bureaux par jour', 'Utilisation d’une autolaveuse et d’une monobrosse', 'Gestion des produits et du réapprovisionnement'] },
        { poste: 'Agente de bio-nettoyage', entreprise: 'Clinique, Strasbourg', periode: '2019 – 2021', missions: ['Bio-nettoyage des chambres et des blocs', 'Respect des protocoles d’hygiène hospitalière', 'Traçabilité des interventions'] },
      ],
      formation: [{ diplome: 'CAP Agent de propreté et d’hygiène', ecole: 'Lycée professionnel, Strasbourg', annee: '2019' }],
      langues: ['Anglais : notions'],
    },
    competences: ['Entretien des locaux', 'Bio-nettoyage', 'Autolaveuse et monobrosse', 'Dosage des produits', 'Protocoles d’hygiène', 'Tri des déchets', 'Traçabilité', 'Gestion des consommables'],
    qualites: ['Fiabilité', 'Discrétion', 'Autonomie', 'Ponctualité'],
    conseils: ["Précisez les types de locaux entretenus (bureaux, hôpital, hôtel, école).", "Citez le matériel maîtrisé (autolaveuse, monobrosse).", "Indiquez vos horaires possibles : matin, soir, week-end."],
  },
  {
    slug: 'chauffeur-livreur',
    metier: 'Chauffeur-livreur',
    intro: "Un CV de chauffeur-livreur doit commencer par vos permis et habilitations (B, C, FIMO, FCO), puis montrer votre connaissance des tournées et votre fiabilité. Les recruteurs regardent aussi le nombre de points de livraison et l'absence d'incident.",
    exemple: {
      nom: 'Karim Rousseau',
      titre: 'Chauffeur-livreur – Permis B et C',
      ville: 'Rennes',
      accroche: "Chauffeur-livreur depuis 7 ans, titulaire des permis B et C et de la FCO à jour. Habitué aux tournées de 60 à 80 points de livraison, ponctuel et soigneux avec les clients.",
      experiences: [
        { poste: 'Chauffeur-livreur poids lourd', entreprise: 'Transporteur régional, Rennes', periode: '2021 – aujourd’hui', missions: ['Livraison des commerces de la région en porteur 19 t', 'Chargement et contrôle des marchandises', 'Aucun incident ni litige depuis 3 ans'] },
        { poste: 'Livreur colis (véhicule léger)', entreprise: 'Société de messagerie, Rennes', periode: '2017 – 2021', missions: ['Tournées de 70 colis par jour', 'Utilisation du terminal de livraison', 'Encaissement des contre-remboursements'] },
      ],
      formation: [{ diplome: 'Permis C + FIMO marchandises', ecole: 'Centre de formation transport, Rennes', annee: '2021' }],
      langues: ['Anglais : notions'],
    },
    competences: ['Permis B et C', 'FIMO / FCO', 'Optimisation de tournée', 'Chargement et arrimage', 'Terminal de livraison', 'Gestion des litiges', 'Hayon élévateur', 'Respect du code de la route'],
    qualites: ['Ponctualité', 'Sens de l’orientation', 'Courtoisie', 'Autonomie'],
    conseils: ["Placez les permis et la FCO (avec sa date de validité) en haut du CV.", "Indiquez le type de véhicule conduit et le nombre de points par tournée.", "Un bon historique de conduite (sans incident) est un vrai argument : dites-le."],
  },
  {
    slug: 'assistant-administratif',
    metier: 'Assistant administratif',
    intro: "Le CV d'un assistant administratif doit prouver votre organisation et votre polyvalence : gestion d'agenda, courriers, facturation, accueil. Précisez les outils maîtrisés (Pack Office, ERP) et le volume traité pour rendre ces tâches concrètes.",
    exemple: {
      nom: 'Émilie Fontaine',
      titre: 'Assistante administrative et commerciale',
      ville: 'Grenoble',
      accroche: "Assistante administrative depuis 5 ans en PME, polyvalente sur l'accueil, la facturation et le suivi des dossiers clients. Très à l'aise avec Excel et les logiciels de gestion.",
      experiences: [
        { poste: 'Assistante administrative et commerciale', entreprise: 'PME du bâtiment, Grenoble', periode: '2021 – aujourd’hui', missions: ['Saisie des devis et de 150 factures par mois', 'Gestion des agendas de 3 responsables', 'Suivi des relances clients et fournisseurs'] },
        { poste: 'Assistante d’accueil', entreprise: 'Agence immobilière, Grenoble', periode: '2019 – 2021', missions: ['Accueil physique et téléphonique', 'Rédaction des courriers et mise à jour des dossiers', 'Classement et archivage'] },
      ],
      formation: [{ diplome: 'BTS Support à l’action managériale', ecole: 'Lycée, Grenoble', annee: '2019' }],
      langues: ['Anglais : intermédiaire (B1)'],
    },
    competences: ['Pack Office (Word, Excel, Outlook)', 'Facturation', 'Gestion d’agenda', 'Accueil physique et téléphonique', 'Rédaction de courriers', 'Classement et archivage', 'Logiciel de gestion (ERP)', 'Suivi des relances'],
    qualites: ['Organisation', 'Polyvalence', 'Discrétion', 'Sens du service'],
    conseils: ["Chiffrez votre activité : factures par mois, personnes assistées, appels par jour.", "Précisez votre niveau sur Excel (formules, tableaux croisés dynamiques).", "Adaptez l'intitulé (administratif, commercial, RH) à celui de l'offre."],
  },
  {
    slug: 'caissier',
    metier: 'Caissier',
    intro: "Pour un poste de caissier, le recruteur cherche la fiabilité dans la manipulation d'argent, la rapidité et l'amabilité. Mentionnez le type de magasin, le volume de clients et votre disponibilité, notamment le week-end.",
    exemple: {
      nom: 'Inès Garcia',
      titre: 'Hôtesse de caisse en grande surface',
      ville: 'Toulon',
      accroche: "Hôtesse de caisse depuis 3 ans en hypermarché, rapide et souriante, sans écart de caisse. Disponible en soirée et le week-end.",
      experiences: [
        { poste: 'Hôtesse de caisse', entreprise: 'Hypermarché, Toulon', periode: '2022 – aujourd’hui', missions: ['Encaissement de 300 clients par jour en moyenne', 'Gestion des moyens de paiement et du fond de caisse', 'Accueil et renseignement des clients'] },
        { poste: 'Employée libre-service (job étudiant)', entreprise: 'Supermarché, La Seyne-sur-Mer', periode: '2021 – 2022', missions: ['Mise en rayon et facing', 'Contrôle des dates de péremption', 'Renfort en caisse'] },
      ],
      formation: [{ diplome: 'Bac pro Métiers de l’accueil', ecole: 'Lycée professionnel, Toulon', annee: '2021' }],
      langues: ['Anglais : notions'],
    },
    competences: ['Encaissement', 'Gestion du fond de caisse', 'Moyens de paiement', 'Caisse automatique', 'Accueil client', 'Mise en rayon', 'Gestion des retours', 'Programme de fidélité'],
    qualites: ['Fiabilité', 'Amabilité', 'Rapidité', 'Résistance au stress'],
    conseils: ["Indiquez l'absence d'écart de caisse : c'est un vrai gage de confiance.", "Précisez le type de magasin et le volume de clients par jour.", "Mettez vos disponibilités (soirées, week-ends) bien en évidence."],
  },
  {
    slug: 'cariste',
    metier: 'Cariste',
    intro: "Un recruteur qui cherche un cariste regarde d'abord les CACES et leurs catégories, puis le type d'entrepôt et les engins conduits. Votre CV doit aussi montrer votre attention à la sécurité et votre précision au stockage.",
    exemple: {
      nom: 'Julien Mercier',
      titre: 'Cariste – CACES R489 cat. 1, 3 et 5',
      ville: 'Reims',
      accroche: "Cariste depuis 6 ans en entrepôt de grande distribution, titulaire des CACES R489 1, 3 et 5. Précis au stockage en hauteur, attentif à la sécurité et aux procédures.",
      experiences: [
        { poste: 'Cariste', entreprise: 'Entrepôt de grande distribution, Reims', periode: '2020 – aujourd’hui', missions: ['Mise en stock et déstockage jusqu’à 10 m de hauteur', 'Chargement de 15 camions par poste', 'Inventaires tournants sur terminal'] },
        { poste: 'Cariste (intérim)', entreprise: 'Industrie agroalimentaire, Châlons-en-Champagne', periode: '2018 – 2020', missions: ['Approvisionnement des lignes de production', 'Réception et contrôle des palettes', 'Respect des règles d’hygiène alimentaire'] },
      ],
      formation: [{ diplome: 'CACES R489 catégories 1, 3 et 5', ecole: 'Organisme de formation, Reims', annee: '2023 (renouvellement)' }],
      langues: [],
    },
    competences: ['CACES R489 cat. 1, 3 et 5', 'Stockage en hauteur', 'Chargement / déchargement', 'Gestion des emplacements (WMS)', 'Inventaire', 'Contrôle des marchandises', 'Règles de sécurité', 'Terminal radio'],
    qualites: ['Précision', 'Vigilance', 'Fiabilité', 'Esprit d’équipe'],
    conseils: ["Indiquez toutes vos catégories de CACES et leur date de validité.", "Précisez le type d'engins et la hauteur de stockage maîtrisée.", "Mentionnez les logiciels de gestion d'entrepôt (WMS) utilisés."],
  },
  {
    slug: 'electricien',
    metier: 'Électricien',
    intro: "Le CV d'un électricien doit indiquer clairement votre domaine (bâtiment, industriel, tertiaire), vos habilitations électriques et les types de chantiers réalisés. Les recruteurs du BTP lisent en priorité les habilitations et l'autonomie sur chantier.",
    exemple: {
      nom: 'Romain Faure',
      titre: 'Électricien bâtiment – Habilitations B2V / BR',
      ville: 'Rouen',
      accroche: "Électricien depuis 7 ans en construction neuve et rénovation, titulaire des habilitations B2V, BR et BC. Autonome sur chantier, de la lecture de plans à la mise en service.",
      experiences: [
        { poste: 'Électricien chef d’équipe', entreprise: 'Entreprise d’électricité générale, Rouen', periode: '2021 – aujourd’hui', missions: ['Installation complète de logements collectifs', 'Pose de tableaux, câblage et raccordements', 'Encadrement de 2 apprentis'] },
        { poste: 'Électricien', entreprise: 'Artisan électricien, Le Havre', periode: '2017 – 2021', missions: ['Rénovation électrique chez les particuliers', 'Mise aux normes NF C 15-100', 'Diagnostic et dépannage'] },
      ],
      formation: [{ diplome: 'Bac pro Métiers de l’électricité et de ses environnements connectés', ecole: 'Lycée professionnel, Rouen', annee: '2017' }],
      langues: ['Permis B'],
    },
    competences: ['Habilitations B2V, BR, BC', 'Norme NF C 15-100', 'Lecture de plans et schémas', 'Câblage et raccordement', 'Pose de tableaux électriques', 'Diagnostic et dépannage', 'Courants faibles', 'Mise en service'],
    qualites: ['Rigueur', 'Autonomie', 'Respect de la sécurité', 'Sens du travail bien fait'],
    conseils: ["Mettez vos habilitations électriques et leur date de recyclage en évidence.", "Précisez le domaine : bâtiment, tertiaire, industriel ou maintenance.", "Indiquez votre permis B si les chantiers sont mobiles."],
  },
  {
    slug: 'auxiliaire-de-vie',
    metier: 'Auxiliaire de vie',
    intro: "Pour un poste d'auxiliaire de vie, les recruteurs vérifient votre expérience à domicile ou en établissement, les publics accompagnés et vos diplômes (DEAES, ADVF). Le permis et le véhicule sont souvent indispensables pour les interventions à domicile.",
    exemple: {
      nom: 'Sophie Chevalier',
      titre: 'Auxiliaire de vie à domicile – Titre ADVF',
      ville: 'Paris',
      accroche: "Auxiliaire de vie depuis 5 ans auprès de personnes âgées et en situation de handicap, titulaire du titre ADVF. Patiente et organisée, j'interviens chez 6 à 8 bénéficiaires par jour.",
      experiences: [
        { poste: 'Auxiliaire de vie', entreprise: 'Service d’aide à domicile, Paris', periode: '2021 – aujourd’hui', missions: ['Aide à la toilette, à l’habillage et aux repas', 'Entretien du logement et courses', 'Transmissions avec la famille et l’équipe soignante'] },
        { poste: 'Aide à domicile', entreprise: 'Association d’aide à la personne, Montreuil', periode: '2019 – 2021', missions: ['Accompagnement aux rendez-vous médicaux', 'Stimulation et activités de maintien de l’autonomie', 'Préparation des repas adaptés'] },
      ],
      formation: [{ diplome: 'Titre professionnel Assistant de vie aux familles (ADVF)', ecole: 'Organisme de formation, Paris', annee: '2019' }],
      langues: ['Permis B et véhicule'],
    },
    competences: ['Aide à la toilette et à l’habillage', 'Préparation des repas', 'Aide à la mobilité', 'Entretien du logement', 'Maintien de l’autonomie', 'Transmissions', 'Gestes de premiers secours', 'Accompagnement Alzheimer'],
    qualites: ['Bienveillance', 'Patience', 'Discrétion', 'Ponctualité'],
    conseils: ["Précisez les publics accompagnés (personnes âgées, handicap, Alzheimer).", "Indiquez votre permis et si vous avez un véhicule.", "Mettez votre diplôme (ADVF, DEAES) et vos formations aux premiers secours."],
  },
  {
    slug: 'agent-de-securite',
    metier: 'Agent de sécurité',
    intro: "Le CV d'un agent de sécurité doit afficher votre carte professionnelle (CNAPS), vos qualifications (SSIAP, SST) et les sites où vous avez travaillé. Les recruteurs vérifient ces habilitations avant tout le reste.",
    exemple: {
      nom: 'Moussa Traoré',
      titre: 'Agent de sécurité – SSIAP 1 et carte CNAPS',
      ville: 'Marseille',
      accroche: "Agent de sécurité depuis 6 ans, titulaire de la carte professionnelle CNAPS, du SSIAP 1 et du SST. Expérimenté en surveillance de sites commerciaux et en sécurité incendie.",
      experiences: [
        { poste: 'Agent de sécurité incendie (SSIAP 1)', entreprise: 'Centre commercial, Marseille', periode: '2021 – aujourd’hui', missions: ['Rondes de prévention et contrôle des installations incendie', 'Gestion du poste de sécurité et de la vidéosurveillance', 'Intervention et assistance aux personnes'] },
        { poste: 'Agent de prévention et de sécurité', entreprise: 'Société de sécurité privée, Aix-en-Provence', periode: '2018 – 2021', missions: ['Filtrage des accès et contrôle des badges', 'Rédaction des mains courantes', 'Surveillance d’événements'] },
      ],
      formation: [{ diplome: 'SSIAP 1 et CQP Agent de prévention et de sécurité', ecole: 'Centre de formation, Marseille', annee: '2018' }],
      langues: ['Anglais : notions'],
    },
    competences: ['Carte professionnelle CNAPS', 'SSIAP 1', 'SST (sauveteur secouriste)', 'Rondes et surveillance', 'Vidéosurveillance', 'Contrôle d’accès', 'Main courante', 'Gestion des conflits'],
    qualites: ['Vigilance', 'Sang-froid', 'Discrétion', 'Sens des responsabilités'],
    conseils: ["Indiquez le numéro et la date de validité de votre carte CNAPS.", "Listez SSIAP, SST et leur date de recyclage.", "Précisez les types de sites surveillés (commerce, industrie, événementiel)."],
  },
  {
    slug: 'conseiller-clientele',
    metier: 'Conseiller clientèle',
    intro: "Un CV de conseiller clientèle doit montrer votre aisance au téléphone ou en agence, vos résultats (satisfaction, ventes additionnelles) et les outils utilisés. Les recruteurs de centres de relation client regardent aussi votre capacité à gérer un volume d'appels.",
    exemple: {
      nom: 'Clara Bonnet',
      titre: 'Conseillère clientèle – Relation client multicanal',
      ville: 'Lille',
      accroche: "Conseillère clientèle depuis 4 ans en centre de relation client, sur téléphone, e-mail et chat. Taux de satisfaction client de 92 % et plusieurs fois meilleure vendeuse de l'équipe en ventes additionnelles.",
      experiences: [
        { poste: 'Conseillère clientèle', entreprise: 'Opérateur télécom, Lille', periode: '2022 – aujourd’hui', missions: ['Traitement de 60 appels par jour (assistance et vente)', '92 % de clients satisfaits', 'Gestion des réclamations sur l’outil CRM'] },
        { poste: 'Téléconseillère', entreprise: 'Centre de relation client, Villeneuve-d’Ascq', periode: '2020 – 2022', missions: ['Réponse aux demandes par e-mail et chat', 'Prise de rendez-vous et relances', 'Mise à jour des dossiers clients'] },
      ],
      formation: [{ diplome: 'BTS Négociation et digitalisation de la relation client', ecole: 'Lycée, Lille', annee: '2020' }],
      langues: ['Anglais : intermédiaire (B1)'],
    },
    competences: ['Relation client multicanal', 'Traitement des réclamations', 'Vente additionnelle', 'Outils CRM', 'Écoute active', 'Gestion des appels entrants', 'Saisie rapide', 'Suivi de dossiers'],
    qualites: ['Patience', 'Aisance à l’oral', 'Empathie', 'Résistance au stress'],
    conseils: ["Donnez vos indicateurs : appels par jour, satisfaction, ventes réalisées.", "Précisez les canaux maîtrisés (téléphone, e-mail, chat, agence).", "Citez les outils CRM utilisés."],
  },
  {
    slug: 'charge-de-marketing',
    metier: 'Chargé de marketing',
    intro: "Le recruteur d'un chargé de marketing cherche des campagnes concrètes et leurs résultats : trafic, leads, taux de conversion. Votre CV doit associer chaque outil (Google Ads, CRM, emailing) à un résultat mesurable.",
    exemple: {
      nom: 'Manon Roux',
      titre: 'Chargée de marketing digital',
      ville: 'Nantes',
      accroche: "Chargée de marketing digital avec 4 ans d'expérience en acquisition et en emailing. J'ai fait progresser de 40 % les leads entrants de mon entreprise en un an grâce au SEO et aux campagnes Google Ads.",
      experiences: [
        { poste: 'Chargée de marketing digital', entreprise: 'Éditeur de logiciels, Nantes', periode: '2022 – aujourd’hui', missions: ['Campagnes Google Ads et LinkedIn : +40 % de leads en un an', 'Stratégie de contenu et SEO', 'Automatisation de l’emailing et suivi des conversions'] },
        { poste: 'Assistante marketing', entreprise: 'Enseigne de distribution, Angers', periode: '2020 – 2022', missions: ['Animation des réseaux sociaux', 'Création de supports avec Canva', 'Suivi des indicateurs dans Google Analytics'] },
      ],
      formation: [{ diplome: 'Master Marketing digital', ecole: 'École de commerce, Nantes', annee: '2020' }],
      langues: ['Anglais : professionnel (B2)'],
    },
    competences: ['Google Ads', 'SEO', 'Emailing et automatisation', 'Google Analytics', 'Réseaux sociaux', 'CRM (HubSpot)', 'Création de contenu', 'Analyse de données'],
    qualites: ['Créativité', 'Esprit d’analyse', 'Curiosité', 'Organisation'],
    conseils: ["Associez chaque campagne à un résultat chiffré (leads, ventes, trafic).", "Citez les outils exacts de l'offre : ce sont des mots-clés pour les logiciels de tri.", "Ajoutez un lien vers un portfolio ou des réalisations si vous en avez."],
  },
  {
    slug: 'manutentionnaire',
    metier: 'Manutentionnaire',
    intro: "Pour un poste de manutentionnaire, le recruteur cherche avant tout fiabilité, endurance et respect des consignes de sécurité. Un CV court, qui cite les tâches maîtrisées et vos habilitations éventuelles, suffit à convaincre.",
    exemple: {
      nom: 'Kevin Blanc',
      titre: 'Manutentionnaire polyvalent',
      ville: 'Lyon',
      accroche: "Manutentionnaire depuis 4 ans en entrepôt et sur des plateformes de distribution. Fiable et endurant, j'applique les règles de sécurité et je suis disponible en horaires décalés.",
      experiences: [
        { poste: 'Manutentionnaire', entreprise: 'Plateforme de distribution, Saint-Priest', periode: '2022 – aujourd’hui', missions: ['Déchargement de conteneurs et tri des colis', 'Utilisation du transpalette électrique', 'Préparation et filmage des palettes'] },
        { poste: 'Manutentionnaire (intérim)', entreprise: 'Société de déménagement, Lyon', periode: '2020 – 2022', missions: ['Port de charges et protection du mobilier', 'Chargement des camions', 'Montage et démontage de meubles'] },
      ],
      formation: [{ diplome: 'CAP Agent d’entreposage et de messagerie', ecole: 'Lycée professionnel, Lyon', annee: '2020' }],
      langues: [],
    },
    competences: ['Port de charges', 'Transpalette électrique', 'Chargement et déchargement', 'Tri des colis', 'Filmage de palettes', 'Gestes et postures', 'Respect des consignes de sécurité', 'Inventaire'],
    qualites: ['Endurance', 'Fiabilité', 'Ponctualité', 'Esprit d’équipe'],
    conseils: ["Citez le matériel utilisé (transpalette, gerbeur) et vos CACES si vous en avez.", "Précisez vos disponibilités : horaires décalés, nuit, week-end.", "Restez court : une page claire suffit pour ce métier."],
  },
]

export function findModele(slug: string): ModeleCv | undefined {
  return MODELES_CV.find(m => m.slug === slug)
}
