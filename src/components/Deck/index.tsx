import React, { useState } from "react";
import { motion, type Variants } from "motion/react";
import styles from "./Deck.module.css";

interface Props {
  children: React.ReactNode | React.ReactNode[];
  isOpen?: boolean;
  onSelect?: (cardIndex: number) => void;
  disabled?: boolean;
}

const cardVariants = (offset: number): Variants => ({
  stacked: {
    rotate: 0,
    x: 0,
    y: -offset * 5,
    rotateX: 20,
    scale: 1,
    filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.15))",
  },
  preview: {
    rotate: offset * 5,
    x: offset * 5,
    y: -offset * 2,
    rotateX: 10,
    scale: 1.05,
    filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
  },
  fanned: {
    rotate: offset * 15,
    x: offset * 120,
    y: Math.pow(offset, 2) * 2.5,
    rotateX: 0,
    scale: 1,
    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.1))",
  },
});

export default function Deck({
  children,
  isOpen = false,
  onSelect,
  disabled = false,
}: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const childrenArray = React.Children.toArray(children);
  const midIndex = (childrenArray.length - 1) / 2;

  const currentVariant = isOpen ? "fanned" : isHovered ? "preview" : "stacked";

  return (
    <motion.div
      className={styles.wrapper}
      onHoverStart={() => !isOpen && !disabled && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {childrenArray.map((child, index) => {
        const offset = index - midIndex;
        const progress = index / (childrenArray.length - 1);
        const r = Math.floor(200 - progress * 150);
        const g = Math.floor(50 + progress * 170);
        const b = 50;

        return (
          <motion.div
            key={index}
            className={styles.rectangle}
            style={{
              transformOrigin: "50% 100%",
              cursor: disabled ? "default" : "pointer",
              ["--card-bg" as string]: `rgba(${r}, ${g}, ${b}, 0.4)`,
            }}
            variants={cardVariants(offset)}
            initial="stacked"
            animate={currentVariant}
            whileHover={
              isOpen && !disabled
                ? {
                    scale: 1.05,
                    y: -80,
                    border: "5px solid rgba(255, 255, 255, 0.8)",
                    transition: {
                      duration: 0.3,
                      border: { duration: 0.15, ease: "easeInOut" },
                    },
                  }
                : undefined
            }
            transition={{ type: "spring", stiffness: 150, damping: 30 }}
            onClick={(e) => {
              e.stopPropagation();
              if (disabled) return;
              if (isOpen && onSelect) {
                onSelect(index + 1);
              }
            }}
            onHoverStart={() => setHoveredIndex(index)}
            onHoverEnd={() => setHoveredIndex(null)}
          >
            <div className={styles.cardImage}>
              <div
                className={`${styles.numberWrapper} ${hoveredIndex === index ? styles.isHovered : ""}`}
              >
                {index + 1}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
