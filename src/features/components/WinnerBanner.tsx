import { GameState } from "../types/game";

interface WinnerBannerProps {
  state: GameState;
}

export function WinnerBanner({ state }: WinnerBannerProps) {
  if (state.status !== "FINISHED" || !state.winnerId) {
    return null;
  }

  const winner = state.players.find((player) => player.id === state.winnerId);

  return (
    <section className="border border-slate-950 bg-amber-50 p-4 shadow-[4px_4px_0_#d6a531]">
      <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-700">
        Game Over
      </p>
      <h2 className="mt-1 text-2xl font-black uppercase">
        {winner?.name} wins
      </h2>
    </section>
  );
}
