/* UT SHPE — Polaroid image slider (slide, no fade) */
document.addEventListener("DOMContentLoaded", function () {
  var IMAGES = [
    "assets/images/Home_Page/slideshow1.jpg",
    "assets/images/Home_Page/slideshow2.jpg",
    "assets/images/Home_Page/slideshow3.jpg",
    "assets/images/Home_Page/slideshow4.jpg",
    "assets/images/Home_Page/slideshow5.jpg",
    "assets/images/Home_Page/slideshow6.jpg"
  ];

  setupPolaroidSlider(".polaroid .frame", IMAGES, 3500, 600);
});


function setupPolaroidSlider(frameSelector, images, intervalMs, slideMs) {
  var frame = document.querySelector(frameSelector);
  if (!frame || !images || !images.length) return;

  // Track with two slides (we reuse them)
  var track = document.createElement("div");
  track.style.display    = "flex";
  track.style.width      = "200%";
  track.style.height     = "100%";
  track.style.transform  = "translateX(0)";
  track.style.transition = "transform " + (slideMs || 600) + "ms ease";

  var a = document.createElement("img");
  var b = document.createElement("img");
  [a, b].forEach(function (img) {
    img.style.width       = "100%";
    img.style.height      = "100%";
    img.style.objectFit   = "cover";
    img.style.borderRadius= "8px";
    img.style.display     = "block";
  });

  var i = 0;
  a.src = images[i];
  b.src = images[(i + 1) % images.length];

  frame.innerHTML = "";
  frame.appendChild(track);
  track.appendChild(a);
  track.appendChild(b);

  var timer;
  function start() { timer = setInterval(tick, intervalMs || 3500); }
  function stop()  { clearInterval(timer); }

  function tick() {
    track.style.transform = "translateX(-100%)";
    track.addEventListener("transitionend", onDone, { once: true });
  }

  function onDone() {
    i = (i + 1) % images.length;
    a.src = b.src;
    b.src = images[(i + 1) % images.length];

    track.style.transition = "none";
    track.style.transform  = "translateX(0)";
    // force reflow, then restore transition
    void track.offsetHeight;
    track.style.transition = "transform " + (slideMs || 600) + "ms ease";
  }

  start();
}
