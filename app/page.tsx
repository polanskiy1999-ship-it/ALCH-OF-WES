"use client";

import { useMemo, useState } from "react";

type Category = "Все" | "Букеты" | "Подарки" | "Коллекции";

const categories: Category[] = ["Все", "Букеты", "Подарки", "Коллекции"];

const pieces = [
  {
    title: "Небесный сад",
    type: "Букеты" as Category,
    detail: "Свечная композиция",
    image: "/images/bouquet-blue-top.jpg",
    ratio: "square",
  },
  {
    title: "Зелёный чай",
    type: "Букеты" as Category,
    detail: "Свечная композиция",
    image: "/images/bouquet-green-pot.jpg",
    ratio: "portrait",
    focal: "top",
  },
  {
    title: "Розовый фарфор",
    type: "Подарки" as Category,
    detail: "Подарочная композиция",
    image: "/images/bouquet-pink-top.jpg",
    ratio: "square",
  },
  {
    title: "Солнечный круг",
    type: "Букеты" as Category,
    detail: "Свечная композиция",
    image: "/images/bouquet-yellow-pot.jpg",
    ratio: "portrait",
  },
  {
    title: "Клубника",
    type: "Подарки" as Category,
    detail: "Свечи в форме ягод",
    image: "/images/bouquet-strawberry.jpg",
    ratio: "portrait",
  },
  {
    title: "Цветочная палитра",
    type: "Коллекции" as Category,
    detail: "Коллекция форм",
    image: "/images/collection-mosaic.jpg",
    ratio: "portrait",
  },
  {
    title: "Ангельский сад",
    type: "Подарки" as Category,
    detail: "Подарочная композиция",
    image: "/images/gift-pink.jpg",
    ratio: "portrait",
    focal: "top",
  },
  {
    title: "Лазурь",
    type: "Букеты" as Category,
    detail: "Свечная композиция",
    image: "/images/bouquet-blue-pot.jpg",
    ratio: "portrait",
  },
  {
    title: "Ботаника",
    type: "Коллекции" as Category,
    detail: "Свечные цветы",
    image: "/images/bouquet-green-top.jpg",
    ratio: "square",
  },
];

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
          <a href="#collection">Коллекция</a>
          <a href="#studio">Студия</a>
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

      <section className="collection" id="collection" aria-label="Коллекция свечей">
        <nav className="filters" aria-label="Фильтр коллекции">
          {categories.map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "filter-active" : undefined}
              type="button"
              onClick={() => setActiveCategory(category)}
              aria-pressed={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </nav>

        <div className="project-grid" aria-live="polite">
          {visiblePieces.map((piece) => (
            <article className="project" key={piece.title}>
              <div className={`project-media project-media--${piece.ratio}`}>
                <img
                  className={piece.focal ? `project-image project-image--${piece.focal}` : "project-image"}
                  src={piece.image}
                  alt={piece.title}
                  loading="lazy"
                />
              </div>
              <div className="project-label">
                <h2>{piece.title}</h2>
                <p>{piece.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="editorial-break" aria-label="Тюльпановая коллекция">
        <img
          src="/images/tulip-flatlay.jpg"
          alt="Коралловые свечи-тюльпаны на светлом деревянном столе"
          loading="lazy"
        />
        <div className="editorial-stamp">Tulipa · 01</div>
        <p>Свечи, собранные как цветы.</p>
      </section>

      <section className="studio" id="studio" aria-label="О студии">
        <p className="studio-kicker">Alchemy of Wishes · Москва</p>
        <p className="studio-line">Каждая композиция собирается вручную.</p>
      </section>

      <footer className="site-footer">
        <span>Alchemy of Wishes</span>
        <span>Свечная студия · 2026</span>
      </footer>
    </main>
  );
}
