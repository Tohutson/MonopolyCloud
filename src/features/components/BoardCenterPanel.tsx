import { INCOME_TAX_AMOUNT, LUXURY_TAX_AMOUNT } from "../engine/rules/constants";
import {
  getUnmortgageCost,
  isColorProperty,
  normalizeOwnedProperty,
} from "../engine/rules/improvements";
import { calculateRentForProperty } from "../engine/rules/rent";
import { BoardSquare } from "../types/board";
import { Card } from "../types/cards";
import { GameState, OwnedProperty } from "../types/game";
import { Player } from "../types/player";

interface BoardCenterPanelProps {
  state: GameState;
  currentPlayer: Player;
  currentSquare: BoardSquare;
  ownedProperty?: OwnedProperty;
  propertyOwner?: Player | null;
  isAuctionPending: boolean;
  latestCard?: Card | null;
}

function formatSquareType(type: BoardSquare["type"]) {
  return type.replaceAll("_", " ");
}

function getTaxAmount(square: BoardSquare) {
  if (square.id === "income-tax") {
    return INCOME_TAX_AMOUNT;
  }

  if (square.id === "luxury-tax") {
    return LUXURY_TAX_AMOUNT;
  }

  return 0;
}

function getSpecialSquareCopy(square: BoardSquare) {
  switch (square.type) {
    case "START":
      return "Collect salary when passing or landing here.";
    case "CHANCE":
      return "Draw a Chance card and follow its instruction.";
    case "COMMUNITY_CHEST":
      return "Draw a Community Chest card and follow its instruction.";
    case "JAIL":
      return "Just visiting unless sent here by a rule or card.";
    case "FREE_PARKING":
      return "Rest stop. No payment is currently configured.";
    case "GO_TO_JAIL":
      return "Move directly to Jail.";
    default:
      return null;
  }
}

export function BoardCenterPanel({
  state,
  currentPlayer,
  currentSquare,
  ownedProperty,
  propertyOwner,
  isAuctionPending,
  latestCard,
}: BoardCenterPanelProps) {
  const normalizedOwnedProperty = ownedProperty
    ? normalizeOwnedProperty(ownedProperty)
    : null;
  const specialCopy = getSpecialSquareCopy(currentSquare);

  return (
    <section className="flex h-full w-full flex-col justify-between border border-slate-950 bg-stone-50 p-5 text-left">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700">
          Current Square
        </p>
        <h2 className="mt-2 text-3xl font-black uppercase leading-none tracking-wide text-slate-950">
          {currentSquare.name}
        </h2>
        <p className="mt-3 inline-block border border-amber-600 bg-amber-50 px-2 py-1 text-xs font-black uppercase tracking-wide text-amber-800">
          {formatSquareType(currentSquare.type)}
        </p>
      </div>

      <div className="mt-4 min-h-[250px]">
        {currentSquare.type === "PROPERTY" ? (
          <div className="border border-slate-950 bg-white">
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
                <dd className="mt-1 font-black">
                  ${calculateRentForProperty(
                    state,
                    currentSquare,
                    propertyOwner?.id ?? currentPlayer.id,
                  )}
                </dd>
              </div>
              <div className="bg-white p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Owner
                </dt>
                <dd className="mt-1 font-black">
                  {propertyOwner?.name ?? "Unowned"}
                </dd>
              </div>
              <div className="bg-white p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Mortgage
                </dt>
                <dd className="mt-1 font-black">
                  ${currentSquare.mortgageValue}
                </dd>
              </div>
              <div className="bg-white p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Group
                </dt>
                <dd className="mt-1 font-black uppercase tracking-wide">
                  {currentSquare.colorGroup}
                </dd>
              </div>
              <div className="bg-white p-3">
                <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Unmortgage
                </dt>
                <dd className="mt-1 font-black">
                  ${getUnmortgageCost(currentSquare)}
                </dd>
              </div>
              {isColorProperty(currentSquare) && (
                <>
                  <div className="bg-white p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Buildings
                    </dt>
                    <dd className="mt-1 font-black">
                      {normalizedOwnedProperty?.hotel
                        ? "Hotel"
                        : `${normalizedOwnedProperty?.houses ?? 0} houses`}
                    </dd>
                  </div>
                  <div className="bg-white p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Build Cost
                    </dt>
                    <dd className="mt-1 font-black">
                      ${currentSquare.buildingCost}
                    </dd>
                  </div>
                </>
              )}
            </dl>
            <p className="border-t border-slate-950 bg-stone-50 p-3 text-sm font-semibold text-slate-700">
              {normalizedOwnedProperty?.mortgaged
                ? "This property is mortgaged."
                : ownedProperty
                  ? `Owned by ${propertyOwner?.name ?? "another player"}.`
                  : isAuctionPending
                    ? "Auction is active for this property."
                    : "This property is available."}
            </p>
          </div>
        ) : (
          <div className="border border-slate-950 bg-white p-4">
            {currentSquare.type === "TAX" ? (
              <dl>
                <dt className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Tax Amount
                </dt>
                <dd className="mt-2 text-3xl font-black">
                  ${getTaxAmount(currentSquare)}
                </dd>
              </dl>
            ) : (
              <p className="text-sm font-semibold leading-relaxed text-slate-700">
                {specialCopy}
              </p>
            )}
          </div>
        )}

        {latestCard && (
          <div className="mt-3 border border-slate-950 bg-amber-50 p-3">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-800">
              Latest Card
            </p>
            <p className="mt-1 text-sm font-black text-slate-950">
              {latestCard.description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
