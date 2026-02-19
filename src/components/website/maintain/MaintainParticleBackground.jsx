"use client";

import { useEffect, useRef } from "react";

/**
 * MaintainParticleBackground - Canvas-based animated health-monitoring system
 * Creates pulsing radar rings and shield-like particles for Maintain page
 * Uses the maintain page's orange/amber color theme
 */
export default function MaintainParticleBackground({ className = "" }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let particles = [];

        // Maintain page color palette (orange/amber)
        const colors = [
            "#F59E0B", // Amber 500
            "#D97706", // Amber 600
            "#FBBF24", // Amber 400
            "#B45309", // Amber 700
            "#fbbf24", // Amber 400
        ];

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        // Particle class
        class MaintainParticle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.maxSize = Math.random() * 40 + 20;
                this.size = Math.random() * this.maxSize;
                this.growthSpeed = Math.random() * 0.2 + 0.05;

                // Pulse effect or Shield effect
                this.isPulse = Math.random() > 0.4;

                this.opacity = Math.random() * 0.4 + 0.1;
                this.color = colors[Math.floor(Math.random() * colors.length)];

                // Movement is very stable/slow
                this.speedX = (Math.random() - 0.5) * 0.1;
                this.speedY = (Math.random() - 0.5) * 0.1;

                // Shield rotation
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.01;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;

                if (this.isPulse) {
                    // Expanding ring
                    this.size += this.growthSpeed;
                    // Fade out as it expands
                    if (this.size > this.maxSize) {
                        this.size = 1;
                        this.x = Math.random() * canvas.width;
                        this.y = Math.random() * canvas.height;
                        this.opacity = 0.5; // Reset opacity
                    }
                    this.opacity = 0.5 * (1 - this.size / this.maxSize);
                } else {
                    // Rotating shield/plus
                    this.rotation += this.rotationSpeed;

                    // Gentle float
                    if (this.x < -50) this.x = canvas.width + 50;
                    if (this.x > canvas.width + 50) this.x = -50;
                    if (this.y < -50) this.y = canvas.height + 50;
                    if (this.y > canvas.height + 50) this.y = -50;
                }
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);

                ctx.strokeStyle = this.color;
                ctx.fillStyle = this.color;

                if (this.isPulse) {
                    // Draw radar ring
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size, 0, Math.PI * 2);
                    ctx.globalAlpha = this.opacity;
                    ctx.lineWidth = 1; // Thin precise line
                    ctx.stroke();

                    // Center dot
                    ctx.beginPath();
                    ctx.arc(0, 0, 2, 0, Math.PI * 2);
                    ctx.globalAlpha = this.opacity * 2;
                    if (ctx.globalAlpha > 1) ctx.globalAlpha = 1;
                    ctx.fill();
                } else {
                    // Draw Shield / Badge / Plus
                    ctx.globalAlpha = this.opacity;
                    ctx.lineWidth = 1.5;

                    // Draw a plus sign (+) for health/support
                    const armLength = this.size / 3;
                    ctx.beginPath();
                    ctx.moveTo(-armLength, 0);
                    ctx.lineTo(armLength, 0);
                    ctx.moveTo(0, -armLength);
                    ctx.lineTo(0, armLength);
                    ctx.stroke();

                    // Optional outer circle for shield feel
                    ctx.beginPath();
                    ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                    ctx.globalAlpha = this.opacity * 0.5;
                    ctx.stroke();
                }

                ctx.restore();
            }
        }

        // Initialize particles
        function initParticles() {
            const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 25000));
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new MaintainParticle());
            }
        }

        // Clean modern connections
        function drawConnections() {
            const maxDistance = 120;

            for (let i = 0; i < particles.length; i++) {
                // Connect pulsing nodes to stable nodes
                if (!particles[i].isPulse) continue;

                for (let j = 0; j < particles.length; j++) {
                    if (particles[j].isPulse) continue;

                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.1;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(245, 158, 11, ${opacity})`;
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
            className={`maintain-particle-background ${className}`}
            aria-hidden="true"
        />
    );
}
