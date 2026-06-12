"use client";

import { AnimatePresence, motion } from "motion/react";
import { Card } from "../types/cards";
import { controlPrimaryButtonClass } from "./controlStyles";

interface CardDrawAnimationProps {
  card: Card | null;
  onClose: () => void;
}

function getDeckLabel(card: Card) {
  return card.deck === "chance" ? "Chance" : "Community Chest";
}

export function CardDrawAnimation({ card, onClose }: CardDrawAnimationProps) {
  return (
    <AnimatePresence>
      {card && (
        <motion.div
          aria-modal="true"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 px-4 py-6"
          role="dialog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.section
            className="w-full max-w-sm border border-slate-950 bg-white shadow-[8px_8px_0_#d6a531]"
            initial={{ y: 36, rotateY: -90, opacity: 0 }}
            animate={{ y: 0, rotateY: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            <div className="border-b border-slate-950 bg-slate-950 px-4 py-3 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
                Card Draw
              </p>
              <h2 className="mt-1 text-2xl font-black uppercase tracking-wide">
                {getDeckLabel(card)}
              </h2>
            </div>
            <div className="p-4">
              <motion.div
                className="min-h-[220px] border-2 border-slate-950 bg-amber-50 p-5 text-center"
                initial={{ scale: 0.92 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.12, duration: 0.22 }}
              >
                <p className="text-xs font-black uppercase tracking-[0.28em] text-amber-800">
                  Reveal
                </p>
                <p className="mt-8 text-xl font-black leading-tight text-slate-950">
                  {card.description}
                </p>
              </motion.div>
              <button className={`${controlPrimaryButtonClass} mt-4`} onClick={onClose}>
                Continue
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
