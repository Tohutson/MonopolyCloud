import { GameLogEntry } from "../types/game";

interface GameLogProps {
  entries: GameLogEntry[];
}

export function GameLog({ entries }: GameLogProps) {
  return (
    <section className="border border-slate-950 bg-white p-4 shadow-[4px_4px_0_#d6a531]">
      <div className="border-b border-slate-950 pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
          Table History
        </p>
        <h2 className="text-xl font-black uppercase tracking-wide">
          Game Log
        </h2>
      </div>

      <div className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
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
                {String(entryIndex + 1).padStart(2, "0")}
              </span>
              {entry.message}
            </p>
          ))
        )}
      </div>
    </section>
  );
}
