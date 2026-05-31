import { motion, type HTMLMotionProps, type Variants } from "framer-motion";
import React from "react";

/* ─── Animation presets ─────────────────────────────── */
const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] },
  },
};

/* ─── Components ─────────────────────────────────────── */

/** Fades + slides content up on mount. */
export function FadeIn({
  children,
  delay = 0,
  className,
  ...rest
}: { children: React.ReactNode; delay?: number; className?: string } & Omit<HTMLMotionProps<"div">, "children">) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUpVariants}
      transition={{ duration: 0.22, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Wraps children and staggers their entrance animations. */
export function StaggerChildren({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainerVariants}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Use as direct child of StaggerChildren for staggered entrance. */
export function StaggerItem({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={staggerItemVariants} className={className}>
      {children}
    </motion.div>
  );
}

/** Card wrapper that elevates on hover using spring physics. */
export function HoverCard({
  children,
  className,
}: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      whileHover={{
        y: -3,
        boxShadow: "0 12px 32px rgba(0,0,0,0.55), 0 4px 12px rgba(0,0,0,0.4)",
      }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Button wrapper with tactile press animation. */
export function TactileButton({
  children,
  className,
  onClick,
}: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={className}
      onClick={onClick}
    >
      {children}
    </motion.button>
  );
}

export { staggerItemVariants };
