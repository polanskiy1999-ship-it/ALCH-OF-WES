"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Stepper } from "@/components/ui/stepper";
import { categories, pieces, type Category, type Piece } from "./catalog";
import { updateCartQuantity, type CartQuantities } from "./cart-quantity";
import { buildOrderRequest, buildTelegramDraft } from "./order-payload";
import { submitOrderRequest } from "./order-transport";

type OrderStatus = "idle" | "submitting" | "sent" | "telegram" | "error";
type HeaderMode = "top" | "hidden" | "visible";

function ProductCard({
  piece,
  quantity,
  onAdd,
}: {
  piece: Piece;
  quantity: number;
  onAdd: () => void;
}) {
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

      <button className="project-add" type="button" onClick={onAdd}>
        <span>{quantity > 0 ? `В заказе · ${quantity}` : "Добавить в заказ"}</span>
        <span aria-hidden="true">+</span>
      </button>
    </article>
  );
}

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<Category>("Все");
  const [sortMode, setSortMode] = useState<"default" | "alphabetical">("default");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [cart, setCart] = useState<CartQuantities>({});
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [headerMode, setHeaderMode] = useState<HeaderMode>("top");
  const sortControlRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);

  const visiblePieces = useMemo(() => {
    const filtered =
      activeCategory === "Все"
        ? pieces
        : pieces.filter((piece) => piece.type === activeCategory);

    if (sortMode === "alphabetical") {
      return [...filtered].sort((left, right) =>
        left.title.localeCompare(right.title, "ru", { sensitivity: "base" }),
      );
    }

    return filtered;
  }, [activeCategory, sortMode]);

  const cartItems = useMemo(
    () =>
      pieces
        .filter((piece) => (cart[piece.id] ?? 0) > 0)
        .map((piece) => ({ piece, quantity: cart[piece.id] })),
    [cart],
  );

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    if (!isCartOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsCartOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isCartOpen]);

  useEffect(() => {
    if (!isSortOpen) return;

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!sortControlRef.current?.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSortOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isSortOpen]);

  useEffect(() => {
    let animationFrame = 0;

    const updateHeader = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollDelta = currentScrollY - lastScrollYRef.current;

      if (currentScrollY <= 96) {
        setHeaderMode("top");
      } else if (scrollDelta < -2) {
        setHeaderMode("visible");
      } else if (scrollDelta > 2) {
        setHeaderMode("hidden");
      }

      lastScrollYRef.current = currentScrollY;
      animationFrame = 0;
    };

    const handleScroll = () => {
      if (animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(updateHeader);
      }
    };

    lastScrollYRef.current = window.scrollY;
    updateHeader();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  function addToCart(pieceId: string) {
    setCart((current) => ({
      ...current,
      [pieceId]: Math.min((current[pieceId] ?? 0) + 1, 20),
    }));
    setOrderStatus("idle");
  }

  function updateQuantity(pieceId: string, quantity: number) {
    setCart((current) => updateCartQuantity(current, pieceId, quantity));
    setOrderStatus("idle");
  }

  function openCart() {
    setOrderStatus("idle");
    setIsCartOpen(true);
  }

  async function submitOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (cartItems.length === 0 || orderStatus === "submitting") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = buildOrderRequest(formData, cartItems);

    setOrderStatus("submitting");

    try {
      const response = await submitOrderRequest(payload);

      if (response.ok) {
        setCart({});
        setOrderStatus("sent");
        form.reset();
        return;
      }

      const result = (await response.json().catch(() => null)) as { code?: string } | null;

      if (result?.code === "telegram_not_configured") {
        const draft = buildTelegramDraft(
          payload.name,
          payload.telegram,
          payload.comment,
          cartItems,
        );
        setOrderStatus("telegram");
        window.location.href = `https://t.me/alchemy_of_wishes?text=${encodeURIComponent(draft)}`;
        return;
      }

      throw new Error("order_failed");
    } catch {
      setOrderStatus("error");
    }
  }

  return (
    <main className="site-shell" id="top">
      <div className="site-header-slot">
        <header
          className={`site-header${headerMode === "top" ? "" : " is-floating"}${
            headerMode === "visible" ? " is-visible" : ""
          }`}
        >
          <a className="brand" href="#top" aria-label="Alchemy of Wishes — на главную">
            Alchemy of Wishes
          </a>
          <nav className="header-nav" aria-label="Основная навигация">
            <a href="#collection">Каталог</a>
            <a href="#studio">О нас</a>
            <button className="order-nav-button" type="button" onClick={openCart}>
              Заказ <span>{cartCount}</span>
            </button>
            <a
              className="telegram-link telegram-button"
              href="https://t.me/alchemy_of_wishes"
              target="_blank"
              rel="noreferrer"
            >
              <span>Telegram</span>
              <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </header>
      </div>

      <section className="collection" id="collection" aria-label="Каталог свечей">
        <div className="catalog-toolbar">
          <nav className="filters" aria-label="Фильтр каталога">
            {categories.map((category) => {
              return (
                <button
                  key={category}
                  className={activeCategory === category ? "filter-active" : undefined}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={activeCategory === category}
                >
                  {category}
                </button>
              );
            })}
          </nav>

          <div className="sort-control" ref={sortControlRef}>
            <button
              className={isSortOpen || sortMode !== "default" ? "sort-trigger is-active" : "sort-trigger"}
              type="button"
              onClick={() => setIsSortOpen((current) => !current)}
              aria-expanded={isSortOpen}
              aria-controls="catalog-sort-menu"
              aria-label="Открыть сортировку каталога"
            >
              <span className="sort-icon" aria-hidden="true">
                <span className="sort-arrow" />
                <span className="sort-steps">
                  <i />
                  <i />
                  <i />
                </span>
              </span>
            </button>

            {isSortOpen ? (
              <div className="sort-menu" id="catalog-sort-menu" role="dialog" aria-label="Сортировка">
                <p className="sort-menu-title">Сортировка</p>
                <button type="button" disabled title="Будет доступно после добавления цен">
                  <span>Сначала дешевле</span>
                  <small>Скоро</small>
                </button>
                <button type="button" disabled title="Будет доступно после добавления цен">
                  <span>Сначала дороже</span>
                  <small>Скоро</small>
                </button>
                <button
                  className={sortMode === "alphabetical" ? "is-selected" : undefined}
                  type="button"
                  onClick={() => {
                    setSortMode("alphabetical");
                    setIsSortOpen(false);
                  }}
                >
                  <span>По алфавиту</span>
                  <small aria-hidden="true">{sortMode === "alphabetical" ? "✓" : "А—Я"}</small>
                </button>
                {sortMode !== "default" ? (
                  <button
                    className="sort-reset"
                    type="button"
                    onClick={() => {
                      setSortMode("default");
                      setIsSortOpen(false);
                    }}
                  >
                    Сбросить сортировку
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="project-grid" aria-live="polite">
          {visiblePieces.map((piece) => (
            <ProductCard
              piece={piece}
              quantity={cart[piece.id] ?? 0}
              onAdd={() => addToCart(piece.id)}
              key={piece.id}
            />
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
            src="/images/evgenia-founder.webp"
            alt="Евгения — создательница Alchemy of Wishes"
            loading="lazy"
          />
        </div>

        <div className="founder-copy">
          <p className="studio-kicker">Создательница Alchemy of Wishes</p>
          <h2 id="founder-title">Евгения</h2>
          <div className="founder-story">
            <p>
              Евгения является автором всех свечей и композиций, представленных
              на этом сайте.
            </p>
            <p>
              Она придумывает формы, выбирает и закупает только натуральные и
              качественные материалы, подбирает оттенки и вручную собирает каждый
              букет. Поэтому даже похожие композиции немного отличаются друг от
              друга как настоящие цветы.
            </p>
          </div>
          <a
            className="telegram-link founder-telegram"
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
        <span className="footer-brand">Alchemy of Wishes</span>
        <div className="footer-end">
          <span className="footer-meta">Свечная студия · 2026</span>
          <div className="footer-actions">
            <a
              className="telegram-link footer-telegram"
              href="https://t.me/alchemy_of_wishes"
              target="_blank"
              rel="noreferrer"
            >
              <span>Наш Telegram</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
        <a className="back-to-top" href="#top" aria-label="Наверх">
          <span aria-hidden="true">↑</span>
        </a>
      </footer>

      {cartCount > 0 && !isCartOpen ? (
        <button className="floating-order" type="button" onClick={openCart}>
          <span>Оформить заказ</span>
          <span>{cartCount}</span>
        </button>
      ) : null}

      {isCartOpen ? (
        <div className="cart-layer" role="presentation">
          <button
            className="cart-backdrop"
            type="button"
            onClick={() => setIsCartOpen(false)}
            aria-label="Закрыть заказ"
          />
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div className="cart-header">
              <div>
                <p>Alchemy of Wishes</p>
                <h2 id="cart-title">Ваш заказ</h2>
              </div>
              <button className="cart-close" type="button" onClick={() => setIsCartOpen(false)}>
                Закрыть
              </button>
            </div>

            {orderStatus === "sent" ? (
              <div className="order-success" role="status">
                <span aria-hidden="true">✓</span>
                <h3>Заказ отправлен</h3>
                <p>Евгения напишет вам в Telegram, чтобы уточнить детали и стоимость.</p>
                <button type="button" onClick={() => setIsCartOpen(false)}>
                  Вернуться к каталогу
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="cart-empty">
                <p>Здесь пока пусто.</p>
                <button type="button" onClick={() => setIsCartOpen(false)}>
                  Выбрать свечи
                </button>
              </div>
            ) : (
              <>
                <div className="cart-list">
                  {cartItems.map(({ piece, quantity }) => (
                    <div className="cart-item" key={piece.id}>
                      <img src={piece.images[0]} alt="" aria-hidden="true" />
                      <div className="cart-item-copy">
                        <strong>{piece.title}</strong>
                        <span>{piece.detail}</span>
                      </div>
                      <Stepper
                        className="quantity-stepper"
                        value={quantity}
                        min={0}
                        max={20}
                        onChange={(next) => updateQuantity(piece.id, next)}
                        ariaLabel={`Количество: ${piece.title}`}
                      />
                    </div>
                  ))}
                </div>

                <form className="order-form" onSubmit={submitOrder}>
                  <p className="order-note">
                    Оставьте контакты — детали и стоимость согласуем в Telegram.
                  </p>
                  <label>
                    <span>Имя</span>
                    <input name="name" type="text" autoComplete="name" required maxLength={80} />
                  </label>
                  <label>
                    <span>Ваш Telegram</span>
                    <input
                      name="telegram"
                      type="text"
                      inputMode="text"
                      autoComplete="off"
                      placeholder="@username"
                      required
                      maxLength={80}
                    />
                  </label>
                  <label>
                    <span>Комментарий</span>
                    <textarea
                      name="comment"
                      rows={3}
                      placeholder="Цвет, упаковка, дата — если уже знаете"
                      maxLength={800}
                    />
                  </label>
                  <label className="order-honeypot" aria-hidden="true">
                    <span>Компания</span>
                    <input name="company" type="text" tabIndex={-1} autoComplete="off" />
                  </label>
                  <button className="order-submit" type="submit" disabled={orderStatus === "submitting"}>
                    <span>{orderStatus === "submitting" ? "Отправляем…" : "Отправить заказ"}</span>
                    <span aria-hidden="true">↗</span>
                  </button>
                  <p className="order-status" aria-live="polite">
                    {orderStatus === "telegram"
                      ? "Заказ подготовлен — осталось отправить сообщение в Telegram."
                      : orderStatus === "error"
                        ? "Не получилось отправить. Попробуйте ещё раз или напишите нам в Telegram."
                        : ""}
                  </p>
                </form>
              </>
            )}
          </aside>
        </div>
      ) : null}
    </main>
  );
}
