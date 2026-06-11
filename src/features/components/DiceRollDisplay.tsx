import { motion, useReducedMotion } from "motion/react";
import { DiceRoll } from "../types/game";

interface DiceRollDisplayProps {
  roll: DiceRoll | null;
  isRolling?: boolean;
  emptyMessage?: string;
  title?: string;
}

function DiceFace({
  value,
  isRolling,
  index,
}: {
  value: number;
  isRolling: boolean;
  index: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.span
      animate={
        isRolling && !shouldReduceMotion
          ? { rotate: [0, -12, 12, 0], y: [0, -3, 2, 0] }
          : { rotate: 0, y: 0 }
      }
      className="flex h-10 w-10 items-center justify-center border border-slate-950 bg-white text-lg font-black"
      transition={{
        duration: 0.36,
        repeat: isRolling && !shouldReduceMotion ? Infinity : 0,
        delay: index * 0.04,
      }}
    >
      {value}
    </motion.span>
  );
}

export function DiceRollDisplay({
  roll,
  isRolling = false,
  emptyMessage = "No dice rolled yet.",
  title = isRolling ? "Rolling" : "Last Roll",
}: DiceRollDisplayProps) {
  if (!roll) {
    return (
      <p className="mt-4 border border-slate-200 bg-stone-50 p-3 text-sm font-medium text-slate-600">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="mt-4 border border-slate-950 bg-stone-50 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
        {title}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <DiceFace value={roll.die1} isRolling={isRolling} index={0} />
        <span className="text-sm font-black">+</span>
        <DiceFace value={roll.die2} isRolling={isRolling} index={1} />
        <span className="text-sm font-black">=</span>
        <span className="border border-amber-600 bg-amber-100 px-3 py-2 text-lg font-black">
          {roll.total}
        </span>
      </div>
    </div>
  );
}
