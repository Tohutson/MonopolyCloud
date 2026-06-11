import { BoardSquare } from "@/features/types/board";
import { AdvanceTarget, Card } from "@/features/types/cards";
import { GameState } from "@/features/types/game";
import { PASS_GO_REWARD } from "../rules/constants";
import { addLog } from "../rules/logging";
import {
  chargeCurrentPlayer,
  payCurrentPlayer,
} from "../rules/payments";
import { sendCurrentPlayerToJail } from "../rules/jail";

export function executeCard(state: GameState, card: Card): GameState {
  switch (card.type) {
    case "MOVE_TO":
      return moveCurrentPlayerToCardPosition(
        state,
        requiredNumber(card.position, card),
        card.description,
      );

    case "MOVE_RELATIVE":
      return moveCurrentPlayerByCardOffset(
        state,
        requiredNumber(card.relative, card),
        card.description,
      );

    case "PAY":
      return chargeCurrentPlayer(
        state,
        requiredNumber(card.amount, card),
        cardLogMessage(state, card.description),
      );

    case "RECEIVE":
    case "RECEIVE_FROM_BANK":
      return payCurrentPlayer(
        state,
        requiredNumber(card.amount, card),
        cardLogMessage(state, card.description),
      );

    case "PAY_EACH_PLAYER":
      return payEachPlayer(state, requiredNumber(card.amount, card), card);

    case "RECEIVE_EACH_PLAYER":
      return receiveFromEachPlayer(state, requiredNumber(card.amount, card), card);

    case "GO_TO_JAIL":
      return sendCurrentPlayerToJail(state, cardLogMessage(state, card.description));

    case "GET_OUT_OF_JAIL_FREE":
      return addGetOutOfJailFreeCard(state, card);

    case "ADVANCE_TO_NEAREST":
      return moveCurrentPlayerToCardPosition(
        state,
        findNearest(state, requiredTarget(card.target, card)).index,
        card.description,
      );

    case "REPAIRS":
      return chargeCurrentPlayer(state, 0, cardLogMessage(state, card.description));

    default:
      return state;
  }
}

export function findNearest(
  state: GameState,
  target: AdvanceTarget,
): BoardSquare {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const colorGroup = target === "railroad" ? "railroad" : "utility";
  const candidates = state.board.filter(
    (square) => square.type === "PROPERTY" && square.colorGroup === colorGroup,
  );

  if (candidates.length === 0) {
    throw new Error(`Could not find nearest ${target}.`);
  }

  return candidates.reduce((nearest, square) => {
    const nearestDistance = distanceToPosition(
      currentPlayer.position,
      nearest.index,
      state.board.length,
    );
    const squareDistance = distanceToPosition(
      currentPlayer.position,
      square.index,
      state.board.length,
    );

    return squareDistance < nearestDistance ? square : nearest;
  });
}

function moveCurrentPlayerToCardPosition(
  state: GameState,
  position: number,
  description: string,
): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const passedGo = position < currentPlayer.position;
  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      position,
      cash: passedGo ? player.cash + PASS_GO_REWARD : player.cash,
    };
  });

  return {
    ...state,
    players: updatedPlayers,
    log: addLog(state, cardLogMessage(state, description)),
  };
}

function moveCurrentPlayerByCardOffset(
  state: GameState,
  relative: number,
  description: string,
): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const boardSize = state.board.length;
  const rawPosition = currentPlayer.position + relative;
  const position = ((rawPosition % boardSize) + boardSize) % boardSize;
  const passedGo = relative > 0 && rawPosition >= boardSize;
  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      position,
      cash: passedGo ? player.cash + PASS_GO_REWARD : player.cash,
    };
  });

  return {
    ...state,
    players: updatedPlayers,
    log: addLog(state, cardLogMessage(state, description)),
  };
}

function payEachPlayer(
  state: GameState,
  amount: number,
  card: Card,
): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const otherPlayers = state.players.filter(
    (player) => player.id !== currentPlayer.id,
  );
  const updatedPlayers = state.players.map((player) => {
    if (player.id === currentPlayer.id) {
      return {
        ...player,
        cash: player.cash - amount * otherPlayers.length,
      };
    }

    return {
      ...player,
      cash: player.cash + amount,
    };
  });

  return {
    ...state,
    players: updatedPlayers,
    log: addLog(state, cardLogMessage(state, card.description)),
  };
}

function receiveFromEachPlayer(
  state: GameState,
  amount: number,
  card: Card,
): GameState {
  const currentPlayer = state.players[state.currentPlayerIndex];
  const otherPlayers = state.players.filter(
    (player) => player.id !== currentPlayer.id,
  );
  const updatedPlayers = state.players.map((player) => {
    if (player.id === currentPlayer.id) {
      return {
        ...player,
        cash: player.cash + amount * otherPlayers.length,
      };
    }

    return {
      ...player,
      cash: player.cash - amount,
    };
  });

  return {
    ...state,
    players: updatedPlayers,
    log: addLog(state, cardLogMessage(state, card.description)),
  };
}

function addGetOutOfJailFreeCard(state: GameState, card: Card): GameState {
  const updatedPlayers = state.players.map((player, index) => {
    if (index !== state.currentPlayerIndex) {
      return player;
    }

    return {
      ...player,
      getOutOfJailCards: player.getOutOfJailCards + 1,
    };
  });

  const currentPlayer = state.players[state.currentPlayerIndex];

  return {
    ...state,
    players: updatedPlayers,
    log: addLog(
      state,
      `${currentPlayer.name} drew a card: ${card.description} ${currentPlayer.name} kept it for later.`,
    ),
  };
}

function distanceToPosition(
  currentPosition: number,
  targetPosition: number,
  boardSize: number,
) {
  return (targetPosition - currentPosition + boardSize) % boardSize;
}

function cardLogMessage(state: GameState, description: string) {
  const currentPlayer = state.players[state.currentPlayerIndex];
  return `${currentPlayer.name} drew a card: ${description}`;
}

function requiredNumber(value: number | undefined, card: Card) {
  if (value === undefined) {
    throw new Error(`Card ${card.id} is missing a numeric payload.`);
  }

  return value;
}

function requiredTarget(value: AdvanceTarget | undefined, card: Card) {
  if (value === undefined) {
    throw new Error(`Card ${card.id} is missing an advance target.`);
  }

  return value;
}
