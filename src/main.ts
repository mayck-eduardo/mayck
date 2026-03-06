import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'

// 1. SETUP DO LENIS
const lenis = new Lenis({
  duration: 2.4, // Aumentado para mais suavidade
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
})
function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// 2. REGISTRAR GSAP
gsap.registerPlugin(ScrollTrigger)

// --- 3. LÓGICA DO PRELOADER (NOVO) ---
const tl = gsap.timeline();

// Passo A: Anima o texto de carregamento
tl.to(".preloader-text", {
  opacity: 1,
  duration: 1,
  stagger: 0.2
})
// Passo B: Some com o texto
.to(".preloader-text", {
  opacity: 0,
  duration: 0.5,
  delay: 0.5
})
// Passo C: Levanta a cortina preta
.to(".preloader", {
  y: "-100%",
  duration: 1,
  ease: "power4.inOut"
})
// Passo D: Chama a animação do conteúdo (Hero)
.add(() => {
  revealContent();
})

// Função que revela o conteúdo (Hero)
function revealContent() {
  gsap.from(".reveal", {
    y: 100,
    opacity: 0,
    duration: 1.5,
    stagger: 0.2,
    ease: "power4.out"
  })
}

// Animação das Seções (ScrollTrigger) - Apenas em resoluções maiores
let mm = gsap.matchMedia();

mm.add("(min-width: 769px)", () => {
  const items = document.querySelectorAll('.project-row, .edu-item')
  items.forEach((item) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: "top 85%",
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: "power2.out"
    })
  })
});

// --- 4. CURSOR, RASTRO & IMAGEM (OTIMIZADO) ---
const cursor = document.querySelector('.cursor') as HTMLElement;
const projectLinks = document.querySelectorAll('.hover-trigger') as NodeListOf<HTMLElement>;
const previewImg = document.querySelector('.hover-img') as HTMLImageElement;

// Cria o elemento Canvas para o rastro, se não existir
let canvas = document.querySelector('.pointer-trail') as HTMLCanvasElement;
if (!canvas) {
  canvas = document.createElement('canvas');
  canvas.classList.add('pointer-trail');
  document.body.appendChild(canvas);
}
const ctx = canvas.getContext('2d');
let points: {x: number, y: number, life: number}[] = [];
let mouseX = 0;
let mouseY = 0;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // chamadinha inicial

// Movimento do Cursor & Rastro
if (cursor) {
  window.addEventListener('mousemove', (e: MouseEvent) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Adiciona o novo ponto no topo do array de rastro
    points.push({ x: mouseX, y: mouseY, life: 1 });

    gsap.to(cursor, {
      x: mouseX - 7,
      y: mouseY - 7,
      duration: 0.1,
      ease: "power2.out"
    })
  })
}

// Render do Rastro
function renderTrail() {
  if (!ctx) return;
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Limpa pontos antigos para não estourar a memória
  points = points.filter(p => p.life > 0.05);

  if (points.length > 1) {
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
        const point = points[i];
        // Reduz a vida daquele ponto
        point.life -= 0.04; 

        // Desenha a linha com opacidade que diminui com a "vida"
        ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = `rgba(255, 255, 255, ${point.life})`;
        ctx.lineWidth = 3 * point.life;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
    }
  }
  requestAnimationFrame(renderTrail);
}
renderTrail();

// Lógica da Imagem Preview
if (previewImg && projectLinks.length > 0) {
  const moveX = gsap.quickTo(previewImg, "x", { duration: 0.4, ease: "power3" });
  const moveY = gsap.quickTo(previewImg, "y", { duration: 0.4, ease: "power3" });

  projectLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      const imageUrl = link.getAttribute('data-image');
      const projectName = link.querySelector('h2')?.textContent || 'Projeto';
      
      if (imageUrl) previewImg.src = imageUrl;
      previewImg.alt = `Preview do projeto ${projectName}`;

      gsap.to(previewImg, { opacity: 1, scale: 1, duration: 0.3 });
      if (cursor) gsap.to(cursor, { scale: 3, duration: 0.3, mixBlendMode: 'normal' });
    });

    link.addEventListener('mouseleave', () => {
      gsap.to(previewImg, { opacity: 0, scale: 0.8, duration: 0.3 });
      if (cursor) gsap.to(cursor, { scale: 1, duration: 0.3, mixBlendMode: 'difference' });
    });

    link.addEventListener('mousemove', (e: MouseEvent) => {
      moveX(e.clientX + 30);
      moveY(e.clientY - 110);
    });
  });
}