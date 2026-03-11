import { motion } from "motion/react";
import { useEffect, useState } from "react";

const currencies = ["$", "€", "£", "¥", "₹", "₩", "₽", "₿", "¢"];

interface FloatingCurrencyProps {
    count?: number;
}

export function FloatingCurrencies({ count = 20 }: FloatingCurrencyProps) {
    const [elements, setElements] = useState<Array<{ id: number; symbol: string; startX: number; endX: number; size: number; duration: number; delay: number }>>([]);

    useEffect(() => {
        const newElements = Array.from({ length: count }).map((_, i) => ({
            id: i,
            symbol: currencies[Math.floor(Math.random() * currencies.length)],
            startX: Math.random() * 100, // percentage of screen width
            endX: Math.random() * 100,
            size: Math.random() * 2 + 1.5, // 1.5rem to 3.5rem
            duration: Math.random() * 15 + 15, // 15s to 30s
            delay: Math.random() * 10,
        }));
        setElements(newElements);
    }, [count]);

    return (
        <div className="pointer-events-none fixed inset-0 overflow-hidden z-0 bg-transparent">
            {elements.map((el) => (
                <motion.div
                    key={el.id}
                    initial={{
                        left: `${el.startX}vw`,
                        bottom: "-10vh",
                        opacity: 0,
                        rotate: 0,
                    }}
                    animate={{
                        bottom: "110vh",
                        left: `${el.endX}vw`,
                        opacity: [0, 1, 1, 0],
                        rotate: 360,
                    }}
                    transition={{
                        duration: el.duration,
                        repeat: Infinity,
                        delay: el.delay,
                        ease: "linear",
                    }}
                    className="absolute text-teal-500/10 font-bold select-none drop-shadow-sm"
                    style={{ fontSize: `${el.size}rem` }}
                >
                    {el.symbol}
                </motion.div>
            ))}
        </div>
    );
}
