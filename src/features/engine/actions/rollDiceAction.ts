import { GameState } from "../../types/game";
import { rollTwoDice } from "@/features/engine/rules/dice";
import {
  calculateNewPosition,
  getMovementPath,
} from "@/features/engine/rules/movement";
import { addLog } from "../rules/logging";
import { sendCurrentPlayerToJail } from "../rules/jail";

export function rollDiceAction(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (state.turnPhase !== "ROLL_READY") {
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

  const rolledDoubles = diceRoll.die1 === diceRoll.die2;

  if (rolledDoubles && state.rolledDoublesCount === 2) {
    return sendCurrentPlayerToJail(
      {
        ...state,
        lastDiceRoll: diceRoll,
        pendingRoll: null,
        turnPhase: "OPTIONAL_ACTIONS",
        rolledDoublesCount: 0,
        diceRollSequence: state.diceRollSequence + 1,
      },
      `${currentPlayer.name} rolled doubles for the third time and is sent to Jail!`,
    );
  }

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
    turnPhase: "MOVING",
    rolledDoublesCount: rolledDoubles ? state.rolledDoublesCount + 1 : 0,
    diceRollSequence: state.diceRollSequence + 1,
    log: addLog(
      state,
      `${currentPlayer.name} rolled ${diceRoll.die1} + ${diceRoll.die2} = ${diceRoll.total}.`,
    ),
  };
}
