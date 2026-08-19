"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { cn } from "@/lib/utils";

export interface StepperProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  onChange?: (val: number) => void;
  ariaLabel?: string;
  className?: string;
}

const digitVariants = {
  initial: (dir: number) => ({
    y: dir > 0 ? 20 : -20,
    opacity: 0,
    scale: 0.5,
    z: 0,
    filter: "blur(2px)",
  }),
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    z: 10,
    filter: "blur(0px)",
  },
  exit: (dir: number) => ({
    y: dir > 0 ? -20 : 20,
    opacity: 0,
    scale: 0.5,
    z: 0,
    filter: "blur(2px)",
  }),
};

export function Stepper({
  value,
  defaultValue = 0,
  min = 0,
  max = 999,
  onChange,
  ariaLabel = "Количество",
  className,
}: StepperProps) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = React.useState(defaultValue);
  const [direction, setDirection] = React.useState(0);

  const current = isControlled ? value! : internal;

  const step = (dir: number) => {
    const next = Math.min(max, Math.max(min, current + dir));
    if (next === current) return;
    setDirection(dir);
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  return (
    <div className={cn("stepper", className)} role="group" aria-label={ariaLabel}>
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        onClick={() => step(-1)}
        disabled={current <= min}
        className="stepper-button"
        aria-label={`${ariaLabel}: уменьшить`}
      >
        <Minus aria-hidden="true" />
      </motion.button>

      <div className="stepper-value" aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.span
            key={current}
            custom={direction}
            variants={digitVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 16,
              mass: 1.2,
            }}
            className="stepper-digit-value"
          >
            {current}
          </motion.span>
        </AnimatePresence>
      </div>
      <output className="sr-only" aria-live="polite">
        {current}
      </output>

      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.92 }}
        transition={{ type: "spring", stiffness: 300, damping: 22 }}
        onClick={() => step(1)}
        disabled={current >= max}
        className="stepper-button"
        aria-label={`${ariaLabel}: увеличить`}
      >
        <Plus aria-hidden="true" />
      </motion.button>
    </div>
  );
}
