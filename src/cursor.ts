import gsap from 'gsap';

export function initCursor() {
    // 1. Cria ou recupra o ponto do cursor principal
    let cursor = document.querySelector('.cursor') as HTMLElement;
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.classList.add('cursor');
        document.body.appendChild(cursor);
    }
    
    // 2. Cria o Canvas para o rastro branco
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
    resizeCanvas(); // Chamada Inicial

    window.addEventListener('mousemove', (e: MouseEvent) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        points.push({ x: mouseX, y: mouseY, life: 1 });

        gsap.to(cursor, {
          x: mouseX - 7,
          y: mouseY - 7,
          duration: 0.1,
          ease: "power2.out"
        });
    });

    function renderTrail() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      points = points.filter(p => p.life > 0.05);

      if (points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            const point = points[i];
            point.life -= 0.04; 
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

    // 3. Lógica da Imagem Preview Hover (se existir na página atual)
    const projectLinks = document.querySelectorAll('.hover-trigger') as NodeListOf<HTMLElement>;
    const previewImg = document.querySelector('.hover-img') as HTMLImageElement;
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
}
