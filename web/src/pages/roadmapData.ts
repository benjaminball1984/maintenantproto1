export type RoadmapItemStatus = 'done' | 'in-progress' | 'planned';

export interface RoadmapItemDef {
  /** Identifiant stable utilisé pour `key` + `data-testid`. */
  id: string;
  /** Date / période (ex. « 2026 T2 », « 2027 »). */
  date: string;
  /** Titre court du jalon. */
  title: string;
  /** Description longue (1-2 phrases). */
  description: string;
  /** Statut du jalon — détermine l'icône + la couleur. */
  status: RoadmapItemStatus;
}

// Ordre chronologique strict (les tests vérifient cet ordre).
export const ROADMAP_ITEMS: RoadmapItemDef[] = [
  {
    id: 'launch-public',
    date: '2026 T2',
    title: 'Lancement public',
    description:
      'Mise en service publique de la plateforme — premiers adhérent·es T99CP, ouverture du média militant.',
    status: 'done',
  },
  {
    id: 'editorial-pages',
    date: '2026 T3',
    title: 'Pages éditoriales & onboarding',
    description:
      'FAQ, À propos, Roadmap publique, onboarding première visite. Toast notifications et loading skeletons.',
    status: 'in-progress',
  },
  {
    id: 'communes-libres-50',
    date: '2026 T4',
    title: '50 communes libres actives',
    description:
      'Atteinte du seuil de 50 communes libres dans l’hexagone et outre-mer, première AG associative annuelle.',
    status: 'planned',
  },
  {
    id: 'open-data',
    date: '2027 T1',
    title: 'API publique transparence',
    description:
      'Open data complet des compteurs publics via API REST authentifiée — pour journalistes, chercheur·es, ONG.',
    status: 'planned',
  },
  {
    id: 'eu-federation',
    date: '2027 T3',
    title: 'Fédération de communes européennes',
    description:
      'Ouverture multilingue (FR / DE / ES / IT) et fédération des collectifs militants européens.',
    status: 'planned',
  },
  {
    id: 'pacte-citoyen',
    date: '2028',
    title: 'Pacte citoyen national',
    description:
      'Co-construction d’un pacte politique via les pétitions / mobilisations à fort impact, présenté à l’élection.',
    status: 'planned',
  },
];
