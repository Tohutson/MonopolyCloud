import { GameAction } from "../types/actions";
import { PropertySquare } from "../types/board";
import { Player } from "../types/player";

interface PropertyDecisionModalProps {
  property: PropertySquare;
  currentPlayer: Player;
  canBuy: boolean;
  dispatch: (action: GameAction) => void;
}

export function PropertyDecisionModal({
  property,
  currentPlayer,
  canBuy,
  dispatch,
}: PropertyDecisionModalProps) {
  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6"
      role="dialog"
    >
      <section className="w-full max-w-md border border-slate-950 bg-white shadow-[8px_8px_0_#d6a531]">
        <div className="border-b border-slate-950 bg-slate-950 px-4 py-3 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
            Property Decision
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase tracking-wide">
            Buy {property.name}?
          </h2>
        </div>

        <div className="space-y-4 p-4">
          <div className="border border-slate-950 bg-stone-50 p-3">
            <p className="text-sm font-semibold text-slate-700">
              {currentPlayer.name} landed on an unowned property. Choose before
              continuing the turn.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-px border border-slate-950 bg-slate-200 text-sm">
            <div className="bg-white p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Price
              </dt>
              <dd className="mt-1 text-lg font-black">${property.price}</dd>
            </div>
            <div className="bg-white p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Rent
              </dt>
              <dd className="mt-1 text-lg font-black">${property.rent}</dd>
            </div>
            <div className="bg-white p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Mortgage
              </dt>
              <dd className="mt-1 text-lg font-black">
                ${property.mortgageValue}
              </dd>
            </div>
            <div className="bg-white p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Cash
              </dt>
              <dd className="mt-1 text-lg font-black">${currentPlayer.cash}</dd>
            </div>
            <div className="bg-white p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Group
              </dt>
              <dd className="mt-1 text-sm font-black uppercase tracking-wide">
                {property.colorGroup}
              </dd>
            </div>
          </dl>

          {!canBuy && (
            <p className="border border-slate-950 bg-amber-50 p-3 text-sm font-semibold text-slate-800">
              {currentPlayer.name} does not have enough cash to buy this
              property. Declining will start the auction flow.
            </p>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              className="border border-slate-950 bg-amber-500 px-4 py-3 text-sm font-black uppercase tracking-wide text-slate-950 shadow-[3px_3px_0_#111827] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111827] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:translate-y-0"
              disabled={!canBuy}
              onClick={() =>
                dispatch({
                  type: "BUY_PROPERTY",
                  propertyId: property.id,
                })
              }
            >
              Buy for ${property.price}
            </button>
            <button
              className="border border-slate-950 bg-white px-4 py-3 text-sm font-black uppercase tracking-wide text-slate-950 shadow-[3px_3px_0_#111827] transition hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#111827]"
              onClick={() =>
                dispatch({
                  type: "DECLINE_PROPERTY",
                  propertyId: property.id,
                })
              }
            >
              Decline
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
