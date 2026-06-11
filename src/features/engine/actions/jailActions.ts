import { GameState } from "@/features/types/game";
import { addLog } from "../rules/logging";
import { rollTwoDice } from "../rules/dice";
import { calculateNewPosition } from "../rules/movement";
import { JAIL_FINE, MAX_JAIL_ATTEMPTS } from "../rules/constants";
import { resolveLandedSquare } from "../rules/squareResolution";
import { checkWinCondition } from "../rules/winConditions";

export function payToLeaveJail(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (state.pendingRoll) {
    return state;
  }

  if (state.turnPhase !== "ROLL_READY") {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  if (!currentPlayer.jailState.isInJail) {
    return state;
  }

  if (currentPlayer.cash < JAIL_FINE) {
    return {
      ...state,
      log: addLog(
        state,
        `${currentPlayer.name} cannot afford to pay to leave jail.`,
      ),
    };
  }

  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      cash: player.cash - JAIL_FINE,
      jailState: {
        ...player.jailState,
        isInJail: false,
        turnsAttempted: 0,
      },
    };
  });

  const updatedLog = addLog(
    state,
    `${currentPlayer.name} paid $50 to leave jail.`,
  );

  return {
    ...state,
    players: updatedPlayers,
    log: updatedLog,
  };
}

export function playGetOutOfJailCard(state: GameState): GameState {
  return spendGetOutOfJailCard(state);
}

export function useGetOutOfJailCard(state: GameState): GameState {
  return spendGetOutOfJailCard(state);
}

function spendGetOutOfJailCard(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (state.pendingRoll) {
    return state;
  }

  if (state.turnPhase !== "ROLL_READY") {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  if (!currentPlayer.jailState.isInJail) {
    return state;
  }

  if (currentPlayer.getOutOfJailCards <= 0) {
    return state;
  }

  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      getOutOfJailCards: player.getOutOfJailCards - 1,
      jailState: {
        ...player.jailState,
        isInJail: false,
        turnsAttempted: 0,
      },
    };
  });

  const updatedLog = addLog(
    state,
    `${currentPlayer.name} used a Get Out of Jail Free card.`,
  );

  return {
    ...state,
    players: updatedPlayers,
    log: updatedLog,
  };
}

export function attemptJailRoll(state: GameState): GameState {
  if (state.status !== "ACTIVE") {
    return state;
  }

  if (state.pendingRoll) {
    return state;
  }

  if (state.turnPhase !== "ROLL_READY") {
    return state;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];

  if (currentPlayer.status !== "ACTIVE") {
    return state;
  }

  if (!currentPlayer.jailState.isInJail) {
    return state;
  }

  const diceRoll = rollTwoDice();
  const rolledDoubles = diceRoll.die1 === diceRoll.die2;
  const nextAttemptCount = currentPlayer.jailState.turnsAttempted + 1;
  const mustLeaveJail = nextAttemptCount >= MAX_JAIL_ATTEMPTS;

  if (rolledDoubles || mustLeaveJail) {
    const updatedPlayers = state.players.map((player, index) => {
      if (index !== state.currentPlayerIndex) {
        return player;
      }

      const movementResult = calculateNewPosition(
        player.position,
        diceRoll.total,
        state.board.length,
      );

      return {
        ...player,
        position: movementResult.newPosition,
        cash:
          mustLeaveJail && !rolledDoubles
            ? player.cash - JAIL_FINE
            : player.cash,
        jailState: {
          ...player.jailState,
          isInJail: false,
          turnsAttempted: 0,
        },
      };
    });

    const message = rolledDoubles
      ? `${currentPlayer.name} rolled doubles and got out of jail!`
      : `${currentPlayer.name} failed to roll doubles for the third time, paid $${JAIL_FINE}, and left jail.`;

    let nextState: GameState = {
      ...state,
      players: updatedPlayers,
      lastDiceRoll: diceRoll,
      pendingRoll: null,
      turnPhase: "RESOLVE_SQUARE",
      rolledDoublesCount: 0,
      diceRollSequence: state.diceRollSequence + 1,
      log: addLog(state, message),
    };

    nextState = resolveLandedSquare(nextState);
    nextState = checkWinCondition({
      ...nextState,
      turnPhase: "OPTIONAL_ACTIONS",
    });

    return nextState;
  }

  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      jailState: {
        ...player.jailState,
        turnsAttempted: nextAttemptCount,
      },
    };
  });

  return {
    ...state,
    players: updatedPlayers,
    lastDiceRoll: diceRoll,
    turnPhase: "OPTIONAL_ACTIONS",
    rolledDoublesCount: 0,
    diceRollSequence: state.diceRollSequence + 1,
    log: addLog(
      state,
      `${currentPlayer.name} rolled ${diceRoll.die1} and ${diceRoll.die2} but did not get out of jail.`,
    ),
  };
}
