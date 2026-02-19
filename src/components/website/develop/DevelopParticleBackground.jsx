"use client";

import { useEffect, useRef } from "react";

/**
 * DevelopParticleBackground - Canvas-based animated code symbol system
 * Creates floating code symbols ({ }, < >, [], ;) for the Develop page
 * Uses the develop page's blue color theme
 */
export default function DevelopParticleBackground({ className = "" }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let particles = [];

        // Develop page color palette (blue)
        const colors = [
            "#3B82F6", // Primary blue
            "#2563EB", // Stronger blue
            "#60A5FA", // Light blue
            "#93C5FD", // Lighter blue
            "#1D4ED8", // Dark blue
        ];

        // Code symbols
        const codeSymbols = [
            "{ }",
            "< >",
            "[ ]",
            "( )",
            "//",
            "=>",
            ";",
            "&&",
            "||",
            "!=",
            "</>",
            ":=",
            "++",
            "--",
        ];

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        // Particle class
        class CodeParticle {
            constructor() {
                this.reset();
                // Randomize initial Y to fill screen
                this.y = Math.random() * canvas.height;
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + 20; // Start below screen
                this.size = Math.random() * 14 + 10; // Font size
                this.speedY = (Math.random() * 0.5 + 0.2) * -1; // Move up
                this.speedX = (Math.random() - 0.5) * 0.2; // Slight drift
                this.rotation = (Math.random() - 0.5) * 0.2;
                this.opacity = Math.random() * 0.5 + 0.1;
                this.fadeSpeed = Math.random() * 0.003 + 0.001;
                this.symbol = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.font = `bold ${this.size}px "JetBrains Mono", "Fira Code", monospace`;
            }

            update() {
                this.y += this.speedY; // Move up
                this.x += this.speedX; // Drift

                // Fade in/out
                this.opacity += (Math.random() - 0.5) * 0.01;
                if (this.opacity < 0.1) this.opacity = 0.1;
                if (this.opacity > 0.6) this.opacity = 0.6;

                // Reset when off screen (top)
                if (this.y < -50) {
                    this.reset();
                }

                // Horizontal wrap
                if (this.x < -50) this.x = canvas.width + 50;
                if (this.x > canvas.width + 50) this.x = -50;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.globalAlpha = this.opacity;
                ctx.fillStyle = this.color;
                ctx.font = this.font;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(this.symbol, 0, 0);
                ctx.restore();
            }
        }

        // Initialize particles
        function initParticles() {
            const particleCount = Math.min(60, Math.floor((canvas.width * canvas.height) / 25000));
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new CodeParticle());
            }
        }

        // Draw connections (circuit style - straight lines)
        function drawConnections() {
            const maxDistance = 150;

            for (let i = 0; i < particles.length; i++) {
                // Only connect some particles to avoid clutter
                if (i % 2 !== 0) continue;

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.1;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(59, 130, 246, ${opacity})`; // Blue
                        ctx.lineWidth = 0.5;

                        // Straight lines ? No, direct is fine for now
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation loop
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
            className={`develop-particle-background ${className}`}
            aria-hidden="true"
        />
    );
}
