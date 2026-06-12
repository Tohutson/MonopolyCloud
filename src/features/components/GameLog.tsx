import { GameLogEntry } from "../types/game";
import {
  controlHeaderKickerClass,
  controlHeaderTitleClass,
  controlSecondaryButtonClass,
} from "./controlStyles";

interface GameLogButtonProps {
  entries: GameLogEntry[];
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function GameLogButton({
  entries,
  isOpen,
  onClose,
  onOpen,
}: GameLogButtonProps) {
  return (
    <>
      <button className={controlSecondaryButtonClass} onClick={onOpen}>
        Game Log ({entries.length})
      </button>

      {isOpen && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6"
          role="dialog"
        >
          <section className="max-h-[86vh] w-full max-w-2xl overflow-hidden border border-slate-950 bg-white shadow-[8px_8px_0_#d6a531]">
            <div className="flex items-start justify-between gap-4 border-b border-slate-950 bg-white p-4">
              <div>
                <p className={controlHeaderKickerClass}>Table History</p>
                <h2 className={controlHeaderTitleClass}>Game Log</h2>
              </div>
              <button
                className="border border-slate-950 bg-white px-3 py-1 text-sm font-black uppercase tracking-wide transition hover:bg-amber-50"
                onClick={onClose}
              >
                Close
              </button>
            </div>

            <div className="max-h-[68vh] space-y-2 overflow-y-auto p-4">
              {entries.length === 0 ? (
                <p className="border border-slate-200 bg-stone-50 p-3 text-sm font-medium text-slate-500">
                  No events yet.
                </p>
              ) : (
                entries.map((entry, entryIndex) => (
                  <p
                    key={entry.id}
                    className="border border-slate-200 bg-stone-50 p-2 text-sm font-medium leading-snug text-slate-700"
                  >
                    <span className="mr-2 font-black text-amber-700">
                      {String(entries.length - entryIndex).padStart(2, "0")}
                    </span>
                    {entry.message}
                  </p>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
