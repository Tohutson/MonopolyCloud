import { GameState } from "../../types/game";
import { rollTwoDice } from "../dice";
import { calculateNewPosition } from "../movement";
import { PASS_GO_REWARD } from "../rules/constants";
import { addLog } from "../rules/logging";
import { resolveLandedSquare } from "../rules/squareResolution";

export function rollDiceAction(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (state.hasRolledThisTurn) {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  if (currentPlayer.status !== "ACTIVE") {
    return state;
  }

  const diceRoll = rollTwoDice();

  const movementResult = calculateNewPosition(
    currentPlayer.position,
    diceRoll.total,
    state.board.length,
  );

  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      position: movementResult.newPosition,

      cash: movementResult.passedStart
        ? player.cash + PASS_GO_REWARD
        : player.cash,
    };
  });

  const nextState: GameState = {
    ...state,
    players: updatedPlayers,
    lastDiceRoll: diceRoll,
    hasRolledThisTurn: true,
    log: addLog(
      state,
      `${currentPlayer.name} rolled ${diceRoll.die1} + ${diceRoll.die2} = ${diceRoll.total}.`,
    ),
  };

  return resolveLandedSquare(nextState);
}
