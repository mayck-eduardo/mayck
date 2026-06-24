import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import { initCursor } from './cursor'

const lenis = new Lenis({
  duration: 2.4,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
})
function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

gsap.registerPlugin(ScrollTrigger)

const tl = gsap.timeline();

tl.to(".preloader-text", {
  opacity: 1,
  duration: 1,
  stagger: 0.2
})
.to(".preloader-text", {
  opacity: 0,
  duration: 0.5,
  delay: 0.5
})
.to(".preloader", {
  y: "-100%",
  duration: 1,
  ease: "power4.inOut"
})
.add(() => {
  revealContent();
})

function revealContent() {
  gsap.from(".reveal", {
    y: 100,
    opacity: 0,
    duration: 1.5,
    stagger: 0.2,
    ease: "power4.out"
  })
}

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

initCursor();
