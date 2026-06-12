"use client";

import { useMemo, useState } from "react";
import {
  canMortgageProperty,
  canUnmortgageProperty,
  getUnmortgageCost,
  isColorProperty,
  normalizeOwnedProperty,
} from "../engine/rules/improvements";
import { GameAction } from "../types/actions";
import { PropertySquare } from "../types/board";
import { GameState } from "../types/game";
import {
  controlHeaderKickerClass,
  controlHeaderTitleClass,
  controlSecondaryButtonClass,
} from "./controlStyles";

interface PlayerAssetsModalProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  isOpen: boolean;
  onClose: () => void;
}

function getProperty(state: GameState, propertyId: string) {
  const square = state.board.find((candidate) => candidate.id === propertyId);
  return square?.type === "PROPERTY" ? square : null;
}

function getAssetType(property: PropertySquare) {
  if (property.colorGroup === "railroad") {
    return "Railroad";
  }

  if (property.colorGroup === "utility") {
    return "Utility";
  }

  return "Property";
}

function getBuildingLabel(property: PropertySquare, houses: number, hotel: boolean) {
  if (!isColorProperty(property)) {
    return "No buildings";
  }

  if (hotel) {
    return "Hotel";
  }

  return `${houses} houses`;
}

export function PlayerAssetsModal({
  state,
  dispatch,
  isOpen,
  onClose,
}: PlayerAssetsModalProps) {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const [selectedPlayerId, setSelectedPlayerId] = useState(currentPlayer.id);

  const selectedPlayer =
    state.players.find((player) => player.id === selectedPlayerId) ??
    currentPlayer;
  const selectedAssets = useMemo(
    () =>
      state.ownedProperties
        .filter((ownedProperty) => ownedProperty.ownerId === selectedPlayer.id)
        .map((ownedProperty) => {
          const property = getProperty(state, ownedProperty.propertyId);
          return property
            ? {
                property,
                ownedProperty: normalizeOwnedProperty(ownedProperty),
              }
            : null;
        })
        .filter(
          (
            asset,
          ): asset is {
            property: PropertySquare;
            ownedProperty: ReturnType<typeof normalizeOwnedProperty>;
          } => Boolean(asset),
        )
        .sort((first, second) => first.property.index - second.property.index),
    [selectedPlayer.id, state],
  );
  const canManageMortgages =
    selectedPlayer.id === currentPlayer.id &&
    state.status === "ACTIVE" &&
    state.turnPhase === "OPTIONAL_ACTIONS";

  if (!isOpen) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6"
      role="dialog"
    >
      <section className="max-h-[88vh] w-full max-w-5xl overflow-hidden border border-slate-950 bg-white shadow-[8px_8px_0_#d6a531]">
        <div className="flex flex-col gap-4 border-b border-slate-950 p-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className={controlHeaderKickerClass}>Portfolio</p>
            <h2 className={controlHeaderTitleClass}>Player Assets</h2>
          </div>
          <button
            className="self-start border border-slate-950 bg-white px-3 py-1 text-sm font-black uppercase tracking-wide transition hover:bg-amber-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="grid max-h-[74vh] overflow-y-auto lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav className="border-b border-slate-950 bg-stone-50 p-3 lg:border-b-0 lg:border-r">
            <div className="grid gap-2">
              {state.players.map((player) => (
                <button
                  key={player.id}
                  className={`border px-3 py-2 text-left text-sm font-black uppercase tracking-wide ${
                    player.id === selectedPlayer.id
                      ? "border-slate-950 bg-amber-50"
                      : "border-slate-300 bg-white"
                  }`}
                  onClick={() => setSelectedPlayerId(player.id)}
                >
                  {player.name}
                </button>
              ))}
            </div>
          </nav>

          <div className="p-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="border border-slate-950 bg-stone-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Cash
                </p>
                <p className="mt-1 text-xl font-black">${selectedPlayer.cash}</p>
              </div>
              <div className="border border-slate-950 bg-stone-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Owned
                </p>
                <p className="mt-1 text-xl font-black">
                  {selectedAssets.length}
                </p>
              </div>
              <div className="border border-slate-950 bg-stone-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                  Jail Cards
                </p>
                <p className="mt-1 text-xl font-black">
                  {selectedPlayer.getOutOfJailCards}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {selectedAssets.length === 0 ? (
                <p className="border border-slate-200 bg-stone-50 p-3 text-sm font-semibold text-slate-600">
                  This player does not own any properties yet.
                </p>
              ) : (
                selectedAssets.map(({ property, ownedProperty }) => {
                  const mortgageCheck = canMortgageProperty(
                    state,
                    selectedPlayer.id,
                    property.id,
                  );
                  const unmortgageCheck = canUnmortgageProperty(
                    state,
                    selectedPlayer.id,
                    property.id,
                  );

                  return (
                    <article
                      key={property.id}
                      className="border border-slate-300 bg-white p-3"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p className="text-base font-black uppercase tracking-wide">
                            {property.name}
                          </p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            {getAssetType(property)} · {property.colorGroup}
                          </p>
                        </div>
                        <p className="self-start border border-slate-950 bg-stone-50 px-2 py-1 text-xs font-black uppercase tracking-wide">
                          {ownedProperty.mortgaged ? "Mortgaged" : "Active"}
                        </p>
                      </div>

                      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-4">
                        <div className="border border-slate-200 bg-stone-50 p-2">
                          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            Price
                          </dt>
                          <dd className="font-black">${property.price}</dd>
                        </div>
                        <div className="border border-slate-200 bg-stone-50 p-2">
                          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            Mortgage
                          </dt>
                          <dd className="font-black">
                            ${property.mortgageValue}
                          </dd>
                        </div>
                        <div className="border border-slate-200 bg-stone-50 p-2">
                          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            Unmortgage
                          </dt>
                          <dd className="font-black">
                            ${getUnmortgageCost(property)}
                          </dd>
                        </div>
                        <div className="border border-slate-200 bg-stone-50 p-2">
                          <dt className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                            Buildings
                          </dt>
                          <dd className="font-black">
                            {getBuildingLabel(
                              property,
                              ownedProperty.houses,
                              ownedProperty.hotel,
                            )}
                          </dd>
                        </div>
                      </dl>

                      {selectedPlayer.id === currentPlayer.id && (
                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                          <button
                            className={controlSecondaryButtonClass}
                            disabled={
                              !canManageMortgages || !mortgageCheck.allowed
                            }
                            title={mortgageCheck.reason}
                            onClick={() =>
                              dispatch({
                                type: "MORTGAGE_PROPERTY",
                                propertyId: property.id,
                              })
                            }
                          >
                            Mortgage
                          </button>
                          <button
                            className={controlSecondaryButtonClass}
                            disabled={
                              !canManageMortgages || !unmortgageCheck.allowed
                            }
                            title={unmortgageCheck.reason}
                            onClick={() =>
                              dispatch({
                                type: "UNMORTGAGE_PROPERTY",
                                propertyId: property.id,
                              })
                            }
                          >
                            Unmortgage
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
