import type { BoardSquare } from "../types/board";
import { GameState } from "../types/game";
import { Player } from "../types/player";

interface GameBoardProps {
  state: GameState;
}

interface PlayerToken {
  player: Player;
  playerNumber: number;
}

const boardGridPositionClasses: Record<number, string> = {
  0: "col-start-11 row-start-11",
  1: "col-start-10 row-start-11",
  2: "col-start-9 row-start-11",
  3: "col-start-8 row-start-11",
  4: "col-start-7 row-start-11",
  5: "col-start-6 row-start-11",
  6: "col-start-5 row-start-11",
  7: "col-start-4 row-start-11",
  8: "col-start-3 row-start-11",
  9: "col-start-2 row-start-11",
  10: "col-start-1 row-start-11",
  11: "col-start-1 row-start-10",
  12: "col-start-1 row-start-9",
  13: "col-start-1 row-start-8",
  14: "col-start-1 row-start-7",
  15: "col-start-1 row-start-6",
  16: "col-start-1 row-start-5",
  17: "col-start-1 row-start-4",
  18: "col-start-1 row-start-3",
  19: "col-start-1 row-start-2",
  20: "col-start-1 row-start-1",
  21: "col-start-2 row-start-1",
  22: "col-start-3 row-start-1",
  23: "col-start-4 row-start-1",
  24: "col-start-5 row-start-1",
  25: "col-start-6 row-start-1",
  26: "col-start-7 row-start-1",
  27: "col-start-8 row-start-1",
  28: "col-start-9 row-start-1",
  29: "col-start-10 row-start-1",
  30: "col-start-11 row-start-1",
  31: "col-start-11 row-start-2",
  32: "col-start-11 row-start-3",
  33: "col-start-11 row-start-4",
  34: "col-start-11 row-start-5",
  35: "col-start-11 row-start-6",
  36: "col-start-11 row-start-7",
  37: "col-start-11 row-start-8",
  38: "col-start-11 row-start-9",
  39: "col-start-11 row-start-10",
};

function getGridPosition(index: number) {
  return boardGridPositionClasses[index] ?? "col-start-1 row-start-1";
}

function getPropertyColorClass(colorGroup: string) {
  const colors: Record<string, string> = {
    brown: "bg-amber-900",
    "light-blue": "bg-sky-300",
    pink: "bg-fuchsia-400",
    orange: "bg-orange-500",
    red: "bg-red-600",
    yellow: "bg-yellow-300",
    green: "bg-emerald-700",
    "dark-blue": "bg-blue-900",
    railroad: "bg-slate-950",
    utility: "bg-slate-400",
  };

  return colors[colorGroup] ?? "bg-amber-500";
}

function formatSquareType(type: BoardSquare["type"]) {
  return type.replaceAll("_", " ");
}

function getSquareTone(square: BoardSquare) {
  if (square.type === "START") {
    return "bg-amber-50";
  }

  if (
    square.type === "JAIL" ||
    square.type === "FREE_PARKING" ||
    square.type === "GO_TO_JAIL"
  ) {
    return "bg-stone-50";
  }

  if (square.type === "TAX") {
    return "bg-slate-100";
  }

  return "bg-white";
}

function getTokenClass(playerNumber: number, isCurrentPlayer: boolean) {
  const baseClass =
    "flex h-5 w-5 shrink-0 items-center justify-center border text-[10px] font-black leading-none";
  const playerClass =
    playerNumber % 2 === 0
      ? "border-slate-950 bg-amber-400 text-slate-950"
      : "border-slate-950 bg-slate-950 text-white";
  const activeClass = isCurrentPlayer ? "ring-2 ring-amber-600" : "";

  return `${baseClass} ${playerClass} ${activeClass}`;
}

export function GameBoard({ state }: GameBoardProps) {
  const currentPlayer = state.players[state.currentPlayerIndex];

  function getPlayersOnSquare(squareIndex: number): PlayerToken[] {
    return state.players
      .map((player, playerIndex) => ({
        player,
        playerNumber: playerIndex + 1,
      }))
      .filter(({ player }) => player.position === squareIndex);
  }

  return (
    <section className="border border-slate-950 bg-white p-3 shadow-[6px_6px_0_#d6a531] sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-slate-950 pb-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700">
            The Board
          </p>
          <h2 className="text-2xl font-black uppercase tracking-wide">
            Classic Perimeter
          </h2>
        </div>
        <p className="hidden border border-slate-950 px-3 py-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-700 sm:block">
          40 Spaces
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="grid aspect-square min-w-[760px] border-2 border-slate-950 bg-slate-950 [grid-template-columns:1.25fr_repeat(9,minmax(0,1fr))_1.25fr] [grid-template-rows:1.25fr_repeat(9,minmax(0,1fr))_1.25fr]">
          <div
            className="col-start-2 col-span-9 row-start-2 row-span-9 m-px flex flex-col items-center justify-center border border-slate-950 bg-stone-50 p-8 text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-700">
              Serverless Property Trading
            </p>
            <h3 className="mt-3 text-6xl font-black uppercase tracking-wide text-slate-950">
              Cloudopoly
            </h3>
            <div className="mt-5 h-1 w-40 bg-amber-500" />
            <p className="mt-5 max-w-md text-sm font-medium uppercase tracking-[0.16em] text-slate-600">
              Roll, collect, invest, and race around the cloud district.
            </p>
          </div>

        {state.board.map((square) => {
          const playersOnSquare = getPlayersOnSquare(square.index);
          const isCorner = square.index % 10 === 0;

          return (
            <div
              key={square.id}
              className={`m-px flex min-h-0 flex-col border border-slate-950 ${getGridPosition(square.index)} ${getSquareTone(square)}`}
            >
              {square.type === "PROPERTY" && (
                <div
                  className={`h-2.5 border-b border-slate-950 ${getPropertyColorClass(square.colorGroup)}`}
                />
              )}

              <div className="flex min-h-0 flex-1 flex-col p-1.5">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-[10px] font-black leading-none text-slate-500">
                    {square.index}
                  </p>
                  <p className="text-[9px] font-bold uppercase leading-none tracking-wide text-amber-700">
                    {formatSquareType(square.type)}
                  </p>
                </div>

                <p
                  className={`mt-1 font-black uppercase leading-tight text-slate-950 ${
                    isCorner ? "text-[13px]" : "text-[10px]"
                  }`}
                >
                  {square.name}
                </p>

                <div className="mt-auto flex flex-wrap gap-1 pt-1">
                  {playersOnSquare.map(({ player, playerNumber }) => (
                    <div
                      key={player.id}
                      className={getTokenClass(
                        playerNumber,
                        player.id === currentPlayer.id,
                      )}
                      title={player.name}
                    >
                      P{playerNumber}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </section>
  );
}
