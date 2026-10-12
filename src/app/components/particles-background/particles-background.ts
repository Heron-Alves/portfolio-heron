
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

@Component({
  selector: 'app-particles-background',
  standalone: true,
  templateUrl: './particles-background.html',
  styleUrl: './particles-background.scss',
})
export class ParticlesBackground implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private zone = inject(NgZone);

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;

  private particles: Particle[] = [];
  private frameId = 0;
  private width = 0;
  private height = 0;
  private dpr = 1;

  private mouse = { x: -1000, y: -1000 };
  private reducedMotion = false;

  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.canvas = this.canvasRef.nativeElement;

    const context = this.canvas.getContext('2d');
    if (!context) return;

    this.ctx = context;
    this.reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    this.zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.canvas.parentElement!);

      window.addEventListener('pointermove', this.onPointerMove, {
        passive: true,
      });

      window.addEventListener('pointerout', this.onPointerOut);

      this.resize();

      if (!this.reducedMotion) {
        this.animate();
      }
    });
  }

  private resize(): void {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();

    this.width = rect.width;
    this.height = rect.height;

    if (this.width <= 0 || this.height <= 0) return;

    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    const count = Math.min(
      160,
      Math.max(55, Math.floor((this.width * this.height) / 7500))
    );

    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32,
    }));

    if (this.reducedMotion) {
      this.draw();
    }
  }

  private onPointerMove = (event: PointerEvent): void => {
    const rect = this.canvas.getBoundingClientRect();

    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  };

  private onPointerOut = (event: PointerEvent): void => {
    if (!event.relatedTarget) {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    }
  };

  private animate = (): void => {
    this.update();
    this.draw();

    this.frameId = requestAnimationFrame(this.animate);
  };

  private update(): void {
    for (const p of this.particles) {
      const dx = p.x - this.mouse.x;
      const dy = p.y - this.mouse.y;
      const distance = Math.hypot(dx, dy);

      if (distance < 120 && distance > 0) {
        const force = (120 - distance) / 120;

        p.vx += (dx / distance) * force * 0.018;
        p.vy += (dy / distance) * force * 0.018;
      }

      p.vx *= 0.995;
      p.vy *= 0.995;

      const speed = Math.hypot(p.vx, p.vy);
      if (speed > 0.65) {
        p.vx = (p.vx / speed) * 0.65;
        p.vy = (p.vy / speed) * 0.65;
      }

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.height) p.vy *= -1;

      p.x = Math.max(0, Math.min(this.width, p.x));
      p.y = Math.max(0, Math.min(this.height, p.y));
    }
  }

  private draw(): void {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const maxDistance = 155;

    for (let i = 0; i < this.particles.length; i++) {
      const a = this.particles[i];

      for (let j = i + 1; j < this.particles.length; j++) {
        const b = this.particles[j];

        const distance = Math.hypot(a.x - b.x, a.y - b.y);

        if (distance >= maxDistance) continue;

        const opacity = (1 - distance / maxDistance) * 0.17;

        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgba(184,255,61,${opacity})`;
        this.ctx.lineWidth = 0.6;
        this.ctx.moveTo(a.x, a.y);
        this.ctx.lineTo(b.x, b.y);
        this.ctx.stroke();
      }
    }

    for (const p of this.particles) {
      this.ctx.beginPath();
      this.ctx.fillStyle = 'rgba(220,230,220,0.42)';
      this.ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  ngOnDestroy(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    cancelAnimationFrame(this.frameId);
    this.resizeObserver?.disconnect();

    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerout', this.onPointerOut);
  }
}
