import gsap from 'gsap'

export function initCursor() {
  const cursor = document.querySelector('.cursor') as HTMLElement
  const follower = document.querySelector('.cursor-follower') as HTMLElement
  const previewImg = document.querySelector('.hover-img') as HTMLImageElement

  if (!cursor) return

  let mouseX = 0
  let mouseY = 0
  let followerX = 0
  let followerY = 0

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY

    gsap.to(cursor, {
      x: mouseX - 4,
      y: mouseY - 4,
      duration: 0.1,
      ease: 'power2.out'
    })
  })

  function animateFollower() {
    const dx = mouseX - followerX
    const dy = mouseY - followerY

    followerX += dx * 0.12
    followerY += dy * 0.12

    gsap.set(follower, {
      x: followerX - 16,
      y: followerY - 16
    })

    requestAnimationFrame(animateFollower)
  }

  if (follower) {
    animateFollower()
  }

  // Expand cursor on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, .project-card, .cert-card, .tag')

  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      follower?.classList.add('expanded')
      cursor.style.transform = 'scale(0.5)'
    })

    el.addEventListener('mouseleave', () => {
      follower?.classList.remove('expanded')
      cursor.style.transform = 'scale(1)'
    })
  })

  // Project preview image
  if (previewImg) {
    const projectLinks = document.querySelectorAll('.hover-trigger') as NodeListOf<HTMLElement>

    if (projectLinks.length > 0) {
      const moveX = gsap.quickTo(previewImg, 'x', { duration: 0.4, ease: 'power3' })
      const moveY = gsap.quickTo(previewImg, 'y', { duration: 0.4, ease: 'power3' })

      projectLinks.forEach((link) => {
        link.addEventListener('mouseenter', () => {
          const imageUrl = link.getAttribute('data-image')
          const projectName = link.querySelector('h3')?.textContent || 'Projeto'

          if (imageUrl) previewImg.src = imageUrl
          previewImg.alt = `Preview do projeto ${projectName}`

          gsap.to(previewImg, { opacity: 1, scale: 1, duration: 0.3 })
          gsap.to(cursor, { opacity: 0, duration: 0.3 })
          gsap.to(follower, { opacity: 0, duration: 0.3 })
        })

        link.addEventListener('mouseleave', () => {
          gsap.to(previewImg, { opacity: 0, scale: 0.8, duration: 0.3 })
          gsap.to(cursor, { opacity: 1, duration: 0.3 })
          gsap.to(follower, { opacity: 1, duration: 0.3 })
        })

        link.addEventListener('mousemove', (e: MouseEvent) => {
          moveX(e.clientX + 30)
          moveY(e.clientY - 100)
        })
      })
    }
  }
}
