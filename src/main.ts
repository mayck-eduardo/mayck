import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import { initCursor } from './cursor'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({
  duration: 2.4,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
})
function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

const tl = gsap.timeline()

tl.to('.preloader-text', {
  opacity: 1,
  duration: 1,
  stagger: 0.2
})
.to('.preloader-text', {
  opacity: 0,
  duration: 0.5,
  delay: 0.5
})
.to('.preloader', {
  y: '-100%',
  duration: 1,
  ease: 'power4.inOut'
})
.add(() => {
  revealContent()
})

function revealContent() {
  gsap.from('.reveal', {
    y: 100,
    opacity: 0,
    duration: 1.5,
    stagger: 0.2,
    ease: 'power4.out'
  })
}

let mm = gsap.matchMedia()

mm.add('(min-width: 769px)', () => {
  gsap.from('.about-content', {
    scrollTrigger: {
      trigger: '.about-me',
      start: 'top 75%',
    },
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  })

  gsap.from('.about-sidebar > *', {
    scrollTrigger: {
      trigger: '.about-sidebar',
      start: 'top 80%',
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  })

  gsap.from('.metric-card', {
    scrollTrigger: {
      trigger: '.metrics',
      start: 'top 80%',
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
    onComplete: animateCounters
  })

  gsap.from('.exp-card', {
    scrollTrigger: {
      trigger: '.experience',
      start: 'top 75%',
    },
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  })

  gsap.from('.edu-item', {
    scrollTrigger: {
      trigger: '.education',
      start: 'top 75%',
    },
    y: 40,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out'
  })

  gsap.from('.cert-card', {
    scrollTrigger: {
      trigger: '.cert-grid',
      start: 'top 85%',
    },
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power3.out'
  })

  const items = document.querySelectorAll('.project-row')
  items.forEach((item) => {
    gsap.from(item, {
      scrollTrigger: {
        trigger: item,
        start: 'top 85%',
      },
      y: 50,
      opacity: 0,
      duration: 1,
      ease: 'power2.out'
    })
  })

  gsap.from('.contact', {
    scrollTrigger: {
      trigger: 'footer',
      start: 'top 75%',
    },
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  })
})

function animateCounters() {
  document.querySelectorAll('.metric-number').forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target') || '0')
    const duration = 2
    const start = performance.now()

    function update(now: number) {
      const elapsed = (now - start) / 1000
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)

      counter.textContent = Math.floor(eased * target).toString()

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        counter.textContent = target.toString()
      }
    }

    requestAnimationFrame(update)
  })
}

initCursor()
