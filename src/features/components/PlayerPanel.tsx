import { GameState } from "../types/game";

interface PlayerPanelProps {
  state: GameState;
}

export function PlayerPanel({ state }: PlayerPanelProps) {
  const currentPlayer = state.players[state.currentPlayerIndex];

  return (
    <section className="border border-slate-950 bg-white p-4 shadow-[4px_4px_0_#d6a531]">
      <div className="flex items-center justify-between border-b border-slate-950 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
            Scoreboard
          </p>
          <h2 className="text-xl font-black uppercase tracking-wide">
            Players
          </h2>
        </div>

        <p className="border border-slate-950 bg-slate-950 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
          {currentPlayer.name}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {state.players.map((player) => {
          const isCurrentPlayer = player.id === currentPlayer.id;
          const currentSquare = state.board[player.position];

          return (
            <div
              key={player.id}
              className={`border p-3 ${
                isCurrentPlayer
                  ? "border-amber-600 bg-amber-50"
                  : "border-slate-300 bg-white"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-black uppercase tracking-wide">
                    {player.name}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    {isCurrentPlayer ? "On turn" : "Waiting"}
                  </p>
                </div>

                <p className="border border-slate-950 bg-white px-2 py-1 text-sm font-black">
                  ${player.cash}
                </p>
              </div>

              <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div className="border border-slate-200 bg-white p-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Position
                  </dt>
                  <dd className="font-semibold">{player.position}</dd>
                </div>

                <div className="border border-slate-200 bg-white p-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Status
                  </dt>
                  <dd className="font-semibold">{player.status}</dd>
                </div>

                <div className="col-span-2 border border-slate-200 bg-white p-2">
                  <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Current Square
                  </dt>
                  <dd className="font-semibold">{currentSquare.name}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}
