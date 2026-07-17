// Reference component — animate a generated avatar with Motion. REFERENCE ONLY.
//
// Avatar generators output STATIC SVG (see docs/avatars/animation.md). This wraps one in
// `motion` the same way vendor/lucide-animated/bell.tsx wraps a static Lucide icon: the SVG
// is generated once, the *wrapper* animates. Pairs with the CLI —
//
//   node scripts/avatar.mjs lorelei:erick        ->  paste the <svg> as the `svg` prop
//
// Requires: react, motion  ->  npm i motion
"use client";

import { motion, useAnimation, type Variants } from "motion/react";
import { useEffect, useState } from "react";

const variants: Record<string, Variants> = {
  // pops in on mount / when the seed changes
  enter: {
    normal: { scale: 1, opacity: 1 },
    hidden: { scale: 0.5, opacity: 0 },
  },
  // gentle always-on float
  idle: {
    normal: { y: 0 },
    animate: { y: [0, -8, 0], transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } },
  },
  // hover wiggle — the Lucide Animated micro-interaction
  hover: {
    normal: { rotate: 0, scale: 1 },
    animate: {
      rotate: [0, -8, 7, -5, 3, 0],
      scale: [1, 1.04, 1, 1, 1, 1],
      transition: { duration: 0.65, ease: "easeInOut" },
    },
  },
};

type Motionable = "enter" | "idle" | "hover";

type AnimatedAvatarProps = {
  /** SVG markup from `node scripts/avatar.mjs <style>:<seed>` (or DiceBear `createAvatar(...).toString()`). */
  svg: string;
  /** enter = pop-in on mount · idle = always-on float · hover = wiggle on hover (default). */
  motionType?: Motionable;
  size?: number;
} & React.HTMLAttributes<HTMLSpanElement>;

export function AnimatedAvatar({ svg, motionType = "hover", size = 96, ...props }: AnimatedAvatarProps) {
  const controls = useAnimation();

  useEffect(() => {
    if (motionType === "enter") controls.start("normal"); // animates from the `hidden` initial state
    if (motionType === "idle") controls.start("animate");
  }, [controls, motionType, svg]); // re-runs when the avatar (seed) changes

  const hoverProps =
    motionType === "hover"
      ? { onMouseEnter: () => controls.start("animate"), onMouseLeave: () => controls.start("normal") }
      : {};

  return (
    <motion.span
      {...props}
      {...hoverProps}
      variants={variants[motionType]}
      initial={motionType === "enter" ? "hidden" : "normal"}
      animate={controls}
      style={{ display: "inline-flex", width: size, height: size, ...props.style }}
      // the generated SVG is static; motion animates this wrapper
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

// Bonus: "rolling identity" while generating. Because generation is instant + deterministic,
// swap the seed on a decelerating timer, then settle on `finalSeed`. Pass a generator that
// returns SVG for a seed, e.g. (s) => createAvatar(pixelArt, { seed: s }).toString().
export function ShufflingAvatar({
  generate,
  finalSeed,
  size = 96,
  play,
}: {
  generate: (seed: string) => string;
  finalSeed: string;
  size?: number;
  play: boolean;
}) {
  const [svg, setSvg] = useState(() => generate(finalSeed));

  useEffect(() => {
    if (!play) {
      setSvg(generate(finalSeed));
      return;
    }
    let i = 0;
    let delay = 60;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      if ((delay *= 1.14) < 340) {
        setSvg(generate(`roll-${i++}`)); // any throwaway seed → a different avatar each frame
        timer = setTimeout(tick, delay);
      } else {
        setSvg(generate(finalSeed)); // settle on the real one
      }
    };
    tick();
    return () => clearTimeout(timer);
  }, [play, finalSeed, generate]);

  return (
    <motion.span
      animate={{ filter: play ? "blur(1px)" : "blur(0px)" }}
      style={{ display: "inline-flex", width: size, height: size }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
