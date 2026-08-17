"use client";

import { useMemo, useState } from "react";

type Category =
  | "Все"
  | "Букеты"
  | "Цветы"
  | "Подарки"
  | "Для дома"
  | "Необычные";

type Piece = {
  title: string;
  type: Exclude<Category, "Все">;
  detail: string;
  images: string[];
  focal?: string;
};

const categories: Category[] = [
  "Все",
  "Букеты",
  "Цветы",
  "Подарки",
  "Для дома",
  "Необычные",
];

const pieces: Piece[] = [
  {
    title: "Первый свет",
    type: "Букеты",
    detail: "Букет свечей-тюльпанов",
    images: [
      "/images/tulip-grand-wide.jpg",
      "/images/tulip-grand-portrait.jpg",
    ],
  },
  {
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
    title: "Медовое солнце",
    type: "Цветы",
    detail: "Свечи-одуванчики",
    images: [
      "/images/dandelion-stems.jpg",
      "/images/dandelion-hand.jpg",
    ],
  },
  {
    title: "Три розы",
    type: "Цветы",
    detail: "Свечи-цветы",
    images: [
      "/images/rose-trio-pedestal.jpg",
      "/images/rose-trio-flat.jpg",
    ],
  },
  {
    title: "Солнечный кристалл",
    type: "Цветы",
    detail: "Свеча-цветок",
    images: ["/images/crystal-flower.jpg"],
  },
  {
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
    title: "Василёк",
    type: "Цветы",
    detail: "Свечи на стебле",
    images: [
      "/images/cornflower-stems.jpg",
      "/images/cornflower-hand.jpg",
    ],
  },
  {
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
    title: "Арома-саше",
    type: "Подарки",
    detail: "Воск и сухие цветы",
    images: ["/images/aroma-sachet.jpg"],
  },
  {
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
    title: "Лавандовый дом",
    type: "Для дома",
    detail: "Интерьерная свеча",
    images: [
      "/images/lavender-home-lit.jpg",
      "/images/lavender-home.jpg",
    ],
  },
  {
    title: "Летний гербарий",
    type: "Для дома",
    detail: "Свеча с сухими цветами",
    images: [
      "/images/herbarium-lit.jpg",
      "/images/herbarium-cube.jpg",
    ],
  },
  {
    title: "Зимний огонь",
    type: "Для дома",
    detail: "Свеча с травами",
    images: ["/images/winter-candle.jpg"],
  },
  {
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

function ProductCard({ piece }: { piece: Piece }) {
  const [activeImage, setActiveImage] = useState(0);
  const currentImage = piece.images[activeImage] ?? piece.images[0];

  return (
    <article className="project">
      <div className="project-media">
        <img
          className="project-image"
          src={currentImage}
          alt={`${piece.title} — ${piece.detail.toLowerCase()}`}
          loading="lazy"
          style={piece.focal ? { objectPosition: piece.focal } : undefined}
        />
        {piece.images.length > 1 ? (
          <span className="project-count" aria-hidden="true">
            {String(activeImage + 1).padStart(2, "0")} /{" "}
            {String(piece.images.length).padStart(2, "0")}
          </span>
        ) : null}
      </div>

      <div className="project-meta">
        <div className="project-label">
          <h2>{piece.title}</h2>
          <p>{piece.detail}</p>
        </div>

        {piece.images.length > 1 ? (
          <div className="project-thumbs" aria-label={`Фотографии: ${piece.title}`}>
            {piece.images.map((image, index) => (
              <button
                key={image}
                className={activeImage === index ? "project-thumb is-active" : "project-thumb"}
                type="button"
                onClick={() => setActiveImage(index)}
                aria-label={`Показать кадр ${index + 1} из ${piece.images.length}`}
                aria-pressed={activeImage === index}
              >
                <img src={image} alt="" aria-hidden="true" loading="lazy" />
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("Все");
  const visiblePieces = useMemo(
    () =>
      activeCategory === "Все"
        ? pieces
        : pieces.filter((piece) => piece.type === activeCategory),
    [activeCategory],
  );

  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Alchemy of Wishes — на главную">
          Alchemy of Wishes
        </a>
        <nav className="header-nav" aria-label="Основная навигация">
          <a href="#collection">Каталог</a>
          <a href="#studio">О нас</a>
          <a
            className="telegram-button"
            href="https://t.me/alchemy_of_wishes"
            target="_blank"
            rel="noreferrer"
          >
            <span>Telegram</span>
            <span aria-hidden="true">↗</span>
          </a>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <img
          className="hero-image"
          src="/images/hero-editorial.png"
          alt="Букет коралловых свечей-тюльпанов на столике кафе"
        />
        <h1 id="hero-title">Alchemy of Wishes</h1>
      </section>

      <section className="collection" id="collection" aria-label="Каталог свечей">
        <nav className="filters" aria-label="Фильтр каталога">
          {categories.map((category) => {
            const count =
              category === "Все"
                ? pieces.length
                : pieces.filter((piece) => piece.type === category).length;

            return (
              <button
                key={category}
                className={activeCategory === category ? "filter-active" : undefined}
                type="button"
                onClick={() => setActiveCategory(category)}
                aria-pressed={activeCategory === category}
              >
                {category} <span>{count}</span>
              </button>
            );
          })}
        </nav>

        <div className="project-grid" aria-live="polite">
          {visiblePieces.map((piece) => (
            <ProductCard piece={piece} key={piece.title} />
          ))}
        </div>
      </section>

      <section className="editorial-break" aria-label="Тюльпановая коллекция">
        <img
          src="/images/tulip-grand-wide.jpg"
          alt="Большой букет разноцветных свечей-тюльпанов"
          loading="lazy"
        />
        <div className="editorial-stamp">Tulipa · 01</div>
        <p>Свечи, собранные как цветы.</p>
      </section>

      <section className="studio" id="studio" aria-labelledby="founder-title">
        <div className="founder-portrait">
          <img
            src="/images/evgenia-founder.jpg"
            alt="Евгения — создательница Alchemy of Wishes"
            loading="lazy"
          />
        </div>

        <div className="founder-copy">
          <p className="studio-kicker">Создательница Alchemy of Wishes</p>
          <h2 id="founder-title">Евгения</h2>
          <div className="founder-story">
            <p>
              Евгения — автор всех свечей и композиций, представленных на этом
              сайте.
            </p>
            <p>
              Она придумывает формы, подбирает оттенки и вручную собирает каждый
              букет. Поэтому даже похожие композиции немного отличаются друг от
              друга — как настоящие цветы.
            </p>
          </div>
          <a
            className="founder-telegram"
            href="https://t.me/alchemy_of_wishes"
            target="_blank"
            rel="noreferrer"
          >
            <span>Наш телеграмм</span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <footer className="site-footer">
        <span>Alchemy of Wishes</span>
        <span>
          Свечная студия · 2026 ·{" "}
          <a
            className="footer-telegram"
            href="https://t.me/alchemy_of_wishes"
            target="_blank"
            rel="noreferrer"
          >
            Telegram ↗
          </a>
        </span>
      </footer>
    </main>
  );
}
