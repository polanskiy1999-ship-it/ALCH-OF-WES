export type Category =
  | "Все"
  | "Букеты"
  | "Цветы"
  | "Подарки"
  | "Для дома"
  | "Необычные";

export type Piece = {
  id: string;
  title: string;
  type: Exclude<Category, "Все">;
  detail: string;
  images: string[];
  focal?: string;
};

export const categories: Category[] = [
  "Все",
  "Букеты",
  "Цветы",
  "Подарки",
  "Для дома",
  "Необычные",
];

export const pieces: Piece[] = [
  {
    id: "first-light",
    title: "Первый свет",
    type: "Букеты",
    detail: "Букет свечей-тюльпанов",
    images: [
      "/images/tulip-grand-wide.jpg",
      "/images/tulip-grand-portrait.jpg",
    ],
  },
  {
    id: "quiet-dawn",
    title: "Тихий рассвет",
    type: "Букеты",
    detail: "Мини-букет тюльпанов",
    images: [
      "/images/tulip-pink-wrap-top.jpg",
      "/images/tulip-pink-wrap-kraft.jpg",
      "/images/tulip-pink-wrap-long.jpg",
    ],
  },
  {
    id: "spring-spectrum",
    title: "Весенний спектр",
    type: "Букеты",
    detail: "Композиция из тюльпанов",
    images: [
      "/images/tulip-spectrum-vase.jpg",
      "/images/tulip-spectrum-dark.jpg",
      "/images/tulip-spectrum-close.jpg",
    ],
  },
  {
    id: "golden-tulips",
    title: "Золотые тюльпаны",
    type: "Букеты",
    detail: "Букет свечей-тюльпанов",
    images: [
      "/images/tulip-yellow-flat.jpg",
      "/images/tulip-yellow-wrap.jpg",
      "/images/tulip-yellow-evening.jpg",
    ],
  },
  {
    id: "honey-sun",
    title: "Медовое солнце",
    type: "Цветы",
    detail: "Свечи-одуванчики",
    images: [
      "/images/dandelion-stems.jpg",
      "/images/dandelion-hand.jpg",
    ],
  },
  {
    id: "three-roses",
    title: "Три розы",
    type: "Цветы",
    detail: "Свечи-цветы",
    images: [
      "/images/rose-trio-pedestal.jpg",
      "/images/rose-trio-flat.jpg",
    ],
  },
  {
    id: "sun-crystal",
    title: "Солнечный кристалл",
    type: "Цветы",
    detail: "Свеча-цветок",
    images: ["/images/crystal-flower.jpg"],
  },
  {
    id: "single-tulip",
    title: "Один тюльпан",
    type: "Цветы",
    detail: "Свеча на стебле",
    images: [
      "/images/tulip-single-vase.jpg",
      "/images/tulip-single-hand.jpg",
      "/images/tulip-single-flat.jpg",
    ],
  },
  {
    id: "cornflower",
    title: "Василёк",
    type: "Цветы",
    detail: "Свечи на стебле",
    images: [
      "/images/cornflower-stems.jpg",
      "/images/cornflower-hand.jpg",
    ],
  },
  {
    id: "peony-for-her",
    title: "Пион для неё",
    type: "Подарки",
    detail: "Свеча в подарочной упаковке",
    images: [
      "/images/peony-editorial.jpg",
      "/images/peony-vanity.jpg",
      "/images/peony-close.jpg",
      "/images/peony-satin.jpg",
    ],
  },
  {
    id: "aroma-sachet",
    title: "Арома-саше",
    type: "Подарки",
    detail: "Воск и сухие цветы",
    images: ["/images/aroma-sachet.jpg"],
  },
  {
    id: "heart-in-box",
    title: "Сердце в коробке",
    type: "Подарки",
    detail: "Подарочный набор · три цвета",
    images: [
      "/images/heart-gift-pink.jpg",
      "/images/heart-gift-blue.jpg",
      "/images/heart-gift-lilac.jpg",
    ],
  },
  {
    id: "pair",
    title: "Пара",
    type: "Подарки",
    detail: "Комплект свечей с сердцами",
    images: [
      "/images/heart-pair-white.jpg",
      "/images/heart-pair-pink.jpg",
      "/images/heart-pair-red.jpg",
    ],
  },
  {
    id: "candle-sweets",
    title: "Свечные конфеты",
    type: "Подарки",
    detail: "Набор мини-свечей",
    images: [
      "/images/candle-sweets-table.jpg",
      "/images/candle-sweets-boxes.jpg",
      "/images/candle-sweets-close.jpg",
    ],
  },
  {
    id: "lavender-home",
    title: "Лавандовый дом",
    type: "Для дома",
    detail: "Интерьерная свеча",
    images: [
      "/images/lavender-home-lit.jpg",
      "/images/lavender-home.jpg",
    ],
  },
  {
    id: "summer-herbarium",
    title: "Летний гербарий",
    type: "Для дома",
    detail: "Свеча с сухими цветами",
    images: [
      "/images/herbarium-lit.jpg",
      "/images/herbarium-cube.jpg",
    ],
  },
  {
    id: "winter-fire",
    title: "Зимний огонь",
    type: "Для дома",
    detail: "Свеча с травами",
    images: ["/images/winter-candle.jpg"],
  },
  {
    id: "dumplings-by-candlelight",
    title: "Пельмени при свечах",
    type: "Необычные",
    detail: "Свечной арт-объект",
    images: [
      "/images/dumpling-candle-top.jpg",
      "/images/dumpling-candle-bowl.jpg",
      "/images/dumpling-candle-plate.jpg",
    ],
  },
];
