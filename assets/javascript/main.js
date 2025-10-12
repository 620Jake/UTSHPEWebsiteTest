/* 
   UT SHPE – Homepage 
*/

document.addEventListener("DOMContentLoaded", () => {
  /* ------------------------------
     1) Polaroid sliding rotator
     ------------------------------ */
  // 👉 Put your image paths here (order shown is the loop order)
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

  /* ------------------------------
     2) Sponsors auto-scrolling wheel
     ------------------------------ */
  setupSponsorsWheel({
    railSelector: ".sponsor-carousel",
    speedPxPerFrame: 0.75,  // increase to scroll faster
  });

  /* ------------------------------
     3) Event flyers arrows
     ------------------------------ */
  setupEventCarousel({
    rootSelector: ".next-event .event-carousel",
  });
});

/* ============================================================
   Polaroid slider (creates a horizontal track and slides)
   ============================================================ */
function setupPolaroidSlider({ frameSelector, images, intervalMs = 3500, slideMs = 600 }) {
  const frame = document.querySelector(frameSelector);
  if (!frame || !images?.length) return;

  // Create track (two slides: current + next, we reuse them)
  const track = document.createElement("div");
  Object.assign(track.style, {
    display: "flex",
    width: "200%",
    height: "100%",
    transform: "translateX(0)",
    transition: `transform ${slideMs}ms ease`,
  });

  const slideA = document.createElement("img");
  const slideB = document.createElement("img");
  [slideA, slideB].forEach((img) => {
    Object.assign(img.style, {
      width: "100%",
      objectFit: "cover",
      borderRadius: "8px",
    });
  });

  let idx = 0;
  slideA.src = images[idx];
  slideB.src = images[(idx + 1) % images.length];

  track.appendChild(slideA);
  track.appendChild(slideB);

  // Replace whatever was in the frame with our track
  frame.innerHTML = "";
  // padding is already on .frame; ensure no extra layout shift
  frame.appendChild(track);

  const tick = () => {
    // slide to the left
    track.style.transform = "translateX(-100%)";

    const onDone = () => {
      // rotate: A falls off, B becomes A
      idx = (idx + 1) % images.length;
      slideA.src = slideB.src;
      slideB.src = images[(idx + 1) % images.length];

      // reset without anim, then re-enable transition
      track.style.transition = "none";
      track.style.transform = "translateX(0)";
      // force reflow
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

  // Make sure it scrolls horizontally (CSS safety net)
  rail.style.whiteSpace = "nowrap";
  rail.style.overflow = "hidden";
  rail.style.scrollBehavior = "auto"; // we control it
  rail.style.gap = rail.style.gap || "20px";

  // Convert children to inline-block so nowrap works cleanly
  [...rail.children].forEach((el) => {
    el.style.display = "inline-flex";
  });

  // Duplicate logos until we have enough content to loop seamlessly
  const wrapWidth = () => rail.scrollWidth;
  const neededWidth = () => rail.clientWidth * 2.2; // a bit more than 2x
  while (wrapWidth() < neededWidth()) {
    [...rail.children].forEach((node) => rail.appendChild(node.cloneNode(true)));
  }

  let rafId;
  let paused = false;

  const step = () => {
    if (!paused) {
      rail.scrollLeft += speedPxPerFrame;
      // Loop back when we’ve scrolled through first “copy”
      if (rail.scrollLeft >= (wrapWidth() / 2)) {
        rail.scrollLeft = 0;
      }
    }
    rafId = requestAnimationFrame(step);
  };
  rafId = requestAnimationFrame(step);

  // Pause on hover
  rail.addEventListener("mouseenter", () => (paused = true));
  rail.addEventListener("mouseleave", () => (paused = false));

  // Touch drag (optional)
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
   Event flyers – prev/next arrows
   HTML you already have:
   .event-carousel > .event-track (img,img,...) and two buttons
   .carousel-btn.prev / .carousel-btn.next
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

  // Ensure no gaps between slides (safety)
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

  // Keep position correct on resize
  window.addEventListener("resize", () => goTo(index));
  // Initialize
  goTo(0);
}

