/* UT SHPE – Homepage interactions (robust/ES5-compatible) */
document.addEventListener("DOMContentLoaded", function () {
  // 1) Polaroid sliding rotator
  var POLAROID_IMAGES = [
    "assets/images/Home_Page/slideshow1.jpg",
    "assets/images/Home_Page/slideshow2.jpg",
    "assets/images/Home_Page/slideshow3.jpg",
    "assets/images/Home_Page/slideshow4.jpg",
    "assets/images/Home_Page/slideshow5.jpg",
    "assets/images/Home_Page/slideshow6.jpg"
  ];

  setupPolaroidSlider({
    frameSelector: ".polaroid .frame",
    images: POLAROID_IMAGES,
    intervalMs: 3500,
    slideMs: 600
  });

  // 2) Sponsors auto-scrolling wheel
  setupSponsorsWheel({
    railSelector: ".sponsor-carousel",
    speedPxPerFrame: 0.75
  });

  // 3) Event flyers arrows
  setupEventCarousel({
    rootSelector: ".next-event .event-carousel"
  });
});

/* ---------- Helpers ---------- */
function whenImageLoaded(img) {
  return new Promise(function (resolve) {
    if (img.complete) return resolve();
    img.onload = img.onerror = function () { resolve(); };
  });
}

/* ---------- Polaroid slider ---------- */
function setupPolaroidSlider(opts) {
  var frame = document.querySelector(opts.frameSelector);
  var images = opts.images || [];
  var intervalMs = opts.intervalMs || 3500;
  var slideMs = opts.slideMs || 600;

  if (!frame || !images.length) return;

  var track = document.createElement("div");
  track.style.display = "flex";
  track.style.width = "200%";
  track.style.height = "100%";
  track.style.transform = "translateX(0)";
  track.style.transition = "transform " + slideMs + "ms ease";

  var slideA = document.createElement("img");
  var slideB = document.createElement("img");
  [slideA, slideB].forEach(function (img) {
    img.style.width = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "8px";
    img.style.display = "block";
  });

  var idx = 0;
  slideA.src = images[idx];
  slideB.src = images[(idx + 1) % images.length];

  frame.innerHTML = "";
  frame.appendChild(track);
  track.appendChild(slideA);
  track.appendChild(slideB);

  Promise.all([whenImageLoaded(slideA), whenImageLoaded(slideB)]).then(function () {
    var timer;
    function tick() {
      track.style.transform = "translateX(-100%)";
      track.addEventListener("transitionend", function onDone() {
        track.removeEventListener("transitionend", onDone);
        idx = (idx + 1) % images.length;
        slideA.src = slideB.src;
        slideB.src = images[(idx + 1) % images.length];

        track.style.transition = "none";
        track.style.transform = "translateX(0)";
        // force reflow
        void track.offsetHeight;
        track.style.transition = "transform " + slideMs + "ms ease";
      }, { once: true });
    }
    timer = setInterval(tick, intervalMs);
    frame.addEventListener("mouseenter", function () { clearInterval(timer); });
    frame.addEventListener("mouseleave", function () { timer = setInterval(tick, intervalMs); });
  });
}

/* ---------- Sponsors wheel (continuous) ---------- */
function setupSponsorsWheel(opts) {
  var rail = document.querySelector(opts.railSelector);
  var speed = typeof opts.speedPxPerFrame === "number" ? opts.speedPxPerFrame : 0.6;
  if (!rail) return;

  // bail out if no children (prevents infinite loops)
  if (!rail.children || !rail.children.length) return;

  rail.style.whiteSpace = "nowrap";
  rail.style.overflow = "hidden";
  rail.style.scrollBehavior = "auto";
  if (!rail.style.gap) rail.style.gap = "20px";

  Array.prototype.forEach.call(rail.children, function (el) {
    el.style.display = "inline-flex";
  });

  function wrapWidth() { return rail.scrollWidth; }
  function neededWidth() { return rail.clientWidth * 2.2; }

  // duplicate a limited number of times to avoid any chance of infinite looping
  var safety = 0;
  while (wrapWidth() < neededWidth() && safety < 8) {
    var snapshot = Array.prototype.slice.call(rail.children);
    snapshot.forEach(function (node) { rail.appendChild(node.cloneNode(true)); });
    safety++;
  }

  var paused = false;
  function step() {
    if (!paused) {
      rail.scrollLeft += speed;
      if (rail.scrollLeft >= wrapWidth() / 2) rail.scrollLeft = 0;
    }
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);

  rail.addEventListener("mouseenter", function () { paused = true; });
  rail.addEventListener("mouseleave", function () { paused = false; });
  document.addEventListener("visibilitychange", function () {
    paused = document.hidden;
  });

  // simple drag
  var dragging = false, startX = 0, startLeft = 0;
  rail.addEventListener("pointerdown", function (e) {
    dragging = true; paused = true;
    startX = e.clientX; startLeft = rail.scrollLeft;
    rail.setPointerCapture(e.pointerId);
  });
  rail.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    rail.scrollLeft = startLeft - (e.clientX - startX);
  });
  rail.addEventListener("pointerup", function (e) {
    dragging = false; paused = false;
    rail.releasePointerCapture(e.pointerId);
  });
}

/* ---------- Event flyers arrows ---------- */
function setupEventCarousel(opts) {
  var root = document.querySelector(opts.rootSelector);
  if (!root) return;

  var track = root.querySelector(".event-track");
  var btnPrev = root.querySelector(".carousel-btn.prev");
  var btnNext = root.querySelector(".carousel-btn.next");
  if (!track || !btnPrev || !btnNext) return;

  var slides = Array.prototype.slice.call(track.children);
  if (!slides.length) return;

  track.style.display = "flex";
  track.style.gap = "0";
  track.style.transition = "transform 350ms ease";

  var index = 0;
  function slideWidth() { return slides[0].getBoundingClientRect().width; }
  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = "translateX(" + (-index * slideWidth()) + "px)";
  }

  btnPrev.addEventListener("click", function () { goTo(index - 1); });
  btnNext.addEventListener("click", function () { goTo(index + 1); });

  // swipe
  var startX = 0, dragging = false;
  track.addEventListener("pointerdown", function (e) {
    dragging = true; startX = e.clientX;
    track.setPointerCapture(e.pointerId);
  });
  track.addEventListener("pointermove", function (e) {
    if (!dragging) return;
    var dx = e.clientX - startX;
    track.style.transform = "translateX(" + (-index * slideWidth() + dx) + "px)";
  });
  track.addEventListener("pointerup", function (e) {
    if (!dragging) return;
    dragging = false;
    var dx = e.clientX - startX;
    if (dx > 60) goTo(index - 1);
    else if (dx < -60) goTo(index + 1);
    else goTo(index);
    track.releasePointerCapture(e.pointerId);
  });

  // after images load + on resize
  Promise.all(slides.map(whenImageLoaded)).then(function () { goTo(0); });
  window.addEventListener("resize", function () { goTo(index); });
}
