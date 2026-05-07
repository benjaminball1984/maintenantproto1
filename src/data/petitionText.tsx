import type { ReactNode } from 'react';

export type PetitionSection = {
  id: string;
  title: string;
  appel?: boolean;
  body: ReactNode;
};

export const petitionIntro = (
  <>
    <p>
      Chaque jour, dans les écoles, les collèges et les lycées de notre pays, des millions
      d'enfants prennent un repas dont on sait qu'il les expose à des substances que la
      science accuse depuis des années. Et chaque jour, l'État et trop de collectivités
      regardent ailleurs.
    </p>
    <p className="text-xl md:text-2xl font-semibold text-bca-green-dark">
      Cela suffit. Nos enfants ne sont pas une variable d'ajustement.
    </p>
  </>
);

export const petitionRecipients =
  'Adressée au gouvernement, aux député·es, aux maires, aux conseils départementaux et aux conseils régionaux';

export const petitionSections: PetitionSection[] = [
  {
    id: 'science',
    title: 'Ce que dit la science',
    body: (
      <>
        <p>
          L'expertise collective de l'<strong>INSERM</strong> publiée en 2021 établit une
          présomption forte de lien entre l'exposition aux pesticides chez l'enfant et la
          survenue de cancers pédiatriques, en particulier les leucémies et les tumeurs du
          système nerveux central. Pour certains insecticides, la présomption forte porte
          aussi sur des troubles du développement neuropsychologique et moteur.
        </p>
        <p>
          Or les enfants vont à la cantine très tôt — dès la maternelle, souvent dès trois
          ans, parfois plus tôt encore. Sur ces tout-petits, dont les barrières
          physiologiques sont immatures et dont les cellules sont en multiplication
          intense, les pesticides agissent davantage. C'est pendant ces années-là que
          l'exposition pèse le plus lourd, et que ce qu'on met dans leur assiette compte
          le plus.
        </p>
        <p>
          L'étude <strong>PestiRiv</strong>, publiée en 2025 par Santé publique France et
          l'ANSES, confirme que vivre près des cultures expose davantage. L'étude{' '}
          <strong>Esteban</strong> établit l'imprégnation de la population générale,
          enfants compris.
        </p>
        <p className="text-lg font-semibold text-bca-green-dark">
          Les preuves sont là. Le doute n'est plus permis. Ce qu'il manque, c'est le
          courage politique.
        </p>
      </>
    ),
  },
  {
    id: 'loi',
    title: "La loi est claire. Elle n'est pas respectée.",
    body: (
      <>
        <p>
          La loi <strong>EGalim</strong> (30 octobre 2018), complétée par la loi{' '}
          <strong>Climat et Résilience</strong> (22 août 2021), oblige depuis le{' '}
          <strong>1er janvier 2022</strong> toutes les cantines scolaires, universitaires,
          hospitalières et médico-sociales à proposer au moins{' '}
          <strong>50 % de produits durables et de qualité</strong>, dont{' '}
          <strong>20 % issus de l'agriculture biologique</strong>. Sept ans plus tard,
          c'est encore largement lettre morte.
        </p>
        <p>
          Selon l'enquête de l'Association des maires de France (2024), seules{' '}
          <strong>18 % des communes</strong> respectent les deux seuils. Sur la plateforme
          gouvernementale Ma cantine, les taux moyens en 2022 plafonnaient à{' '}
          <strong>27,5 %</strong> de produits durables et <strong>13,1 %</strong> de bio.
          La loi ne prévoit aucune sanction. Et pendant ce temps, nos enfants mangent.
        </p>
      </>
    ),
  },
  {
    id: 'cantine',
    title: "La cantine qu'on veut pour nos enfants",
    body: (
      <>
        <p>
          Nos enfants ne méritent pas seulement « moins pire ». Ils méritent le meilleur.
          Une cantine digne de ce nom, c'est une cantine{' '}
          <strong>
            bio, gratuite, équitable, conviviale, faite maison, avec des produits locaux
            et de saison, saine, équilibrée, à moindre impact environnemental — et bonne.
          </strong>{' '}
          Oui, bonne, parce qu'il est temps de se rappeler qu'un repas se mange aussi avec
          plaisir.
        </p>
        <p>
          Cela fait des décennies que la fabrication des repas scolaires a été
          déshumanisée par les grands groupes de la restauration collective, qui livrent
          des plats fades, surgelés, ultra-transformés, expédiés de très loin et servis
          sans âme. Ce modèle est un échec sanitaire, écologique, social et culturel. Il
          faut le quitter.
        </p>
        <p>
          Une cuisine faite sur place, par des cuisinier·es payé·es dignement, avec des
          aliments produits par des paysannes et paysans bio du territoire : c'est cela,
          une vraie cantine. Une cantine qui apprend aux enfants le vrai goût des
          aliments, qui les aide à apprendre, à grandir, à être en bonne santé. Bien
          manger n'est pas un luxe : c'est la base. Et la santé, l'apprentissage et
          l'éveil au goût se construisent dans l'enfance ou jamais.
        </p>
      </>
    ),
  },
  {
    id: 'soutien',
    title: 'Bon pour les enfants, la planète, les paysannes et paysans',
    body: (
      <>
        <p>
          Une cantine bio, locale, équitable et de saison ne s'oppose pas à celles et ceux
          qui font notre nourriture : elle les soutient. Elle leur permet d'être justement
          rémunéré·es pour un travail trop souvent étranglé par un système agro-industriel
          qui les paie sous le coût de production. Choisir le bio local et équitable dans
          les cantines publiques, c'est garantir un revenu paysan digne, c'est faire vivre
          les fermes du territoire, c'est arrêter de subventionner avec l'argent public un
          modèle qui détruit les sols, l'eau, l'air et la santé.
        </p>
        <p>
          Comme l'a affirmé l'<strong>Appel de Lorient</strong> en octobre 2024, signé par
          Bio Consom'acteurs et plus de 220 organisations, la bio coûte moins cher à la
          collectivité que l'agriculture industrielle, dont les coûts cachés —
          dépollution de l'eau, soins de santé, biodiversité détruite — sont massifs et
          payés par les contribuables.
        </p>
      </>
    ),
  },
  {
    id: 'demandes',
    title: 'Nos demandes',
    appel: true,
    body: (
      <>
        <p>
          Aux élu·es et responsables politiques, à toutes les échelles — État, Parlement,
          régions, départements, communes — qui ont, chacun·e dans le périmètre de leurs
          compétences, la responsabilité directe ou indirecte des cantines de nos enfants,
          nous demandons un engagement public, immédiat et chiffré sur les mesures
          suivantes :
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-3">
          <li>
            <strong>Respecter immédiatement</strong>, dans toutes les cantines scolaires
            (de la maternelle au lycée) et de la petite enfance, l'obligation légale de la
            loi EGalim — 50 % de produits durables et de qualité dont 20 % issus de
            l'agriculture biologique — et publier une trajectoire vers 100 % bio à
            horizon précisé&nbsp;;
          </li>
          <li>
            Revenir à une <strong>cuisine faite sur place</strong> dans les cantines, avec
            des cuisinier·es formé·es et dignement rémunéré·es, plutôt que de déléguer à
            des grands groupes industriels&nbsp;;
          </li>
          <li>
            Privilégier l'<strong>achat direct, local et de saison</strong> auprès des
            paysannes et paysans bio du territoire, garantir des prix qui couvrent les
            coûts de production et assurent un revenu paysan digne&nbsp;;
          </li>
          <li>
            Proposer chaque jour une <strong>alternative végétarienne</strong> et réduire
            la part des produits carnés et d'origine animale, pour la santé des enfants et
            pour l'environnement&nbsp;;
          </li>
          <li>
            <strong>Réduire drastiquement les déchets</strong>, le plastique et le
            gaspillage alimentaire, et bannir les contenants plastiques de cuisson, de
            réchauffe et de service&nbsp;;
          </li>
          <li>
            Garantir progressivement la <strong>gratuité de la cantine</strong> pour
            toutes les familles, en commençant par les familles aux revenus les plus
            modestes, dans la perspective d'une véritable sécurité sociale de
            l'alimentation&nbsp;;
          </li>
          <li>
            <strong>Interdire l'usage de pesticides de synthèse</strong> dans tous les
            espaces publics, en particulier autour des crèches, des écoles et des lieux
            fréquentés par les enfants&nbsp;;
          </li>
          <li>
            <strong>Renforcer la loi EGalim</strong> en prévoyant des sanctions effectives
            en cas de non-respect, et donner aux collectivités les moyens financiers et
            humains nécessaires à son application&nbsp;;
          </li>
          <li>
            Publier chaque année un <strong>bilan public, détaillé et accessible</strong>,
            de la composition des repas servis et de l'avancement des engagements pris.
          </li>
        </ol>
      </>
    ),
  },
  {
    id: 'determines',
    title: 'Nous sommes déterminé·es',
    body: (
      <>
        <p>
          Parce que nos enfants ne paieront pas, dans leur santé, le prix d'un système
          agricole et alimentaire que la science alerte, que la loi tente de corriger, et
          que la société civile dénonce depuis des décennies.
        </p>
        <p>
          Parce que les paysannes et paysans qui font le choix de la bio méritent un
          soutien à la hauteur de ce qu'ils apportent — à la santé publique, à
          l'environnement, aux territoires.
        </p>
        <p>
          Parce qu'il est entre les mains des élu·es, à chaque échelon, de transformer
          concrètement la cantine de nos enfants — sans attendre.
        </p>
        <p className="text-lg font-semibold text-bca-green-dark">
          Nous serons attentif·ves, attentives, à vos décisions, à leur calendrier, et à
          leurs effets concrets dans nos écoles, nos collèges, nos lycées et nos
          territoires.
        </p>
      </>
    ),
  },
];

export const petitionReferences = (
  <p className="text-sm italic text-ink-muted leading-relaxed">
    INSERM, expertise collective <em>Pesticides et santé — Nouvelles données</em>, juin
    2021. Santé publique France, étude <em>Esteban</em> (programme national de
    biosurveillance). Santé publique France et ANSES, étude <em>PestiRiv</em>, septembre
    2025. Loi n° 2018-938 du 30 octobre 2018 (EGalim) ; loi n° 2021-1104 du 22 août 2021
    (Climat et Résilience). Enquête Association des maires de France, restauration
    scolaire, 2024. Plateforme gouvernementale <em>Ma cantine</em>. Appel de Lorient — la
    Bio pour la Vie, 20 octobre 2024.
  </p>
);
