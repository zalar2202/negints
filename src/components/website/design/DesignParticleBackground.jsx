"use client";

import { useEffect, useRef } from "react";

/**
 * DesignParticleBackground - Canvas-based animated geometric particle system
 * Creates floating geometric shapes (hexagons, triangles, circles) for the Design page
 * Uses the design page's purple/violet color theme
 */
export default function DesignParticleBackground({ className = "" }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        let animationFrameId;
        let shapes = [];

        // Design page color palette (purple/violet)
        const colors = [
            "#7C3AED", // Primary violet
            "#8B5CF6", // Lighter violet
            "#A78BFA", // Even lighter
            "#C4B5FD", // Soft violet
            "#6D28D9", // Darker violet
        ];

        // Handle resize
        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initShapes();
        };

        // Shape types
        const shapeTypes = ["hexagon", "triangle", "circle", "diamond", "pentagon"];

        // Shape class
        class Shape {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 20 + 10;
                this.speedX = (Math.random() - 0.5) * 0.3;
                this.speedY = (Math.random() - 0.5) * 0.3;
                this.rotation = Math.random() * Math.PI * 2;
                this.rotationSpeed = (Math.random() - 0.5) * 0.01;
                this.opacity = Math.random() * 0.4 + 0.1;
                this.fadeSpeed = Math.random() * 0.003 + 0.001;
                this.growing = Math.random() > 0.5;
                this.type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
                this.color = colors[Math.floor(Math.random() * colors.length)];
                this.strokeOnly = Math.random() > 0.6;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.rotation += this.rotationSpeed;

                // Fade in/out effect
                if (this.growing) {
                    this.opacity += this.fadeSpeed;
                    if (this.opacity >= 0.5) this.growing = false;
                } else {
                    this.opacity -= this.fadeSpeed;
                    if (this.opacity <= 0.05) this.growing = true;
                }

                // Wrap around screen
                if (this.x < -this.size) this.x = canvas.width + this.size;
                if (this.x > canvas.width + this.size) this.x = -this.size;
                if (this.y < -this.size) this.y = canvas.height + this.size;
                if (this.y > canvas.height + this.size) this.y = -this.size;
            }

            draw() {
                ctx.save();
                ctx.translate(this.x, this.y);
                ctx.rotate(this.rotation);
                ctx.globalAlpha = this.opacity;

                if (this.strokeOnly) {
                    ctx.strokeStyle = this.color;
                    ctx.lineWidth = 1.5;
                } else {
                    ctx.fillStyle = this.color;
                }

                ctx.beginPath();

                switch (this.type) {
                    case "hexagon":
                        this.drawPolygon(6);
                        break;
                    case "triangle":
                        this.drawPolygon(3);
                        break;
                    case "pentagon":
                        this.drawPolygon(5);
                        break;
                    case "diamond":
                        this.drawPolygon(4);
                        break;
                    case "circle":
                    default:
                        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                        break;
                }

                if (this.strokeOnly) {
                    ctx.stroke();
                } else {
                    ctx.fill();
                }

                ctx.restore();
            }

            drawPolygon(sides) {
                const angle = (Math.PI * 2) / sides;
                ctx.moveTo(this.size / 2, 0);
                for (let i = 1; i <= sides; i++) {
                    ctx.lineTo(
                        (this.size / 2) * Math.cos(angle * i),
                        (this.size / 2) * Math.sin(angle * i)
                    );
                }
                ctx.closePath();
            }
        }

        // Initialize shapes
        function initShapes() {
            const shapeCount = Math.min(40, Math.floor((canvas.width * canvas.height) / 30000));
            shapes = [];
            for (let i = 0; i < shapeCount; i++) {
                shapes.push(new Shape());
            }
        }

        // Draw subtle connecting lines between nearby shapes
        function drawConnections() {
            const maxDistance = 180;

            for (let i = 0; i < shapes.length; i++) {
                for (let j = i + 1; j < shapes.length; j++) {
                    const dx = shapes[i].x - shapes[j].x;
                    const dy = shapes[i].y - shapes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        const opacity = (1 - distance / maxDistance) * 0.08;
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(124, 58, 237, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.moveTo(shapes[i].x, shapes[i].y);
                        ctx.lineTo(shapes[j].x, shapes[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        // Animation loop
        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw connections first (behind shapes)
            drawConnections();

            // Update and draw shapes
            shapes.forEach((shape) => {
                shape.update();
                shape.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        }

        // Check for reduced motion preference
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
            className={`design-particle-background ${className}`}
            aria-hidden="true"
        />
    );
}
