import { GameState } from "../../types/game";
import { rollTwoDice } from "@/features/engine/rules/dice";
import {
  calculateNewPosition,
  getMovementPath,
} from "@/features/engine/rules/movement";
import { PASS_GO_REWARD } from "../rules/constants";
import { addLog } from "../rules/logging";
import { resolveLandedSquare } from "../rules/squareResolution";
import { checkWinCondition } from "../rules/winConditions";

export function rollDiceAction(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (state.hasRolledThisTurn) {
    return state;
  }

  if (state.pendingRoll) {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  if (currentPlayer.status !== "ACTIVE") {
    return state;
  }

  if (currentPlayer.jailState.isInJail) {
    return state;
  }

  const diceRoll = rollTwoDice();

  const movementResult = calculateNewPosition(
    currentPlayer.position,
    diceRoll.total,
    state.board.length,
  );

  return {
    ...state,
    lastDiceRoll: diceRoll,
    pendingRoll: {
      playerId: currentPlayer.id,
      startPosition: currentPlayer.position,
      movementPath: getMovementPath(
        currentPlayer.position,
        diceRoll.total,
        state.board.length,
      ),
      finalPosition: movementResult.newPosition,
      passedStart: movementResult.passedStart,
    },
    hasRolledThisTurn: true,
    log: addLog(
      state,
      `${currentPlayer.name} rolled ${diceRoll.die1} + ${diceRoll.die2} = ${diceRoll.total}.`,
    ),
  };
}

export function resolveRollAction(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  const pendingRoll = state.pendingRoll;

  if (!pendingRoll) {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  if (currentPlayer.id !== pendingRoll.playerId) {
    return state;
  }

  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      position: pendingRoll.finalPosition,

      cash: pendingRoll.passedStart
        ? player.cash + PASS_GO_REWARD
        : player.cash,
    };
  });

  const nextState: GameState = {
    ...state,
    players: updatedPlayers,
    pendingRoll: null,
  };

  const resolvedState = resolveLandedSquare(nextState);
  return checkWinCondition(resolvedState);
}
