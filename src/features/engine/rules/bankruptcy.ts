import { PropertySquare } from "@/features/types/board";
import { GameState, OwnedProperty } from "@/features/types/game";
import { addLog } from "./logging";
import {
  getMortgageValue,
  isColorProperty,
  normalizeOwnedProperty,
} from "./improvements";
import { checkWinCondition } from "./winConditions";

export type Creditor =
  | { type: "BANK" }
  | { type: "PLAYER"; playerId: string };

interface LiquidationResult {
  state: GameState;
  cashRaised: number;
}

export function resolveDebt(
  state: GameState,
  debtorId: string,
  amount: number,
  creditor: Creditor,
  paidMessage: string,
): GameState {
  if (amount <= 0) {
    return {
      ...state,
      log: addLog(state, paidMessage),
    };
  }

  const debtor = state.players.find((player) => player.id === debtorId);
  if (!debtor || debtor.status !== "ACTIVE") {
    return state;
  }

  let nextState = state;
  const cashNeeded = amount - debtor.cash;

  if (cashNeeded > 0) {
    nextState = liquidateAssetsForDebt(nextState, debtorId, cashNeeded).state;
  }

  const updatedDebtor = nextState.players.find(
    (player) => player.id === debtorId,
  );

  if (!updatedDebtor || updatedDebtor.cash < amount) {
    return checkWinCondition(
      declareBankruptcy(nextState, debtorId, creditor, amount),
    );
  }

  return checkWinCondition(payDebt(nextState, debtorId, amount, creditor, paidMessage));
}

export function declareBankruptcy(
  state: GameState,
  debtorId: string,
  creditor: Creditor,
  debtAmount: number,
): GameState {
  const debtor = state.players.find((player) => player.id === debtorId);
  if (!debtor || debtor.status !== "ACTIVE") {
    return state;
  }

  const liquidatedState = liquidateAllAssets(state, debtorId).state;
  const debtorAfterLiquidation = liquidatedState.players.find(
    (player) => player.id === debtorId,
  );
  const remainingCash = debtorAfterLiquidation?.cash ?? 0;
  const creditorPlayer =
    creditor.type === "PLAYER"
      ? liquidatedState.players.find((player) => player.id === creditor.playerId)
      : null;

  const nextPlayers = liquidatedState.players.map((player) => {
    if (player.id === debtorId) {
      return {
        ...player,
        cash: 0,
        status: "BANKRUPT" as const,
        jailState: {
          isInJail: false,
          turnsAttempted: 0,
        },
      };
    }

    if (creditor.type === "PLAYER" && player.id === creditor.playerId) {
      return {
        ...player,
        cash: player.cash + remainingCash,
      };
    }

    return player;
  });

  const nextOwnedProperties =
    creditor.type === "PLAYER"
      ? transferPropertiesToCreditor(
          liquidatedState.ownedProperties,
          debtorId,
          creditor.playerId,
        )
      : returnPropertiesToBank(liquidatedState.ownedProperties, debtorId);
  const auctionCleanedState = removeBankruptPlayerFromAuction(
    liquidatedState,
    debtorId,
  );

  const creditorName =
    creditor.type === "PLAYER"
      ? (creditorPlayer?.name ?? "another player")
      : "the bank";

  return {
    ...liquidatedState,
    players: nextPlayers,
    ownedProperties: nextOwnedProperties,
    auctionState: auctionCleanedState.auctionState,
    pendingRoll:
      liquidatedState.pendingRoll?.playerId === debtorId
        ? null
        : liquidatedState.pendingRoll,
    turnPhase:
      liquidatedState.pendingRoll?.playerId === debtorId
        ? "OPTIONAL_ACTIONS"
        : auctionCleanedState.turnPhase,
    log: addLog(
      liquidatedState,
      `${debtor.name} is bankrupt owing $${debtAmount} to ${creditorName}.`,
    ),
  };
}

export function liquidateAssetsForDebt(
  state: GameState,
  playerId: string,
  amountNeeded: number,
): LiquidationResult {
  let nextState = state;
  let cashRaised = 0;

  // Forced liquidation sells all buildings before mortgages so color groups never
  // end in a state that could not be reached by even selling.
  for (const property of getImprovedProperties(nextState, playerId)) {
    const result = sellAllBuildingsOnProperty(nextState, property);
    nextState = result.state;
    cashRaised += result.cashRaised;
  }

  for (const property of getMortgageableProperties(nextState, playerId)) {
    if (cashRaised >= amountNeeded) {
      break;
    }

    const result = mortgageProperty(nextState, property);
    nextState = result.state;
    cashRaised += result.cashRaised;
  }

  return { state: nextState, cashRaised };
}

function liquidateAllAssets(
  state: GameState,
  playerId: string,
): LiquidationResult {
  const afterBuildings = getImprovedProperties(state, playerId).reduce(
    (result, property) => {
      const nextResult = sellAllBuildingsOnProperty(result.state, property);
      return {
        state: nextResult.state,
        cashRaised: result.cashRaised + nextResult.cashRaised,
      };
    },
    { state, cashRaised: 0 },
  );

  return getMortgageableProperties(afterBuildings.state, playerId).reduce(
    (result, property) => {
      const nextResult = mortgageProperty(result.state, property);
      return {
        state: nextResult.state,
        cashRaised: result.cashRaised + nextResult.cashRaised,
      };
    },
    afterBuildings,
  );
}

function payDebt(
  state: GameState,
  debtorId: string,
  amount: number,
  creditor: Creditor,
  paidMessage: string,
): GameState {
  return {
    ...state,
    players: state.players.map((player) => {
      if (player.id === debtorId) {
        return {
          ...player,
          cash: player.cash - amount,
        };
      }

      if (creditor.type === "PLAYER" && player.id === creditor.playerId) {
        return {
          ...player,
          cash: player.cash + amount,
        };
      }

      return player;
    }),
    log: addLog(state, paidMessage),
  };
}

function transferPropertiesToCreditor(
  ownedProperties: OwnedProperty[],
  debtorId: string,
  creditorId: string,
): OwnedProperty[] {
  // This ruleset charges mortgage interest when the new owner unmortgages.
  return ownedProperties.map((ownedProperty) =>
    ownedProperty.ownerId === debtorId
      ? {
          ...normalizeOwnedProperty(ownedProperty),
          ownerId: creditorId,
        }
      : ownedProperty,
  );
}

function returnPropertiesToBank(
  ownedProperties: OwnedProperty[],
  debtorId: string,
): OwnedProperty[] {
  return ownedProperties.filter(
    (ownedProperty) => ownedProperty.ownerId !== debtorId,
  );
}

function removeBankruptPlayerFromAuction(
  state: GameState,
  playerId: string,
): GameState {
  if (!state.auctionState) {
    return state;
  }

  if (
    state.auctionState.currentBidderId !== playerId &&
    state.auctionState.topBidderId !== playerId
  ) {
    return state;
  }

  return {
    ...state,
    auctionState: null,
    turnPhase: "OPTIONAL_ACTIONS",
  };
}

function sellAllBuildingsOnProperty(
  state: GameState,
  ownedProperty: OwnedProperty,
): LiquidationResult {
  const property = getProperty(state, ownedProperty.propertyId);
  const normalized = normalizeOwnedProperty(ownedProperty);

  if (!property || !isColorProperty(property)) {
    return { state, cashRaised: 0 };
  }

  const buildingCount = normalized.houses + (normalized.hotel ? 5 : 0);
  if (buildingCount === 0) {
    return { state, cashRaised: 0 };
  }

  const cashRaised = buildingCount * Math.floor(property.buildingCost / 2);

  return {
    state: {
      ...state,
      players: increasePlayerCash(state, normalized.ownerId, cashRaised),
      ownedProperties: state.ownedProperties.map((candidate) =>
        candidate.propertyId === normalized.propertyId
          ? {
              ...normalized,
              houses: 0,
              hotel: false,
            }
          : candidate,
      ),
      log: addLog(
        state,
        `${getPlayerName(state, normalized.ownerId)} sold buildings on ${property.name} for $${cashRaised}.`,
      ),
    },
    cashRaised,
  };
}

function mortgageProperty(
  state: GameState,
  ownedProperty: OwnedProperty,
): LiquidationResult {
  const property = getProperty(state, ownedProperty.propertyId);
  const normalized = normalizeOwnedProperty(ownedProperty);

  if (!property || normalized.mortgaged) {
    return { state, cashRaised: 0 };
  }

  const cashRaised = getMortgageValue(property);

  return {
    state: {
      ...state,
      players: increasePlayerCash(state, normalized.ownerId, cashRaised),
      ownedProperties: state.ownedProperties.map((candidate) =>
        candidate.propertyId === normalized.propertyId
          ? {
              ...normalized,
              mortgaged: true,
            }
          : candidate,
      ),
      log: addLog(
        state,
        `${getPlayerName(state, normalized.ownerId)} mortgaged ${property.name} and received $${cashRaised}.`,
      ),
    },
    cashRaised,
  };
}

function getImprovedProperties(
  state: GameState,
  playerId: string,
): OwnedProperty[] {
  return state.ownedProperties.filter((ownedProperty) => {
    const normalized = normalizeOwnedProperty(ownedProperty);
    return (
      normalized.ownerId === playerId &&
      (normalized.houses > 0 || normalized.hotel)
    );
  });
}

function getMortgageableProperties(
  state: GameState,
  playerId: string,
): OwnedProperty[] {
  return state.ownedProperties.filter((ownedProperty) => {
    const normalized = normalizeOwnedProperty(ownedProperty);
    return normalized.ownerId === playerId && !normalized.mortgaged;
  });
}

function increasePlayerCash(
  state: GameState,
  playerId: string,
  amount: number,
) {
  return state.players.map((player) =>
    player.id === playerId
      ? {
          ...player,
          cash: player.cash + amount,
        }
      : player,
  );
}

function getProperty(
  state: GameState,
  propertyId: string,
): PropertySquare | null {
  const square = state.board.find((candidate) => candidate.id === propertyId);

  return square?.type === "PROPERTY" ? square : null;
}

function getPlayerName(state: GameState, playerId: string): string {
  return (
    state.players.find((player) => player.id === playerId)?.name ?? "Unknown"
  );
}
