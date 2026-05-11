import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialGame } from "../createInitialGame";
import { rollTwoDice } from "../dice";
import { gameReducer } from "../gameReducer";
import { getPropertyOwnerId } from "../rules/ownership";
import {
  createActiveGameForTest,
  markPropertyOwned,
  markTurnRolled,
  setCurrentPlayerCash,
  setCurrentPlayerIndex,
  setCurrentPlayerPosition,
  setCurrentPlayerStatus,
} from "./testUtils";

vi.mock("../dice", () => ({
  rollTwoDice: vi.fn(),
}));

const mockedRollTwoDice = vi.mocked(rollTwoDice);

describe("gameReducer", () => {
  beforeEach(() => {
    mockedRollTwoDice.mockReset();
    mockedRollTwoDice.mockReturnValue({
      die1: 1,
      die2: 1,
      total: 2,
    });
  });

  describe("START_GAME", () => {
    it("starts the game and logs the event", () => {
      const initialState = createInitialGame();

      const nextState = gameReducer(initialState, {
        type: "START_GAME",
      });

      expect(nextState.status).toBe("ACTIVE");
      expect(nextState.log[0].message).toBe("Game started.");
    });

    it("keeps an already active game active and records the current start event", () => {
      const activeState = gameReducer(createInitialGame(), {
        type: "START_GAME",
      });

      const nextState = gameReducer(activeState, {
        type: "START_GAME",
      });

      expect(nextState.status).toBe("ACTIVE");
      expect(nextState.log).toHaveLength(activeState.log.length + 1);
      expect(nextState.log[0].message).toBe("Game started.");
    });
  });

  describe("RESET_GAME", () => {
    it("returns a fresh initial state", () => {
      const modifiedState = {
        ...markPropertyOwned(markTurnRolled(createActiveGameForTest()), "boardwalk", "player-1"),
        currentPlayerIndex: 1,
        players: createInitialGame().players.map((player, index) =>
          index === 0 ? { ...player, cash: 900, position: 39 } : player,
        ),
        log: [{ id: "test-log", message: "A previous event." }],
      };

      const resetState = gameReducer(modifiedState, {
        type: "RESET_GAME",
      });

      expect(resetState.status).toBe("NOT_STARTED");
      expect(resetState.currentPlayerIndex).toBe(0);
      expect(resetState.ownedProperties).toEqual([]);
      expect(resetState.log).toEqual([]);
      expect(resetState.hasRolledThisTurn).toBe(false);
      expect(resetState.lastDiceRoll).toBeNull();
      expect(resetState.players[0].cash).toBe(1500);
      expect(resetState.players[0].position).toBe(0);
    });
  });

  describe("ROLL_DICE", () => {
    it("does nothing when the game is not active", () => {
      const state = createInitialGame();

      const nextState = gameReducer(state, {
        type: "ROLL_DICE",
      });

      expect(nextState).toBe(state);
      expect(mockedRollTwoDice).not.toHaveBeenCalled();
    });

    it("rolls dice, moves the current player, stores the roll, and marks the turn rolled", () => {
      const state = createActiveGameForTest();

      const nextState = gameReducer(state, {
        type: "ROLL_DICE",
      });

      expect(nextState.players[0].position).toBe(2);
      expect(nextState.players[1].position).toBe(0);
      expect(nextState.lastDiceRoll).toEqual({
        die1: 1,
        die2: 1,
        total: 2,
      });
      expect(nextState.hasRolledThisTurn).toBe(true);
      expect(nextState.log[1].message).toBe("Player 1 rolled 1 + 1 = 2.");
    });

    it("does not move a second time in the same turn", () => {
      const state = gameReducer(createActiveGameForTest(), {
        type: "ROLL_DICE",
      });

      mockedRollTwoDice.mockReturnValue({
        die1: 3,
        die2: 3,
        total: 6,
      });

      const nextState = gameReducer(state, {
        type: "ROLL_DICE",
      });

      expect(nextState).toBe(state);
      expect(nextState.players[0].position).toBe(2);
      expect(mockedRollTwoDice).toHaveBeenCalledTimes(1);
    });

    it("adds the pass-Go reward when movement wraps around the board", () => {
      const state = setCurrentPlayerPosition(createActiveGameForTest(), 38);

      const nextState = gameReducer(state, {
        type: "ROLL_DICE",
      });

      expect(nextState.players[0].position).toBe(0);
      expect(nextState.players[0].cash).toBe(1700);
      expect(nextState.log[0].message).toBe(
        "Player 1 passed Start and collected $200.",
      );
    });

    it("does nothing when the current player is not active", () => {
      const state = setCurrentPlayerStatus(createActiveGameForTest(), "BANKRUPT");

      const nextState = gameReducer(state, {
        type: "ROLL_DICE",
      });

      expect(nextState).toBe(state);
      expect(mockedRollTwoDice).not.toHaveBeenCalled();
    });
  });

  describe("END_TURN", () => {
    it("does nothing before the current player has rolled", () => {
      const state = createActiveGameForTest();

      const nextState = gameReducer(state, {
        type: "END_TURN",
      });

      expect(nextState).toBe(state);
    });

    it("switches to the next player after rolling and resets turn roll state", () => {
      const state = markTurnRolled(createActiveGameForTest());

      const nextState = gameReducer(state, {
        type: "END_TURN",
      });

      expect(nextState.currentPlayerIndex).toBe(1);
      expect(nextState.hasRolledThisTurn).toBe(false);
      expect(nextState.lastDiceRoll).toBeNull();
      expect(nextState.log[0].message).toBe("Player 2's turn started.");
    });

    it("cycles from Player 2 back to Player 1", () => {
      const state = markTurnRolled(
        setCurrentPlayerIndex(createActiveGameForTest(), 1),
      );

      const nextState = gameReducer(state, {
        type: "END_TURN",
      });

      expect(nextState.currentPlayerIndex).toBe(0);
      expect(nextState.log[0].message).toBe("Player 1's turn started.");
    });
  });

  describe("BUY_PROPERTY", () => {
    it("does nothing when the game is not active", () => {
      const state = setCurrentPlayerPosition(createInitialGame(), 1);

      const nextState = gameReducer(state, {
        type: "BUY_PROPERTY",
        propertyId: "mediterranean-avenue",
      });

      expect(nextState).toBe(state);
    });

    it("does nothing when the current square is not a property", () => {
      const state = setCurrentPlayerPosition(createActiveGameForTest(), 0);

      const nextState = gameReducer(state, {
        type: "BUY_PROPERTY",
        propertyId: "go",
      });

      expect(nextState).toBe(state);
    });

    it("does nothing when the property id does not match the current square", () => {
      const state = setCurrentPlayerPosition(createActiveGameForTest(), 1);

      const nextState = gameReducer(state, {
        type: "BUY_PROPERTY",
        propertyId: "baltic-avenue",
      });

      expect(nextState).toBe(state);
    });

    it("buys an unowned property and records the owner", () => {
      const state = setCurrentPlayerPosition(createActiveGameForTest(), 1);

      const nextState = gameReducer(state, {
        type: "BUY_PROPERTY",
        propertyId: "mediterranean-avenue",
      });

      expect(nextState.players[0].cash).toBe(1440);
      expect(nextState.ownedProperties).toEqual([
        {
          propertyId: "mediterranean-avenue",
          ownerId: "player-1",
        },
      ]);
      expect(getPropertyOwnerId(nextState, "mediterranean-avenue")).toBe(
        "player-1",
      );
      expect(nextState.log[0].message).toBe(
        "Player 1 bought Mediterranean Avenue for $60.",
      );
    });

    it("does not duplicate an already owned property", () => {
      const state = markPropertyOwned(
        setCurrentPlayerPosition(createActiveGameForTest(), 1),
        "mediterranean-avenue",
        "player-2",
      );

      const nextState = gameReducer(state, {
        type: "BUY_PROPERTY",
        propertyId: "mediterranean-avenue",
      });

      expect(nextState.players[0].cash).toBe(1500);
      expect(nextState.ownedProperties).toHaveLength(1);
      expect(nextState.ownedProperties[0].ownerId).toBe("player-2");
      expect(nextState.log[0].message).toBe(
        "Mediterranean Avenue is already owned.",
      );
    });

    it("does not buy a property the player cannot afford", () => {
      const state = setCurrentPlayerCash(
        setCurrentPlayerPosition(createActiveGameForTest(), 1),
        59,
      );

      const nextState = gameReducer(state, {
        type: "BUY_PROPERTY",
        propertyId: "mediterranean-avenue",
      });

      expect(nextState.players[0].cash).toBe(59);
      expect(nextState.ownedProperties).toEqual([]);
      expect(nextState.log[0].message).toBe(
        "Player 1 cannot afford Mediterranean Avenue.",
      );
    });
  });
});
