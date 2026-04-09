export interface BirdCollection {
  id: string;
  name: string;
  description: string;
  icon: string;
  slugs: string[];
}

export interface CustomCollection {
  id: string;
  name: string;
  slugs: string[];
}

export const ACTIVE_COLLECTION_KEY = 'nasiptaci-active-collection';
export const CUSTOM_COLLECTIONS_KEY = 'nasiptaci-custom-collections';

export type ActiveCollection =
  | { type: 'all' }
  | { type: 'predefined'; id: string }
  | { type: 'custom'; id: string }
  | { type: 'manual' };

export const predefinedCollections: BirdCollection[] = [
  {
    id: 'bezni',
    name: 'Běžní ptáci',
    description: 'Nejčastější ptáci českých zahrad a parků',
    icon: '🐦',
    slugs: [
      'sykora-konadra',
      'kos-cerny',
      'penkava-obecna',
      'sykora-modrinka',
      'spacek-obecny',
      'vrabec-polni',
      'vrabec-domaci',
      'cervenka-obecna',
      'zvonek-zeleny',
      'straka-obecna',
      'sojka-obecna',
      'holub-hrivnac',
      'strakapoud-velky',
      'brhlik-lesni',
      'strizlik-obecny',
      'konipas-bily',
      'strnad-obecny',
      'rehek-domaci',
      'rehek-zahradni',
      'hrdlicka-zahradni',
      'kukacka-obecna',
      'drozd-zpevny',
      'kachna-divoka',
      'hyl-obecny',
      'skrivan-polni',
      'vlastovka-obecna',
      'jiricka-obecna',
      'havran-polni',
      'vrana-obecna',
      'bazant-obecny',
    ],
  },
  {
    id: 'dravci',
    name: 'Dravci a sokoli',
    description: 'Dravci (Accipitriformes) a sokoli (Falconiformes)',
    icon: '🦅',
    slugs: [
      // Accipitriformes
      'kane-belochvosta-2',
      'kane-lesni',
      'kane-rousna',
      'krahujec-obecny',
      'lunak-cerveny',
      'lunak-hnedy',
      '397', // Moták lužní
      'motak-pilich',
      'motak-pochop',
      'orel-kriklavy',
      'orel-morsky',
      'vcelojed-lesni',
      'orlovec-ricni',
      'orel-skalni',
      'orel-kralovsky-2',
      // Falconiformes
      'postolka-obecna',
      'sokol-stehovavy',
      'postolka-rudonoha',
      'raroh-velky',
      'dremlik-tundrovy',
      'ostriz-lesni',
    ],
  },
  {
    id: 'sovy',
    name: 'Sovy',
    description: 'Všechny sovy (Strigiformes)',
    icon: '🦉',
    slugs: [
      'kalous-pustovka',
      'kalous-usaty',
      'kulisek-nejmensi',
      'pustik-obecny',
      'sova-palena',
      'syc-rousny',
      'sycek-obecny',
      'vyr-velky',
    ],
  },
  {
    id: 'vodni',
    name: 'Vodní ptáci',
    description: 'Kachny, husy, potápky a další vodní ptáci',
    icon: '🦆',
    slugs: [
      // Anseriformes
      'cirka-modra',
      'hohol-severni',
      'husa-velka',
      'husice-lisci-2',
      'husice-nilska',
      'husice-rezava-2',
      'kachna-divoka',
      'polak-chocholacka',
      'polak-velky',
      'zrzohlavka-rudozoba',
      'labut-velka',
      // Podicipediformes
      'potapka-cernokrka',
      'potapka-mala',
      'potapka-rohac',
      'potapka-rudokrka',
      'potapka-zlutoroha',
      // Gaviiformes
      'potaplice-severni',
      // Related
      'lyska-cerna',
    ],
  },
];
