import { describe, expect, it } from "vitest";
import { gameReducer } from "../gameReducer";
import { resolveDebt } from "../rules/bankruptcy";
import {
  createActiveGameForTest,
  markPropertyOwned,
  setPlayerCash,
} from "./testUtils";

function withThreePlayers() {
  const state = createActiveGameForTest();

  return {
    ...state,
    players: [
      ...state.players,
      {
        id: "player-3",
        name: "Player 3",
        cash: 1500,
        position: 0,
        status: "ACTIVE" as const,
        getOutOfJailCards: 0,
        jailState: {
          isInJail: false,
          turnsAttempted: 0,
        },
      },
    ],
  };
}

describe("bankruptcy rules", () => {
  it("bankrupts a player to another player and transfers remaining assets", () => {
    const state = markPropertyOwned(
      setPlayerCash(createActiveGameForTest(), 0, 0),
      "boardwalk",
      "player-1",
    );

    const nextState = resolveDebt(
      state,
      "player-1",
      1_000,
      { type: "PLAYER", playerId: "player-2" },
      "Player 1 paid Player 2.",
    );

    expect(nextState.players[0]).toMatchObject({
      cash: 0,
      status: "BANKRUPT",
    });
    expect(nextState.players[1].cash).toBe(1_700);
    expect(nextState.ownedProperties).toContainEqual({
      propertyId: "boardwalk",
      ownerId: "player-2",
      houses: 0,
      hotel: false,
      mortgaged: true,
    });
    expect(nextState.status).toBe("FINISHED");
    expect(nextState.winnerId).toBe("player-2");
  });

  it("bankrupts a player to the bank and returns properties to bank ownership", () => {
    const state = markPropertyOwned(
      setPlayerCash(createActiveGameForTest(), 0, 0),
      "boardwalk",
      "player-1",
    );

    const nextState = resolveDebt(
      state,
      "player-1",
      1_000,
      { type: "BANK" },
      "Player 1 paid tax.",
    );

    expect(nextState.players[0]).toMatchObject({
      cash: 0,
      status: "BANKRUPT",
    });
    expect(nextState.ownedProperties).not.toContainEqual(
      expect.objectContaining({ propertyId: "boardwalk" }),
    );
    expect(nextState.status).toBe("FINISHED");
    expect(nextState.winnerId).toBe("player-2");
  });

  it("avoids bankruptcy by liquidating buildings and mortgages", () => {
    const state = markPropertyOwned(
      markPropertyOwned(setPlayerCash(createActiveGameForTest(), 0, 0), "park-place", "player-1", {
        houses: 1,
      }),
      "boardwalk",
      "player-1",
      { houses: 1 },
    );

    const nextState = resolveDebt(
      state,
      "player-1",
      300,
      { type: "BANK" },
      "Player 1 paid tax.",
    );

    expect(nextState.players[0]).toMatchObject({
      cash: 75,
      status: "ACTIVE",
    });
    expect(nextState.ownedProperties).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          propertyId: "park-place",
          houses: 0,
          mortgaged: true,
          ownerId: "player-1",
        }),
        expect.objectContaining({
          propertyId: "boardwalk",
          houses: 0,
          mortgaged: false,
          ownerId: "player-1",
        }),
      ]),
    );
  });

  it("skips bankrupt players in turn order", () => {
    const state = {
      ...withThreePlayers(),
      turnPhase: "OPTIONAL_ACTIONS" as const,
      players: withThreePlayers().players.map((player) =>
        player.id === "player-2"
          ? { ...player, status: "BANKRUPT" as const }
          : player,
      ),
    };

    const nextState = gameReducer(state, { type: "END_TURN" });

    expect(nextState.currentPlayerIndex).toBe(2);
    expect(nextState.players[nextState.currentPlayerIndex].id).toBe("player-3");
  });

  it("ends the game when bankruptcy leaves one active player", () => {
    const state = setPlayerCash(createActiveGameForTest(), 0, 0);

    const nextState = resolveDebt(
      state,
      "player-1",
      1,
      { type: "BANK" },
      "Player 1 paid tax.",
    );

    expect(nextState.status).toBe("FINISHED");
    expect(nextState.winnerId).toBe("player-2");
    expect(nextState.log[0].message).toBe("Player 2 wins the game!");
  });

  it("preserves mortgage status when property transfers to a creditor", () => {
    const state = markPropertyOwned(
      setPlayerCash(createActiveGameForTest(), 0, 0),
      "reading-railroad",
      "player-1",
      { mortgaged: true },
    );

    const nextState = resolveDebt(
      state,
      "player-1",
      100,
      { type: "PLAYER", playerId: "player-2" },
      "Player 1 paid rent.",
    );

    expect(nextState.ownedProperties).toContainEqual({
      propertyId: "reading-railroad",
      ownerId: "player-2",
      houses: 0,
      hotel: false,
      mortgaged: true,
    });
  });

  it("cleans property buildings when bankruptcy returns properties to the bank", () => {
    const state = markPropertyOwned(
      setPlayerCash(createActiveGameForTest(), 0, 0),
      "boardwalk",
      "player-1",
      { hotel: true },
    );

    const nextState = resolveDebt(
      state,
      "player-1",
      1_000,
      { type: "BANK" },
      "Player 1 paid tax.",
    );

    expect(nextState.ownedProperties).not.toContainEqual(
      expect.objectContaining({
        ownerId: "player-1",
        hotel: true,
      }),
    );
    expect(nextState.ownedProperties).not.toContainEqual(
      expect.objectContaining({
        propertyId: "boardwalk",
      }),
    );
  });
});
