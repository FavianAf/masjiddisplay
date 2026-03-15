'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TickerProps {
    messages: string[];
    speed?: number;
}

export default function Ticker({ messages, speed = 70 }: TickerProps) {
    if (!messages || messages.length === 0) {
        return null;
    }

    const contentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollPosition = useRef<number>(0);
    const containerWidth = useRef<number>(0);
    const contentWidth = useRef<number>(0);
    const animationRef = useRef<number>(0);
    const lastTimeRef = useRef<number>(0);
    const [displayContent, setDisplayContent] = useState('');

    useEffect(() => {
        if (messages && messages.length > 0) {
            setDisplayContent(messages.join(' • '));
        }
    }, [messages]);

    const animate = useCallback((currentTime: number) => {
        if (!lastTimeRef.current) {
            lastTimeRef.current = currentTime;
            animationRef.current = requestAnimationFrame(animate);
            return;
        }

        const deltaTime = (currentTime - lastTimeRef.current) / 1000;
        lastTimeRef.current = currentTime;

        const delta = speed * deltaTime;

        scrollPosition.current -= delta;

        if (scrollPosition.current < -contentWidth.current) {
            scrollPosition.current = containerWidth.current;
        }

        if (contentRef.current) {
            contentRef.current.style.transform = `translateX(${scrollPosition.current}px)`;
        }

        animationRef.current = requestAnimationFrame(animate);
    }, [speed]);

    useEffect(() => {
        animationRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [animate]);

    useEffect(() => {
        if (containerRef.current && contentRef.current) {
            const cWidth = containerRef.current.clientWidth;
            const ctWidth = contentRef.current.scrollWidth;

            containerWidth.current = cWidth;
            contentWidth.current = ctWidth;

            scrollPosition.current = cWidth;

            if (contentRef.current) {
                contentRef.current.style.transform = `translateX(${cWidth}px)`;
            }
        }
    }, [displayContent]);

    return (
        <div className="bg-mosque-green -mx-6 -mb-6 h-12 flex items-center overflow-hidden border-t border-white/20">
            <div className="bg-white text-mosque-green font-bold px-4 h-full flex items-center z-10 shadow-lg">
                INFO
            </div>
            <div
                ref={containerRef}
                className="flex-1 relative h-full flex items-center overflow-hidden"
            >
                <div
                    ref={contentRef}
                    className="text-lg font-bold tracking-wide text-white whitespace-nowrap"
                >
                    {displayContent}
                </div>
            </div>
        </div>
    );
}
