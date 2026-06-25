/* ===== Mobile nav popup (tap the logo) ===== */

const navLogo = document.querySelector(".header .logo");

if (navLogo) {
  const popup = document.createElement("div");
  popup.className = "nav-popup";
  popup.innerHTML = `
    <a class="nav-popup__link" href="./games.html">мини-игры</a>
    <a class="nav-popup__link" href="./merch.html">мерч</a>
    <a class="nav-popup__link" href="./space.html">пространство</a>
    <a class="nav-popup__link" href="./404.html">журнал</a>
  `;
  navLogo.insertAdjacentElement("afterend", popup);

  const navMq = window.matchMedia("(max-width: 600px)");

  navLogo.addEventListener("click", (e) => {
    // On desktop the logo keeps its normal "go home" behaviour.
    if (!navMq.matches) return;
    e.preventDefault();
    popup.classList.toggle("is-open");
  });

  // Close when tapping outside the popup / logo.
  document.addEventListener("click", (e) => {
    if (!popup.classList.contains("is-open")) return;
    if (e.target.closest(".nav-popup") || e.target.closest(".logo")) return;
    popup.classList.remove("is-open");
  });
}

/* ===== Festival program ===== */

const events = [
  {
    time: "12:00",
    title: "открытие фестиваля",
    tag: "мини-игра",
    description:
      "Знакомимся с командой, играем в мини-игры и узнаём, как помочь котикам.",
  },
  {
    time: "13:30",
    title: "встреча с котами",
    tag: "знакомство",
    description:
      "Приходите познакомиться с котиками, которые прямо сейчас ищут свой дом.",
  },
  {
    time: "15:00",
    title: "мастер-класс",
    tag: "творчество",
    description:
      "Делаем игрушки и уютные лежанки для приютских животных своими руками.",
  },
  {
    time: "17:00",
    title: "финал и розыгрыш",
    tag: "подарки",
    description:
      "Подводим итоги дня, награждаем волонтёров и разыгрываем приятные призы.",
  },
];

const section = document.getElementById("program");

if (section) {
  const eventsEl = document.getElementById("programEvents");
  const dotEl = document.getElementById("timelineDot");
  const progressEl = document.getElementById("timelineProgress");
  const cardEl = document.getElementById("programCard");
  const photoEl = document.getElementById("programPhoto");
  const nameEl = cardEl.querySelector(".program-card__name");
  const descEl = cardEl.querySelector(".program-card__desc");

  // Cat shown in the right card for each event (by index).
  const eventCats = [
    { photo: "./img/cat-3.png", name: "Вася", age: "4 года" },
    { photo: "./img/cat-2.png", name: "Пончик", age: "1.5 лет" },
    { photo: "./img/cat-1.png", name: "Котлета", age: "2 года" },
    { photo: "./img/cat-5.png", name: "Муся", age: "6 лет" },
  ];

  // --- Render cards from the data array ---
  const cards = events.map((event, index) => {
    const li = document.createElement("li");
    li.className = "event-card" + (index === 0 ? " is-active" : "");

    li.innerHTML = `
      <div class="event-card__row">
        <span class="event-card__time">${event.time}</span>
        <span class="event-card__title">${event.title}</span>
        <span class="event-card__tag">${event.tag}</span>
      </div>
      <p class="event-card__desc">${event.description}</p>
    `;

    eventsEl.appendChild(li);
    return li;
  });

  let activeIndex = 0;

  // Card heights are fixed in CSS, so the active card's center can be derived
  // analytically — no per-frame getBoundingClientRect (which would force a
  // synchronous layout on every scroll frame and cause stutter).
  const COLLAPSED = 82;
  const EXPANDED = 180;
  const GAP = 16;

  // Place the dot / progress at the center of the active card. CSS transitions
  // glide them, so this only needs to run once per active change.
  function positionTimeline() {
    const center = activeIndex * (COLLAPSED + GAP) + EXPANDED / 2;
    dotEl.style.transform = `translate(-50%, calc(${center}px - 50%))`;
    progressEl.style.height = `${center}px`;
  }

  function setActive(index) {
    if (index === activeIndex) return;
    cards[activeIndex].classList.remove("is-active");
    activeIndex = index;
    cards[activeIndex].classList.add("is-active");

    positionTimeline();

    // Swap the cat (photo + name + age) for the active event.
    const cat = eventCats[index];
    if (cat) {
      photoEl.src = cat.photo;
      nameEl.textContent = cat.name;
      descEl.textContent = `${cat.age}, ищет дом`;
    }

    // Re-trigger the right card's pulse animation.
    cardEl.classList.remove("program-card--pulse");
    void cardEl.offsetWidth;
    cardEl.classList.add("program-card--pulse");
  }

  // --- Scroll progress drives which card is active ---
  let ticking = false;

  // On mobile the section is a normal (non-sticky) block, so instead of mapping
  // sticky scroll-progress to an index we just activate the card whose center is
  // closest to the middle of the viewport. This keeps the scroll animation with
  // no extra reserved height (and therefore no empty gap before the next block).
  const mobileMq = window.matchMedia("(max-width: 600px)");

  function update() {
    ticking = false;

    let index;

    if (mobileMq.matches) {
      const mid = window.innerHeight / 2;
      let best = 0;
      let bestDist = Infinity;
      cards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const dist = Math.abs(center - mid);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      index = best;
    } else {
      const scrollable = section.offsetHeight - window.innerHeight;
      const scrolled = Math.min(
        Math.max(-section.getBoundingClientRect().top, 0),
        scrollable
      );
      const progress = scrollable > 0 ? scrolled / scrollable : 0;

      index = Math.min(
        events.length - 1,
        Math.max(0, Math.floor(progress * events.length))
      );
    }

    setActive(index);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  // Initial placement.
  positionTimeline();
}

/* ===== Cats carousel ===== */

const cats = [
  { name: "Котлета", age: "2 года", photo: "./img/cat-1.png" },
  { name: "Пончик", age: "1.5 лет", photo: "./img/cat-2.png" },
  { name: "Вася", age: "4 года", photo: "./img/cat-3.png" },
  { name: "Пупа", age: "1 год", photo: "./img/cat-4.png" },
  { name: "Муся", age: "6 лет", photo: "./img/cat-5.png" },
];

const catsTrack = document.getElementById("catsTrack");

if (catsTrack) {
  const prevBtn = document.getElementById("catsPrev");
  const nextBtn = document.getElementById("catsNext");

  function buildCard(cat) {
    const li = document.createElement("li");
    li.className = "cat-card";

    li.innerHTML = `
      <div class="cat-card__top">
        <span class="cat-card__badge">
          <img class="cat-card__paw" src="./img/paw-black.svg" alt="" />
          <span>${cat.age}</span>
        </span>
        <button class="cat-card__fav" type="button" aria-label="В избранное">
          <img src="./img/heart-black.svg" alt="" />
        </button>
      </div>
      <span class="cat-card__watermark">murr</span>
      <img class="cat-card__photo" src="${cat.photo}" alt="кот ${cat.name}" />
      <div class="cat-card__plate">
        <div class="cat-card__info">
          <span class="cat-card__name">${cat.name}</span>
          <span class="cat-card__desc">${cat.age}, ищет дом</span>
        </div>
        <a class="cat-card__btn" href="#">
          <span>взять кота</span>
          <img class="cat-card__heart" src="./img/heart-black.svg" alt="" />
        </a>
      </div>
    `;
    return li;
  }

  // Render 3 identical copies so the carousel can loop seamlessly: we keep the
  // scroll parked in the middle copy and jump by one copy-width when it drifts.
  const COPIES = 3;
  for (let c = 0; c < COPIES; c++) {
    cats.forEach((cat) => catsTrack.appendChild(buildCard(cat)));
  }
  const cardEls = Array.from(catsTrack.children);

  let setWidth = 0; // width of one copy of the list
  let step = 0; // one card + gap (cached to avoid per-frame style reads)

  function measure() {
    const gap = parseFloat(getComputedStyle(catsTrack).columnGap) || 24;
    step = cardEls[0] ? cardEls[0].offsetWidth + gap : 0;
    // One copy's stride = cards-per-copy * (card + gap). Using this exact value
    // (not scrollWidth/COPIES) makes the loop jump land on the identical card.
    setWidth = cats.length * step;
    catsTrack.scrollLeft = setWidth; // start in the middle copy
    updateActive();
  }

  // The middle of the 3 visible cards is the "active" purple one; it follows the
  // scroll so each next card turns purple while the previous returns to grey.
  // The tilt alternates (+/-1.41deg) on every real move.
  let activeCard = null;
  let tiltSign = 1;

  function updateActive(isWrap) {
    if (!step) return;
    // Active = the card whose center is nearest the middle of the visible track.
    // Deriving it from clientWidth (instead of a fixed +1 offset) keeps it correct
    // for any number of visible cards — 3-up on desktop, ~1-up on mobile.
    const visibleCenter = catsTrack.scrollLeft + catsTrack.clientWidth / 2;
    const idx = Math.max(
      0,
      Math.min(cardEls.length - 1, Math.round(visibleCenter / step - 0.5))
    );
    const target = cardEls[idx];
    if (target === activeCard) return;

    // Alternate the tilt only on genuine moves (not the first one, not the
    // invisible loop-jump between identical copies).
    if (activeCard && !isWrap) tiltSign = -tiltSign;

    if (activeCard) {
      activeCard.classList.remove(
        "cat-card--active",
        "cat-card--tilt-a",
        "cat-card--tilt-b"
      );
    }
    target.classList.add(
      "cat-card--active",
      tiltSign > 0 ? "cat-card--tilt-a" : "cat-card--tilt-b"
    );
    activeCard = target;
  }

  // Keep the scroll position within the middle copy. Jumping by exactly one
  // copy-width is invisible because every copy is identical.
  function wrap() {
    if (!setWidth) return;
    let jumped = false;
    if (catsTrack.scrollLeft < setWidth * 0.5) {
      catsTrack.classList.add("is-wrapping");
      catsTrack.scrollLeft += setWidth;
      jumped = true;
    } else if (catsTrack.scrollLeft > setWidth * 1.5) {
      catsTrack.classList.add("is-wrapping");
      catsTrack.scrollLeft -= setWidth;
      jumped = true;
    }
    if (jumped) {
      updateActive(true); // move active to the identical copy without re-firing
      void catsTrack.offsetWidth; // flush, then re-enable transitions
      catsTrack.classList.remove("is-wrapping");
    }
  }

  // --- Custom smooth scroll so we control when wrapping is safe ---
  let animating = false;

  function animateTo(target, duration = 450) {
    const start = catsTrack.scrollLeft;
    const distance = target - start;
    const startTime = performance.now();
    animating = true;

    function frame(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      catsTrack.scrollLeft = start + distance * eased;
      updateActive();
      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        animating = false;
        wrap();
        updateActive();
      }
    }
    requestAnimationFrame(frame);
  }

  function go(direction) {
    if (animating) return;
    wrap();
    animateTo(catsTrack.scrollLeft + direction * step);
  }

  prevBtn.addEventListener("click", () => go(-1));
  nextBtn.addEventListener("click", () => go(1));

  // --- Native drag / trackpad scroll: wrap once the user stops ---
  let idleTimer = null;
  catsTrack.addEventListener(
    "scroll",
    () => {
      if (animating) return;
      updateActive();
      clearTimeout(idleTimer);
      idleTimer = setTimeout(wrap, 120);
    },
    { passive: true }
  );

  window.addEventListener("resize", measure);
  measure();
}

/* ===== FAQ accordion ===== */

const faqItems = [
  {
    question: "как записаться?",
    answer:
      "Выберите событие в программе фестиваля и нажмите «участвовать». После этого мы подскажем детали и подтвердим запись.",
  },
  {
    question: "сколько стоит участие?",
    answer:
      "Участие бесплатное. Любая помощь котикам — корм, донат или волонтёрство — по желанию.",
  },
  {
    question: "что принести с собой?",
    answer:
      "Можно принести корм, пледы, игрушки или переноски. Если ничего нет — просто приходите, ваше участие уже помогает.",
  },
  {
    question: "как стать волонтером?",
    answer:
      "Нажмите кнопку «стать волонтёром» и оставьте контакты. Мы свяжемся с вами и расскажем, чем можно помочь.",
  },
];

const faqList = document.getElementById("faqList");

if (faqList) {
  faqItems.forEach((data, i) => {
    const item = document.createElement("div");
    item.className = "faq__item";

    item.innerHTML = `
      <button
        class="faq__head"
        type="button"
        aria-expanded="false"
        aria-controls="faq-panel-${i}"
        id="faq-head-${i}"
      >
        <span class="faq__question">${data.question}</span>
        <span class="faq__icon">
          <img src="./img/plus.svg" alt="" />
        </span>
      </button>
      <div
        class="faq__panel"
        id="faq-panel-${i}"
        role="region"
        aria-labelledby="faq-head-${i}"
      >
        <p class="faq__answer">${data.answer}</p>
      </div>
    `;

    faqList.appendChild(item);

    const head = item.querySelector(".faq__head");
    const panel = item.querySelector(".faq__panel");

    // When fully open, drop the fixed max-height so content can reflow freely.
    panel.addEventListener("transitionend", (e) => {
      if (e.propertyName === "max-height" && item.classList.contains("is-open")) {
        panel.style.maxHeight = "none";
      }
    });

    head.addEventListener("click", () => {
      const isOpen = item.classList.toggle("is-open");
      head.setAttribute("aria-expanded", String(isOpen));

      if (isOpen) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      } else {
        // Animate from the current height down to 0.
        panel.style.maxHeight = panel.scrollHeight + "px";
        requestAnimationFrame(() => {
          panel.style.maxHeight = "0px";
        });
      }
    });
  });
}

/* ===== Merch grid ===== */

const products = [
  { img: "./img/bracelet-1.png", name: "Кепка", price: "920 руб.", big: true },
  { img: "./img/star.png", name: "Кепка", price: "920 руб." },
  { img: "./img/bracelet-withfish.png", name: "Кепка", price: "920 руб.", big: true },
  { img: "./img/cat-icon.png", name: "Кепка", price: "920 руб." },
  { img: "./img/bracelet-2.png", name: "Кепка", price: "920 руб.", big: true },
  { img: "./img/fish-icon.png", name: "Кепка", price: "920 руб." },
];

const merchGrid = document.getElementById("merchGrid");

if (merchGrid) {
  products.forEach((product) => {
    const card = document.createElement("article");
    card.className = "product-card";

    const imgClass =
      "product-card__img" + (product.big ? " product-card__img--lg" : "");

    card.innerHTML = `
      <a class="product-card__arrow" href="./404.html" aria-label="Открыть товар">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M7 17 17 7M9 7h8v8"
            fill="none"
            stroke="#0a0a0a"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </a>
      <span class="product-card__watermark">murr</span>
      <img class="${imgClass}" src="${product.img}" alt="${product.name}" />
      <div class="product-card__plate">
        <div class="product-card__info">
          <span class="product-card__name">${product.name}</span>
          <span class="product-card__price">${product.price}</span>
        </div>
        <a class="product-card__btn" href="./404.html">
          <span>купить</span>
          <img class="product-card__heart" src="./img/heart-black.svg" alt="" />
        </a>
      </div>
    `;

    merchGrid.appendChild(card);
  });
}
