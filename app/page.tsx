"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Stepper } from "@/components/ui/stepper";
import { categories, pieces, type Category, type Piece } from "./catalog";
import { updateCartQuantity, type CartQuantities } from "./cart-quantity";
import { calculateFloatingOrderShift } from "./floating-order-position";
import { buildOrderRequest, buildTelegramDraft } from "./order-payload";
import { submitOrderRequest } from "./order-transport";

type OrderStatus = "idle" | "submitting" | "sent" | "telegram" | "error";
type HeaderMode = "top" | "hidden" | "visible";

const carouselImageVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? "3%" : "-3%",
  }),
  center: {
    opacity: 1,
    x: "0%",
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? "-3%" : "3%",
  }),
};

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
  const [slideDirection, setSlideDirection] = useState(1);
  const currentImage = piece.images[activeImage] ?? piece.images[0];

  function showImage(index: number) {
    if (index === activeImage || index < 0 || index >= piece.images.length) return;
    setSlideDirection(index > activeImage ? 1 : -1);
    setActiveImage(index);
  }

  return (
    <article className="project">
      <div className="project-media">
        <AnimatePresence initial={false} custom={slideDirection} mode="sync">
          <motion.img
            key={currentImage}
            className="project-image"
            src={currentImage}
            alt={`${piece.title} — ${piece.detail.toLowerCase()}`}
            loading="lazy"
            style={piece.focal ? { objectPosition: piece.focal } : undefined}
            custom={slideDirection}
            variants={carouselImageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          />
        </AnimatePresence>
        {piece.images.length > 1 ? (
          <>
            <button
              className="project-carousel-button project-carousel-button-prev"
              type="button"
              onClick={() => showImage(activeImage - 1)}
              disabled={activeImage === 0}
              aria-label={`Предыдущий кадр: ${piece.title}`}
            >
              <ChevronLeft aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>

            <div className="project-carousel-indicators" aria-label={`Фотографии: ${piece.title}`}>
              {piece.images.map((image, index) => (
                <motion.button
                  layout
                  key={`${image}-${index}`}
                  className={
                    activeImage === index
                      ? "project-carousel-indicator is-active"
                      : "project-carousel-indicator"
                  }
                  type="button"
                  onClick={() => showImage(index)}
                  aria-label={`Показать кадр ${index + 1} из ${piece.images.length}`}
                  aria-pressed={activeImage === index}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              ))}
            </div>

            <button
              className="project-carousel-button project-carousel-button-next"
              type="button"
              onClick={() => showImage(activeImage + 1)}
              disabled={activeImage === piece.images.length - 1}
              aria-label={`Следующий кадр: ${piece.title}`}
            >
              <ChevronRight aria-hidden="true" size={20} strokeWidth={1.5} />
            </button>

            <span className="project-count" aria-hidden="true">
              {String(activeImage + 1).padStart(2, "0")} /{" "}
              {String(piece.images.length).padStart(2, "0")}
            </span>
          </>
        ) : null}
      </div>

      <div className="project-meta">
        <div className="project-label">
          <h2>{piece.title}</h2>
          <p>{piece.detail}</p>
        </div>

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
  const footerRef = useRef<HTMLElement>(null);
  const floatingOrderRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (cartCount === 0) return;

    let animationFrame = 0;
    const updateFloatingOrder = () => {
      const footer = footerRef.current;
      const button = floatingOrderRef.current;
      if (!footer || !button) return;

      const bottomGap = window.innerWidth <= 720 ? 14 : 24;
      const shift = calculateFloatingOrderShift(
        window.innerHeight,
        footer.getBoundingClientRect().top,
        bottomGap,
      );
      button.style.setProperty("--footer-shift", `${shift}px`);
      animationFrame = 0;
    };

    const requestUpdate = () => {
      if (animationFrame === 0) {
        animationFrame = window.requestAnimationFrame(updateFloatingOrder);
      }
    };

    updateFloatingOrder();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (animationFrame !== 0) window.cancelAnimationFrame(animationFrame);
    };
  }, [cartCount]);

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
              className="telegram-button"
              href="https://t.me/alchemy_of_wishes"
              target="_blank"
              rel="noreferrer"
            >
              <span>Telegram</span>
              <span aria-hidden="true">↗︎</span>
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

      <footer className="site-footer" id="studio" ref={footerRef}>
        <div className="footer-intro">
          <p className="footer-kicker">Свечная студия Евгении</p>
          <p className="footer-statement">
            Alchemy of Wishes — свечная студия Евгении. Она придумывает формы,
            выбирает натуральные материалы и вручную собирает каждую композицию.
            Поэтому даже похожие букеты всегда немного отличаются.
          </p>
        </div>

        <div className="footer-column">
          <p className="footer-column-title">Коллекции</p>
          {categories.filter((category) => category !== "Все").map((category) => (
            <button
              type="button"
              onClick={() => {
                setActiveCategory(category);
                document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
              }}
              key={category}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="footer-column">
          <p className="footer-column-title">Студия</p>
          <span>Ручная работа</span>
          <span>Натуральные материалы</span>
          <span>Москва</span>
          <span>2026</span>
        </div>

        <div className="footer-bottom">
          <a
            href="https://www.instagram.com/alchemy_of_wish?igsh=MWR4eXN3MHlxamR0aA=="
            target="_blank"
            rel="noreferrer"
          >
            Instagram <span aria-hidden="true">↗︎</span>
          </a>
          <a className="back-to-top" href="#top" aria-label="Наверх">
            Наверх <span aria-hidden="true">↑</span>
          </a>
          <a
            className="footer-telegram"
            href="https://t.me/alchemy_of_wishes"
            target="_blank"
            rel="noreferrer"
          >
            Telegram <span aria-hidden="true">↗︎</span>
          </a>
        </div>
      </footer>

      {cartCount > 0 && !isCartOpen ? (
        <button
          className="floating-order"
          type="button"
          onClick={openCart}
          ref={floatingOrderRef}
        >
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
                    <span aria-hidden="true">↗︎</span>
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
