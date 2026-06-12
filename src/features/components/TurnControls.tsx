import { GameAction } from "../types/actions";
import { DiceRoll, GameState } from "../types/game";
import { PropertySquare } from "../types/board";
import {
  canBuildHotel,
  canBuildHouse,
  canMortgageProperty,
  canSellHotel,
  canSellHouse,
  canUnmortgageProperty,
  getOwnedPropertyRecord,
  isColorProperty,
} from "../engine/rules/improvements";
import { calculateRentForProperty } from "../engine/rules/rent";
import {
  controlPanelClass,
  controlPrimaryButtonClass,
  controlSecondaryButtonClass,
  controlHeaderKickerClass,
  controlHeaderTitleClass,
} from "./controlStyles";
import { DiceRollDisplay } from "./DiceRollDisplay";

interface TurnControlsProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
  displayedDiceRoll?: DiceRoll | null;
  isDiceRolling?: boolean;
  isTurnAnimating?: boolean;
}

export function TurnControls({
  state,
  dispatch,
  displayedDiceRoll,
  isDiceRolling = false,
  isTurnAnimating = false,
}: TurnControlsProps) {
  const canStart = state.status === "NOT_STARTED";
  const canRoll =
    state.status === "ACTIVE" &&
    state.turnPhase === "ROLL_READY" &&
    !isTurnAnimating;
  const canEndTurn =
    state.status === "ACTIVE" &&
    state.turnPhase === "OPTIONAL_ACTIONS" &&
    !isTurnAnimating;
  const diceRollToDisplay = displayedDiceRoll ?? state.lastDiceRoll;
  const currentPlayer = state.players[state.currentPlayerIndex];
  const manageableProperties = state.ownedProperties
    .filter((ownedProperty) => ownedProperty.ownerId === currentPlayer.id)
    .map((ownedProperty) => {
      const square = state.board.find(
        (candidate) => candidate.id === ownedProperty.propertyId,
      );

      return square?.type === "PROPERTY" ? square : null;
    })
    .filter((property): property is PropertySquare => Boolean(property));

  return (
    <section className={controlPanelClass}>
      <div className="border-b border-slate-950 pb-3">
        <p className={controlHeaderKickerClass}>Round Desk</p>
        <h2 className={controlHeaderTitleClass}>Turn Controls</h2>
      </div>

      <DiceRollDisplay
        roll={diceRollToDisplay}
        isRolling={isDiceRolling}
        emptyMessage="No dice rolled yet."
      />

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          className={controlPrimaryButtonClass}
          disabled={!canStart}
          onClick={() => dispatch({ type: "START_GAME" })}
        >
          Start Game
        </button>
        <button
          className={controlPrimaryButtonClass}
          disabled={!canRoll}
          onClick={() => dispatch({ type: "ROLL_DICE" })}
        >
          Roll Dice
        </button>
        <button
          className={controlPrimaryButtonClass}
          disabled={!canEndTurn}
          onClick={() => dispatch({ type: "END_TURN" })}
        >
          End Turn
        </button>
        <button
          className={controlSecondaryButtonClass}
          onClick={() => dispatch({ type: "RESET_GAME" })}
        >
          Reset Game
        </button>
      </div>

      {manageableProperties.length > 0 && (
        <div className="mt-4 border-t border-slate-950 pt-4">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">
            Properties
          </p>

          <div className="mt-3 space-y-3">
            {manageableProperties.map((property) => {
              const ownedProperty = getOwnedPropertyRecord(state, property.id);
              const houseCheck = canBuildHouse(
                state,
                currentPlayer.id,
                property.id,
              );
              const hotelCheck = canBuildHotel(
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
              const mortgageCheck = canMortgageProperty(
                state,
                currentPlayer.id,
                property.id,
              );
              const unmortgageCheck = canUnmortgageProperty(
                state,
                currentPlayer.id,
                property.id,
              );
              const canUsePropertyActions =
                state.status === "ACTIVE" &&
                state.turnPhase === "OPTIONAL_ACTIONS" &&
                !isTurnAnimating;

              return (
                <div
                  key={property.id}
                  className="border border-slate-300 bg-white p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black leading-tight">
                        {property.name}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Rent ${calculateRentForProperty(
                          state,
                          property,
                          currentPlayer.id,
                        )}
                        {ownedProperty?.isMortgaged ? " · Mortgaged" : ""}
                      </p>
                    </div>
                    {isColorProperty(property) && (
                      <p className="border border-slate-950 px-2 py-1 text-xs font-black">
                        {ownedProperty?.hotel
                          ? "Hotel"
                          : `${ownedProperty?.houses ?? 0} houses`}
                      </p>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {isColorProperty(property) && (
                      <>
                        <button
                          className={controlSecondaryButtonClass}
                          disabled={!canUsePropertyActions || !houseCheck.allowed}
                          title={houseCheck.reason}
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
                          disabled={!canUsePropertyActions || !hotelCheck.allowed}
                          title={hotelCheck.reason}
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
                            !canUsePropertyActions || !sellHouseCheck.allowed
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
                            !canUsePropertyActions || !sellHotelCheck.allowed
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
                      </>
                    )}
                    <button
                      className={controlSecondaryButtonClass}
                      disabled={!canUsePropertyActions || !mortgageCheck.allowed}
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
                        !canUsePropertyActions || !unmortgageCheck.allowed
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}
