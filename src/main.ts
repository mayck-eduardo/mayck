import './style.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import { initCursor } from './cursor'

gsap.registerPlugin(ScrollTrigger)

// ===================================
// LENIS SMOOTH SCROLL
// ===================================

const lenis = new Lenis({
  duration: 1.8,
  easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
})

function raf(time: number) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}
requestAnimationFrame(raf)

// Sync Lenis with ScrollTrigger
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})
gsap.ticker.lagSmoothing(0)

// ===================================
// PRELOADER
// ===================================

const tl = gsap.timeline({
  onComplete: () => {
    document.querySelector('.preloader')?.classList.add('loaded')
    document.querySelector('.navbar')?.classList.add('visible')
    initHeroAnimations()
  }
})

tl.to('.preloader-logo', {
  opacity: 1,
  duration: 0.8,
  ease: 'power2.out'
})

tl.to('.preloader-progress', {
  width: '100%',
  duration: 1.5,
  ease: 'power2.inOut'
}, '-=0.4')

tl.to('.preloader-logo, .preloader-bar', {
  opacity: 0,
  duration: 0.4,
  ease: 'power2.in'
})

tl.to('.preloader', {
  yPercent: -100,
  duration: 1,
  ease: 'power4.inOut'
})

// ===================================
// HERO ANIMATIONS
// ===================================

function initHeroAnimations() {
  const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } })

  heroTl.to('.hero-badge', {
    opacity: 1,
    y: 0,
    duration: 1
  })

  heroTl.to('.title-word', {
    y: 0,
    duration: 1.2,
    stagger: 0.15
  }, '-=0.6')

  heroTl.to('.hero-subtitle', {
    opacity: 1,
    y: 0,
    duration: 1
  }, '-=0.6')

  heroTl.to('.hero-footer', {
    opacity: 1,
    duration: 1
  }, '-=0.5')
}

// ===================================
// NAVBAR SCROLL BEHAVIOR
// ===================================

const navbar = document.getElementById('navbar')

window.addEventListener('scroll', () => {
  if (window.scrollY > 100) {
    navbar?.classList.add('scrolled')
  } else {
    navbar?.classList.remove('scrolled')
  }
})

// ===================================
// MOBILE MENU
// ===================================

const navToggle = document.getElementById('navToggle')
const mobileMenu = document.getElementById('mobileMenu')

navToggle?.addEventListener('click', () => {
  navToggle.classList.toggle('active')
  mobileMenu?.classList.toggle('open')
  document.body.style.overflow = mobileMenu?.classList.contains('open') ? 'hidden' : ''
})

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    navToggle?.classList.remove('active')
    mobileMenu?.classList.remove('open')
    document.body.style.overflow = ''
  })
})

// ===================================
// SMOOTH SCROLL NAV LINKS
// ===================================

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault()
    const target = document.querySelector(anchor.getAttribute('href') || '')
    if (target) {
      lenis.scrollTo(target as HTMLElement)
    }
  })
})

// ===================================
// SECTION REVEALS
// ===================================

let mm = gsap.matchMedia()

mm.add('(min-width: 769px)', () => {
  // About section
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

  // Metrics
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

  // Experience
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

  // Education
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

  // Projects
  gsap.from('.project-card', {
    scrollTrigger: {
      trigger: '.projects-grid',
      start: 'top 80%',
    },
    y: 50,
    opacity: 0,
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out'
  })

  // Footer
  gsap.from('.footer-cta', {
    scrollTrigger: {
      trigger: '.footer',
      start: 'top 75%',
    },
    y: 60,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  })

  gsap.from('.footer-bottom > *', {
    scrollTrigger: {
      trigger: '.footer-bottom',
      start: 'top 90%',
    },
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power3.out'
  })
})

// ===================================
// COUNTER ANIMATION
// ===================================

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

// ===================================
// CURSOR
// ===================================

initCursor()
