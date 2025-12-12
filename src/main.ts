import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'

// 1. SETUP DO LENIS
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
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

// Animação das Seções (ScrollTrigger)
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

// --- 4. CURSOR & IMAGEM (OTIMIZADO) ---
const cursor = document.querySelector('.cursor') as HTMLElement;
const projectLinks = document.querySelectorAll('.hover-trigger') as NodeListOf<HTMLElement>;
const previewImg = document.querySelector('.hover-img') as HTMLImageElement;

// Movimento do Cursor
if (cursor) {
  window.addEventListener('mousemove', (e: MouseEvent) => {
    gsap.to(cursor, {
      x: e.clientX - 7,
      y: e.clientY - 7,
      duration: 0.1,
      ease: "power2.out"
    })
  })
}

// Lógica da Imagem Preview
if (previewImg && projectLinks.length > 0) {
  const moveX = gsap.quickTo(previewImg, "x", { duration: 0.4, ease: "power3" });
  const moveY = gsap.quickTo(previewImg, "y", { duration: 0.4, ease: "power3" });

  projectLinks.forEach((link) => {
    link.addEventListener('mouseenter', () => {
      const imageUrl = link.getAttribute('data-image');
      if (imageUrl) previewImg.src = imageUrl;

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