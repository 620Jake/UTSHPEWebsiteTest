(function(){
  const box = document.querySelector('.ev-auto');
  if (!box) return;
  const slides = Array.from(box.querySelectorAll('img'));
  let i = 0, timer = null;
  const N = slides.length;

  function render(){
    slides.forEach((img, k)=> img.classList.toggle('is-active', k === i));
  }
  function next(){ i = (i + 1) % N; render(); }

  function play(){ if (!timer) timer = setInterval(next, 3500); }
  function pause(){ if (timer){ clearInterval(timer); timer = null; } }

  // start
  render(); play();


  // swipe
  let sx = 0, dx = 0;
  box.addEventListener('touchstart', e=>{ sx = e.touches[0].clientX; dx = 0; pause(); }, {passive:true});
  box.addEventListener('touchmove',  e=>{ dx = e.touches[0].clientX - sx; }, {passive:true});
  box.addEventListener('touchend',   ()=>{ if (Math.abs(dx) > 40) next(); play(); });
})();
