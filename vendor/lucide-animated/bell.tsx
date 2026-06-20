// Example animated Lucide icon — REFERENCE ONLY.
// Demonstrates the pattern used by lucide-animated.com / pqoqubbw/icons:
// a Lucide SVG whose parts are animated with Motion on hover.
// For real icons, prefer: npx shadcn@latest add "https://lucide-animated.com/r/<name>.json"
//
// Requires: react, motion  ->  npm i motion
"use client";

import { motion, useAnimation } from "motion/react";

const ringVariants = {
  normal: { rotate: 0 },
  animate: {
    rotate: [0, -12, 10, -8, 6, 0],
    transition: { duration: 0.7, ease: "easeInOut" },
  },
};

const clapperVariants = {
  normal: { rotate: 0 },
  animate: {
    rotate: [0, 8, -8, 6, -4, 0],
    transition: { duration: 0.7, ease: "easeInOut" },
  },
};

type BellProps = {
  size?: number;
  className?: string;
} & React.HTMLAttributes<HTMLSpanElement>;

export function Bell({ size = 24, className, ...props }: BellProps) {
  const controls = useAnimation();

  return (
    <span
      className={className}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
      style={{ display: "inline-flex" }}
      {...props}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.path
          variants={ringVariants}
          animate={controls}
          initial="normal"
          d="M10.268 21a2 2 0 0 0 3.464 0"
        />
        <motion.path
          variants={clapperVariants}
          animate={controls}
          initial="normal"
          d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"
        />
      </svg>
    </span>
  );
}

export default Bell;
