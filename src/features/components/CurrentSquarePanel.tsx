import { BoardSquare } from "../types/board";
import { OwnedProperty } from "../types/game";
import { Player } from "../types/player";

interface CurrentSquarePanelProps {
  currentPlayer: Player;
  currentSquare: BoardSquare;
  ownedProperty?: OwnedProperty;
  propertyOwner?: Player | null;
  isAuctionPending: boolean;
}

function formatSquareType(type: BoardSquare["type"]) {
  return type.replaceAll("_", " ");
}

export function CurrentSquarePanel({
  currentPlayer,
  currentSquare,
  ownedProperty,
  propertyOwner,
  isAuctionPending,
}: CurrentSquarePanelProps) {
  const isProperty = currentSquare.type === "PROPERTY";

  return (
    <section className="border border-slate-950 bg-white p-4 shadow-[4px_4px_0_#d6a531]">
      <div className="border-b border-slate-950 pb-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
          Landing Report
        </p>
        <h2 className="text-xl font-black uppercase tracking-wide">
          Current Square
        </h2>
      </div>

      <div className="mt-4 border border-slate-950 bg-stone-50 p-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Current Player
        </p>
        <p className="mt-1 text-lg font-black uppercase tracking-wide">
          {currentPlayer.name}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-600">
          Cash: ${currentPlayer.cash}
        </p>
      </div>

      <div className="mt-3 border border-slate-950 p-3">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          Square
        </p>
        <p className="mt-1 text-xl font-black leading-tight">
          {currentSquare.name}
        </p>
        <p className="mt-2 inline-block border border-amber-600 bg-amber-50 px-2 py-1 text-xs font-black uppercase tracking-wide text-amber-800">
          {formatSquareType(currentSquare.type)}
        </p>
      </div>

      {isProperty && (
        <div className="mt-3 border border-slate-950">
          <div className="border-b border-slate-950 bg-slate-950 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-white">
            Property Details
          </div>

          <dl className="grid grid-cols-2 gap-px bg-slate-200 text-sm">
            <div className="bg-white p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Price
              </dt>
              <dd className="mt-1 font-black">${currentSquare.price}</dd>
            </div>

            <div className="bg-white p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Rent
              </dt>
              <dd className="mt-1 font-black">${currentSquare.rent}</dd>
            </div>

            <div className="bg-white p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Owner
              </dt>
              <dd className="mt-1 font-black">
                {propertyOwner ? propertyOwner.name : "Unowned"}
              </dd>
            </div>

            <div className="bg-white p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Color Group
              </dt>
              <dd className="mt-1 font-black uppercase tracking-wide">
                {currentSquare.colorGroup}
              </dd>
            </div>
          </dl>

          {!ownedProperty && (
            <div className="border-t border-slate-950 bg-stone-50 p-3">
              {isAuctionPending ? (
                <p className="text-sm font-semibold text-slate-700">
                  Auction is ready to start for this property.
                </p>
              ) : (
                <p className="text-sm font-semibold text-slate-600">
                  This property is available.
                </p>
              )}
            </div>
          )}

          {ownedProperty && (
            <div className="border-t border-slate-950 bg-stone-50 p-3">
              <p className="text-sm font-semibold text-slate-700">
                This property is owned by{" "}
                <span className="font-black">
                  {propertyOwner?.name ?? "another player"}
                </span>
                .
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
