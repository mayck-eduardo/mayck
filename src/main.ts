import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import { initCursor } from './cursor'

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

// --- 4. CURSOR & RASTRO ---
initCursor();