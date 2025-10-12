// UT SHPE - Polaroid cross-fade slideshow
document.addEventListener("DOMContentLoaded", () => {
  const POLAROID_IMAGES = [
    "assets/images/Home_Page/slideshow1.jpg",
    "assets/images/Home_Page/slideshow2.jpg",
    "assets/images/Home_Page/slideshow3.jpg",
    "assets/images/Home_Page/slideshow4.jpg",
    "assets/images/Home_Page/slideshow5.jpg",
    "assets/images/Home_Page/slideshow6.jpg",
  ];

  setupPolaroidFader({
    frameSelector: ".polaroid .frame",
    images: POLAROID_IMAGES,
    intervalMs: 3500,   // time each image stays on screen
    fadeMs: 700         // fade duration
  });
});

function setupPolaroidFader({ frameSelector, images, intervalMs = 3500, fadeMs = 700 }) {
  const frame = document.querySelector(frameSelector);
  if (!frame || !images || images.length === 0) return;

  // Ensure the frame can stack images
  Object.assign(frame.style, {
    position: frame.style.position || "relative",
    overflow: "hidden"
  });

  // Create two stacked <img> tags
  const imgA = document.createElement("img");
  const imgB = document.createElement("img");

  [imgA, imgB].forEach((img) => {
    Object.assign(img.style, {
      position: "absolute",
      inset: "0",            // top:0 right:0 bottom:0 left:0
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "8px",
      transition: `opacity ${fadeMs}ms ease`,
      opacity: 0,
      display: "block"
    });
    img.alt = "UT SHPE Photos";
    img.decoding = "async";
    img.loading = "eager";
  });

  // Order: B on top of A
  frame.innerHTML = "";
  frame.appendChild(imgA);
  frame.appendChild(imgB);

  let idx = 0;
  let showingA = true;

  // Start with first image visible
  imgA.src = images[idx];
  imgA.style.opacity = 1;

  // Preload the rest quietly
  images.slice(1).forEach((src) => {
    const p = new Image();
    p.src = src;
  });

  const next = () => {
    idx = (idx + 1) % images.length;

    const topImg   = showingA ? imgB : imgA; // will fade in
    const bottomImg= showingA ? imgA : imgB; // will fade out

    topImg.src = images[idx];
    // Ensure the browser has applied the new src before fading
    requestAnimationFrame(() => {
      topImg.style.opacity = 1;
      bottomImg.style.opacity = 0;
      showingA = !showingA;
    });
  };

  let timer = setInterval(next, intervalMs);
}

// Event Flyers Carousel (Next/Prev + swipe + resize-safe)
document.addEventListener("DOMContentLoaded", () => {
  initEventCarousel(".next-event .event-carousel");
});

function initEventCarousel(rootSel) {
  const root = document.querySelector(rootSel);
  if (!root) return;

  const track   = root.querySelector(".event-track");
  const slides  = Array.from(track.children);
  const prevBtn = root.querySelector(".carousel-btn.prev");
  const nextBtn = root.querySelector(".carousel-btn.next");
  if (!slides.length || !prevBtn || !nextBtn) return;

  let index = 0;
  let slideW = getSlideWidth();

  function getSlideWidth() {
    const rect = slides[0].getBoundingClientRect();
    return Math.round(rect.width);
  }

  function goTo(i) {
    index = (i + slides.length) % slides.length; // wrap
    track.style.transform = `translateX(${-index * slideW}px)`;
  }

  function onPrev() { goTo(index - 1); }
  function onNext() { goTo(index + 1); }

  prevBtn.addEventListener("click", onPrev);
  nextBtn.addEventListener("click", onNext);

  // Swipe / drag
  let startX = 0, dragging = false, startTransformX = 0;
  track.addEventListener("pointerdown", (e) => {
    dragging = true;
    startX = e.clientX;
    startTransformX = -index * slideW;
    track.style.transition = "none";
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - startX;
    track.style.transform = `translateX(${startTransformX + dx}px)`;
  });
  track.addEventListener("pointerup", (e) => {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    track.style.transition = ""; // use CSS transition (0.3s) again
    if (dx > 60) onPrev();
    else if (dx < -60) onNext();
    else goTo(index);
    track.releasePointerCapture(e.pointerId);
  });

  // Keyboard support (focus the carousel then use arrows)
  root.tabIndex = 0;
  root.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft")  { e.preventDefault(); onPrev(); }
    if (e.key === "ArrowRight") { e.preventDefault(); onNext(); }
  });

  // Keep position correct on resize
  let rAF;
  function onResize() {
    cancelAnimationFrame(rAF);
    rAF = requestAnimationFrame(() => {
      slideW = getSlideWidth();
      goTo(index);
    });
  }
  window.addEventListener("resize", onResize);

  // Init
  goTo(0);
}

// ------------------------------
// Sponsors auto-scrolling wheel
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {
  setupSponsorsWheel({
    railSelector: ".sponsor-carousel",
    speedPxPerFrame: 0.75   // tweak speed here (pixels per frame)
  });
});

function setupSponsorsWheel({ railSelector, speedPxPerFrame = 0.6 }) {
  const rail = document.querySelector(railSelector);
  if (!rail) return;

  // Ensure correct layout (safety in case CSS isn't loaded yet)
  rail.style.overflow = "hidden";
  rail.style.whiteSpace = "nowrap";

  // Make sure children are inline blocks (or non-shrinking flex items)
  [...rail.children].forEach(el => {
    el.style.display = "inline-flex";
    el.style.flex = "0 0 auto";
  });

  // Duplicate children until we have at least ~2x width for seamless loop
  const needMoreContent = () => rail.scrollWidth < rail.clientWidth * 2.2;
  while (needMoreContent()) {
    [...rail.children].forEach(node => rail.appendChild(node.cloneNode(true)));
  }

  let paused = false;
  let rafId;

  const tick = () => {
    if (!paused) {
      rail.scrollLeft += speedPxPerFrame;
      // When we’ve scrolled through the first copy, snap back
      const half = Math.floor(rail.scrollWidth / 2);
      if (rail.scrollLeft >= half) rail.scrollLeft = 0;
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);


  // Pointer drag support
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
  const endDrag = (e) => {
    if (!isDown) return;
    isDown = false;
    paused = false;
    if (e && e.pointerId) rail.releasePointerCapture(e.pointerId);
  };
  rail.addEventListener("pointerup", endDrag);
  rail.addEventListener("pointercancel", endDrag);
  rail.addEventListener("pointerleave", endDrag);

  // Prevent vertical scroll interference on touch
  rail.style.touchAction = "pan-y";
}

