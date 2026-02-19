"use client";

import { useEffect, useRef } from "react";

/**
 * DeployParticleBackground - Canvas-based animated infrastructure system
 * Creates floating hexagons (infrastructure) and fast data particles (speed)
 * Uses the deploy page's green color theme
 */
export default function DeployParticleBackground({ className = "" }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let particles = [];

        // Deploy page color palette (green)
        const colors = [
            "#10B981", // Emerald 500
            "#059669", // Emerald 600
            "#34D399", // Emerald 400
            "#6EE7B7", // Emerald 300
            "#047857", // Emerald 700
        ];

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        // Particle class
        class DeployParticle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;

                // Two types: Infrastructure (Hexagon) or Data (Dot)
                this.isInfra = Math.random() > 0.7; // 30% are infra hexagons

                if (this.isInfra) {
                    this.size = Math.random() * 30 + 20; // Large
                    this.speedX = (Math.random() - 0.5) * 0.2; // Slow
                    this.speedY = (Math.random() - 0.5) * 0.2;
                    this.opacity = Math.random() * 0.2 + 0.05; // Faint
                } else {
                    this.size = Math.random() * 2 + 1; // Small dots
                    this.speedX = (Math.random() * 3 + 1) * (Math.random() > 0.5 ? 1 : -1); // Fast horizontal
                    this.speedY = (Math.random() - 0.5) * 0.5; // Little vertical
                    this.opacity = Math.random() * 0.5 + 0.3;
                }

                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.005;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.isInfra) {
                    this.rotation += this.rotationSpeed;
                }

                // Screen wrap
                if (this.x < -100) this.x = canvas.width + 100;
                if (this.x > canvas.width + 100) this.x = -100;
                if (this.y < -100) this.y = canvas.height + 100;
                if (this.y > canvas.height + 100) this.y = -100;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.globalAlpha = this.opacity;

                if (this.isInfra) {
                    // Draw Hexagon for infrastructure
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 1.5;
                    ctx.beginPath();
                    const sides = 6;
                    const angle = (Math.PI * 2) / sides;
                    ctx.moveTo(this.size, 0);
                    for (let i = 1; i <= sides; i++) {
                        ctx.lineTo(
                            this.size * Math.cos(angle * i),
                            this.size * Math.sin(angle * i)
                        );
                    }
                    ctx.closePath();
                    ctx.stroke();

                    // Optional inner detail
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size / 3, 0, Math.PI * 2);
                    ctx.fillStyle = this.color;
                    ctx.globalAlpha = this.opacity * 0.5;
                    ctx.fill();
                } else {
                    // Draw fast data dots
                    ctx.fillStyle = this.color; // Data is filled
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.fill();

                    // Trail effect for speed
                    ctx.globalAlpha = this.opacity * 0.5;
                    ctx.beginPath();
                    ctx.arc(-this.speedX * 2, -this.speedY * 2, this.size * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.restore();
            }
        }

        // Initialize particles
        function initParticles() {
            const particleCount = Math.min(70, Math.floor((canvas.width * canvas.height) / 20000));
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new DeployParticle());
            }
        }

        // Connect data to infra
        function drawConnections() {
            const maxDistance = 150;

            for (let i = 0; i < particles.length; i++) {
                if (!particles[i].isInfra) continue; // Only connect FROM infra

                for (let j = 0; j < particles.length; j++) {
                    if (particles[j].isInfra) continue; // Don't connect infra to infra

                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.15;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(16, 185, 129, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            drawConnections();

            particles.forEach((particle) => {
                particle.update();
                particle.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        if (!prefersReducedMotion) {
            handleResize();
            window.addEventListener("resize", handleResize);
            animate();
        }

        return () => {
            window.removeEventListener("resize", handleResize);
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`deploy-particle-background ${className}`}
            aria-hidden="true"
        />
    );
}
