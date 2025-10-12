/* ============================================================
   UT SHPE – Main JS (slider, sponsors wheel, event carousel)
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  /* 1) Polaroid sliding rotator (center hero) */
  const POLAROID_IMAGES = [
    "assets/images/Home_Page/slideshow1.jpg",
    "assets/images/Home_Page/slideshow2.jpg",
    "assets/images/Home_Page/slideshow3.jpg",
    "assets/images/Home_Page/slideshow4.jpg",
    "assets/images/Home_Page/slideshow5.jpg",
    "assets/images/Home_Page/slideshow6.jpg",
  ];

  setupPolaroidSlider({
    frameSelector: ".polaroid .frame",
    images: POLAROID_IMAGES,
    intervalMs: 3500,
    slideMs: 600,
  });

  /* 2) Sponsors auto-scrolling wheel */
  setupSponsorsWheel({
    railSelector: ".sponsor-carousel",
    speedPxPerFrame: 0.75,
  });

  /* 3) Event flyers carousel w/ arrows */
  setupEventCarousel({
    rootSelector: ".next-event .event-carousel",
  });
});

/* ============================================================
   Polaroid slider (creates a two-slide track and slides left)
   ============================================================ */
function setupPolaroidSlider({ frameSelector, images, intervalMs = 3500, slideMs = 600 }) {
  const frame = document.querySelector(frameSelector);
  if (!frame || !images || !images.length) return;

  // Ensure the frame clips its contents
  frame.style.overflow = frame.style.overflow || "hidden";

  // Track with two slides (we recycle sources)
  const track = document.createElement("div");
  Object.assign(track.style, {
    display: "flex",
    width: "200%",               // two slides side-by-side
    height: "100%",
    transform: "translateX(0)",
    transition: `transform ${slideMs}ms ease`,
  });

  const slideA = document.createElement("img");
  const slideB = document.createElement("img");

  [slideA, slideB].forEach((img) => {
    Object.assign(img.style, {
      flex: "0 0 50%",            // each slide = half the track
      width: "50%",
      height: "100%",
      objectFit: "cover",
      display: "block",
      borderRadius: "8px",
    });
    img.alt = "UT SHPE Photos";
    img.decoding = "async";
    img.loading = "eager";
  });

  let idx = 0;
  slideA.src = images[idx];
  slideB.src = images[(idx + 1) % images.length];

  track.appendChild(slideA);
  track.appendChild(slideB);

  // Replace any previous content
  frame.innerHTML = "";
  frame.appendChild(track);

  const tick = () => {
    // Slide left by exactly one slide (50% of the track)
    track.style.transform = "translateX(-50%)";

    const onDone = () => {
      idx = (idx + 1) % images.length;

      // B is now visible; rotate sources so A becomes current
      slideA.src = slideB.src;
      slideB.src = images[(idx + 1) % images.length];

      // Reset position (no anim), then re-enable transition
      track.style.transition = "none";
      track.style.transform = "translateX(0)";
      // Force reflow so the next transition applies
      void track.offsetHeight;
      track.style.transition = `transform ${slideMs}ms ease`;
    };

    track.addEventListener("transitionend", onDone, { once: true });
  };

  let timer = setInterval(tick, intervalMs);

  // Pause on hover (optional)
  frame.addEventListener("mouseenter", () => clearInterval(timer));
  frame.addEventListener("mouseleave", () => (timer = setInterval(tick, intervalMs)));
}

/* ============================================================
   Sponsors wheel – smooth, continuous horizontal scroll
   ============================================================ */
function setupSponsorsWheel({ railSelector, speedPxPerFrame = 0.6 }) {
  const rail = document.querySelector(railSelector);
  if (!rail) return;

  // Make sure it scrolls horizontally
  rail.style.whiteSpace = "nowrap";
  rail.style.overflow = "hidden";
  rail.style.scrollBehavior = "auto";

  // Convert children to inline-flex so nowrap works cleanly
  [...rail.children].forEach((el) => {
    el.style.display = "inline-flex";
    el.style.verticalAlign = "middle";
  });

  // Duplicate children so we can loop seamlessly
  const initialChildren = [...rail.children].map((n) => n.cloneNode(true));
  initialChildren.forEach((n) => rail.appendChild(n));

  const totalWidth = () => rail.scrollWidth / 2; // width of one full set

  let rafId;
  let paused = false;

  const step = () => {
    if (!paused) {
      rail.scrollLeft += speedPxPerFrame;
      if (rail.scrollLeft >= totalWidth()) {
        rail.scrollLeft = 0; // loop
      }
    }
    rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);

  // Pause on hover
  rail.addEventListener("mouseenter", () => (paused = true));
  rail.addEventListener("mouseleave", () => (paused = false));

  // Pointer drag (optional)
  let isDown = false, startX = 0, startLeft = 0;
  rail.addEventListener("pointerdown", (e) => {
    isDown = true;
    paused = true;
    startX = e.clientX;
    startLeft = rail.scrollLeft;
    rail.setPointerCapture(e.pointerId);
  });
  rail.addEventListener("pointermove", (e) => {
    if (!isDown) return;
    rail.scrollLeft = startLeft - (e.clientX - startX);
  });
  rail.addEventListener("pointerup", (e) => {
    isDown = false;
    paused = false;
    rail.releasePointerCapture(e.pointerId);
  });
}

/* ============================================================
   Event flyers – prev/next arrows on a simple track
   ============================================================ */
function setupEventCarousel({ rootSelector }) {
  const root = document.querySelector(rootSelector);
  if (!root) return;

  const track = root.querySelector(".event-track");
  const btnPrev = root.querySelector(".carousel-btn.prev");
  const btnNext = root.querySelector(".carousel-btn.next");
  if (!track || !btnPrev || !btnNext) return;

  const slides = [...track.children];
  if (!slides.length) return;

  track.style.display = "flex";
  track.style.gap = "0";
  track.style.transition = "transform 350ms ease";

  let index = 0;

  const slideWidth = () => slides[0].getBoundingClientRect().width;
  const goTo = (i) => {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(${-index * slideWidth()}px)`;
  };

  btnPrev.addEventListener("click", () => goTo(index - 1));
  btnNext.addEventListener("click", () => goTo(index + 1));

  // Swipe support (optional)
  let startX = 0, dragging = false;
  track.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    track.style.transform = `translateX(${ -index * slideWidth() + dx }px)`;
  });
  track.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (dx > 60) goTo(index - 1);
    else if (dx < -60) goTo(index + 1);
    else goTo(index);
    track.releasePointerCapture(e.pointerId);
  });

  window.addEventListener("resize", () => goTo(index));
  goTo(0);
}
