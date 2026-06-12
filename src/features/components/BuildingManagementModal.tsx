import {
  canBuildHotel,
  canBuildHouse,
  canSellHotel,
  canSellHouse,
  getColorGroupProperties,
  getOwnedPropertyRecord,
  isColorProperty,
  ownsFullColorGroup,
} from "../engine/rules/improvements";
import { GameAction } from "../types/actions";
import { PropertySquare } from "../types/board";
import { GameState } from "../types/game";
import {
  controlHeaderKickerClass,
  controlHeaderTitleClass,
  controlSecondaryButtonClass,
} from "./controlStyles";

interface BuildingManagementModalProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  isOpen: boolean;
  onClose: () => void;
}

const groupOrder = [
  "brown",
  "light-blue",
  "pink",
  "orange",
  "red",
  "yellow",
  "green",
  "dark-blue",
];

function getPlayerColorGroups(state: GameState, playerId: string) {
  const groups = new Set<string>();

  for (const ownedProperty of state.ownedProperties) {
    if (ownedProperty.ownerId !== playerId) {
      continue;
    }

    const square = state.board.find(
      (candidate) => candidate.id === ownedProperty.propertyId,
    );

    if (square?.type === "PROPERTY" && isColorProperty(square)) {
      groups.add(square.colorGroup);
    }
  }

  return groupOrder.filter((group) => groups.has(group));
}

function getBuildingStatus(property: PropertySquare, state: GameState) {
  const ownedProperty = getOwnedPropertyRecord(state, property.id);

  if (ownedProperty?.hotel) {
    return "Hotel";
  }

  return `${ownedProperty?.houses ?? 0} houses`;
}

export function BuildingManagementModal({
  state,
  dispatch,
  isOpen,
  onClose,
}: BuildingManagementModalProps) {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const groups = getPlayerColorGroups(state, currentPlayer.id);
  const canUseActions =
    state.status === "ACTIVE" && state.turnPhase === "OPTIONAL_ACTIONS";

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
            <p className={controlHeaderKickerClass}>Construction Desk</p>
            <h2 className={controlHeaderTitleClass}>Manage Buildings</h2>
            <p className="mt-2 text-sm font-semibold text-slate-600">
              {currentPlayer.name} cash:{" "}
              <span className="font-black text-slate-950">
                ${currentPlayer.cash}
              </span>
            </p>
          </div>
          <button
            className="self-start border border-slate-950 bg-white px-3 py-1 text-sm font-black uppercase tracking-wide transition hover:bg-amber-50"
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="max-h-[74vh] space-y-4 overflow-y-auto p-4">
          {groups.length === 0 ? (
            <p className="border border-slate-200 bg-stone-50 p-3 text-sm font-semibold text-slate-600">
              {currentPlayer.name} does not own any color properties yet.
            </p>
          ) : (
            groups.map((group) => {
              const properties = getColorGroupProperties(state, group);
              const playerOwnsFullGroup = ownsFullColorGroup(
                state,
                currentPlayer.id,
                group,
              );
              const buildingCost = properties[0]?.buildingCost ?? 0;

              return (
                <section
                  key={group}
                  className="border border-slate-950 bg-stone-50"
                >
                  <div className="flex flex-col gap-2 border-b border-slate-950 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-wide">
                        {group}
                      </h3>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                        {playerOwnsFullGroup
                          ? "Eligible color set"
                          : "Full color set required"}
                      </p>
                    </div>
                    <p className="self-start border border-slate-950 bg-amber-50 px-3 py-1 text-sm font-black">
                      Build cost ${buildingCost}
                    </p>
                  </div>

                  <div className="grid gap-px bg-slate-200 lg:grid-cols-3">
                    {properties.map((property) => {
                      const ownedProperty = getOwnedPropertyRecord(
                        state,
                        property.id,
                      );
                      const buildHouseCheck = canBuildHouse(
                        state,
                        currentPlayer.id,
                        property.id,
                      );
                      const buildHotelCheck = canBuildHotel(
                        state,
                        currentPlayer.id,
                        property.id,
                      );
                      const sellHouseCheck = canSellHouse(
                        state,
                        currentPlayer.id,
                        property.id,
                      );
                      const sellHotelCheck = canSellHotel(
                        state,
                        currentPlayer.id,
                        property.id,
                      );

                      return (
                        <article key={property.id} className="bg-white p-3">
                          <div className="min-h-[80px]">
                            <p className="font-black uppercase leading-tight tracking-wide">
                              {property.name}
                            </p>
                            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                              {ownedProperty
                                ? getBuildingStatus(property, state)
                                : "Not owned"}
                              {ownedProperty?.mortgaged ? " · Mortgaged" : ""}
                            </p>
                          </div>

                          <div className="mt-3 grid grid-cols-2 gap-2">
                            <button
                              className={controlSecondaryButtonClass}
                              disabled={
                                !canUseActions || !buildHouseCheck.allowed
                              }
                              title={buildHouseCheck.reason}
                              onClick={() =>
                                dispatch({
                                  type: "BUY_HOUSE",
                                  propertyId: property.id,
                                })
                              }
                            >
                              Buy House
                            </button>
                            <button
                              className={controlSecondaryButtonClass}
                              disabled={
                                !canUseActions || !buildHotelCheck.allowed
                              }
                              title={buildHotelCheck.reason}
                              onClick={() =>
                                dispatch({
                                  type: "BUY_HOTEL",
                                  propertyId: property.id,
                                })
                              }
                            >
                              Buy Hotel
                            </button>
                            <button
                              className={controlSecondaryButtonClass}
                              disabled={
                                !canUseActions || !sellHouseCheck.allowed
                              }
                              title={sellHouseCheck.reason}
                              onClick={() =>
                                dispatch({
                                  type: "SELL_HOUSE",
                                  propertyId: property.id,
                                })
                              }
                            >
                              Sell House
                            </button>
                            <button
                              className={controlSecondaryButtonClass}
                              disabled={
                                !canUseActions || !sellHotelCheck.allowed
                              }
                              title={sellHotelCheck.reason}
                              onClick={() =>
                                dispatch({
                                  type: "SELL_HOTEL",
                                  propertyId: property.id,
                                })
                              }
                            >
                              Sell Hotel
                            </button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
