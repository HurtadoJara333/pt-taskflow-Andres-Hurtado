import { AnimatePresence, motion } from "framer-motion"

export type CyberpunkEffectType = "create" | "delete" | "cortana"

const COLORS: Record<CyberpunkEffectType, string> = {
  create: "rgba(34, 211, 238, 0.85)",
  delete: "rgba(255, 80, 80, 0.85)",
  cortana: "rgba(167, 83, 255, 0.85)",
}

const PULSE_VARIANTS = {
  initial: { opacity: 0, scale: 0.7 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.2 },
}

const BOLT_VARIANTS = {
  initial: { opacity: 0, scaleY: 0 },
  animate: { opacity: 1, scaleY: 1 },
  exit: { opacity: 0, scaleY: 0 },
}

export function CyberpunkEffect({
  type,
  onComplete,
}: {
  type: CyberpunkEffectType | null
  onComplete?: () => void
}) {
  return (
    <AnimatePresence>
      {type && (
        <motion.div
          key={type}
          className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
          variants={PULSE_VARIANTS}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.35 }}
          onAnimationComplete={() => onComplete?.()}
        >
          {/* Glowing pulse */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at center, ${COLORS[type]} 0%, transparent 60%)`,
              filter: "blur(10px)",
            }}
            variants={PULSE_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.7 }}
          />

          {/* Lightning bolt */}
          <motion.div
            className="absolute h-56 w-2 rounded-full"
            style={{ background: `linear-gradient(180deg, ${COLORS[type]} 0%, transparent 90%)` }}
            variants={BOLT_VARIANTS}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.35 }}
          />

          {/* Cortana additional moving streaks */}
          {type === "cortana" && (
            <motion.div
              className="absolute h-0.5 w-48 rounded-full"
              style={{ background: `radial-gradient(circle, ${COLORS[type]}, transparent)` }}
              initial={{ x: -120, opacity: 0 }}
              animate={{ x: 120, opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
