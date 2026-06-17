import { beforeEach, describe, expect, it, vi } from "vitest";
import { createInitialGame } from "../createInitialGame";
import { rollTwoDice } from "@/features/engine/rules/dice";
import { gameReducer } from "../gameReducer";
import { JAIL_POSITION } from "../rules/constants";
import { getPropertyOwnerId } from "../rules/ownership";
import { checkWinCondition } from "../rules/winConditions";
import {
  createActiveGameForTest,
  markPropertyDecision,
  markPropertyOwned,
  markTurnRolled,
  setCurrentPlayerCash,
  setCurrentPlayerIndex,
  setCurrentPlayerPosition,
  setCurrentPlayerStatus,
  setPlayerCash,
  setPlayerStatus,
} from "./testUtils";

vi.mock("@/features/engine/rules/dice", () => ({
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

    it("does not restart a finished game", () => {
      const finishedState = checkWinCondition({
        ...createActiveGameForTest(),
        players: createActiveGameForTest().players.map((player, index) =>
          index === 0 ? { ...player, status: "BANKRUPT" as const } : player,
        ),
      });

      const nextState = gameReducer(finishedState, {
        type: "START_GAME",
      });

      expect(nextState).toBe(finishedState);
      expect(nextState.status).toBe("FINISHED");
      expect(nextState.winnerId).toBe("player-2");
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
      expect(resetState.turnPhase).toBe("INACTIVE");
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

    it("rolls dice, stores a pending movement path, and enters moving", () => {
      mockedRollTwoDice.mockReturnValue({
        die1: 1,
        die2: 2,
        total: 3,
      });

      const state = setCurrentPlayerPosition(createActiveGameForTest(), 1);

      const nextState = gameReducer(state, {
        type: "ROLL_DICE",
      });

      expect(nextState.players[0].position).toBe(1);
      expect(nextState.players[1].position).toBe(0);
      expect(nextState.lastDiceRoll).toEqual({
        die1: 1,
        die2: 2,
        total: 3,
      });
      expect(nextState.pendingRoll).toEqual({
        playerId: "player-1",
        startPosition: 1,
        movementPath: [2, 3, 4],
        finalPosition: 4,
        passedStart: false,
      });
      expect(nextState.turnPhase).toBe("MOVING");
      expect(nextState.rolledDoublesCount).toBe(0);
      expect(nextState.diceRollSequence).toBe(1);
      expect(nextState.log[0].message).toBe("Player 1 rolled 1 + 2 = 3.");
    });

    it("keeps the turn open after rolling doubles", () => {
      mockedRollTwoDice.mockReturnValue({
        die1: 4,
        die2: 4,
        total: 8,
      });

      const state = setCurrentPlayerPosition(createActiveGameForTest(), 5);

      const nextState = gameReducer(state, {
        type: "ROLL_DICE",
      });

      expect(nextState.lastDiceRoll).toEqual({
        die1: 4,
        die2: 4,
        total: 8,
      });
      expect(nextState.pendingRoll).toEqual({
        playerId: "player-1",
        startPosition: 5,
        movementPath: [6, 7, 8, 9, 10, 11, 12, 13],
        finalPosition: 13,
        passedStart: false,
      });
      expect(nextState.turnPhase).toBe("MOVING");
      expect(nextState.rolledDoublesCount).toBe(1);
      expect(nextState.diceRollSequence).toBe(1);
      expect(nextState.log[0].message).toBe("Player 1 rolled 4 + 4 = 8.");
    });

    it("completes movement and enters square resolution", () => {
      const rolledState = gameReducer(
        setCurrentPlayerPosition(createActiveGameForTest(), 1),
        {
          type: "ROLL_DICE",
        },
      );

      const nextState = gameReducer(rolledState, {
        type: "COMPLETE_MOVE",
      });

      expect(nextState.players[0].position).toBe(3);
      expect(nextState.pendingRoll).toBeNull();
      expect(nextState.turnPhase).toBe("RESOLVE_SQUARE");
    });

    it("resolves the landed square after movement is complete", () => {
      const rolledState = gameReducer(
        setCurrentPlayerPosition(createActiveGameForTest(), 1),
        {
          type: "ROLL_DICE",
        },
      );

      const movedState = gameReducer(rolledState, {
        type: "COMPLETE_MOVE",
      });

      const nextState = gameReducer(movedState, {
        type: "RESOLVE_SQUARE",
      });

      expect(nextState.players[0].position).toBe(3);
      expect(nextState.pendingRoll).toBeNull();
      expect(nextState.turnPhase).toBe("PROPERTY_DECISION");
      expect(nextState.log[0].message).toBe(
        "Player 1 landed on Baltic Avenue. It is available for $60.",
      );
    });

    it("does not move a second time in the same turn", () => {
      mockedRollTwoDice.mockReturnValue({
        die1: 1,
        die2: 2,
        total: 3,
      });

      const state = gameReducer(
        setCurrentPlayerPosition(createActiveGameForTest(), 1),
        {
          type: "ROLL_DICE",
        },
      );

      mockedRollTwoDice.mockReturnValue({
        die1: 3,
        die2: 3,
        total: 6,
      });

      const nextState = gameReducer(state, {
        type: "ROLL_DICE",
      });

      expect(nextState).toBe(state);
      expect(nextState.players[0].position).toBe(1);
      expect(mockedRollTwoDice).toHaveBeenCalledTimes(1);
    });

    it("sends the player to jail after the third consecutive doubles roll", () => {
      mockedRollTwoDice.mockReturnValue({
        die1: 6,
        die2: 6,
        total: 12,
      });

      const state = {
        ...setCurrentPlayerPosition(createActiveGameForTest(), 7),
        rolledDoublesCount: 2,
      };

      const nextState = gameReducer(state, {
        type: "ROLL_DICE",
      });

      expect(nextState.players[0].position).toBe(JAIL_POSITION);
      expect(nextState.players[0].jailState.isInJail).toBe(true);
      expect(nextState.pendingRoll).toBeNull();
      expect(nextState.turnPhase).toBe("OPTIONAL_ACTIONS");
      expect(nextState.rolledDoublesCount).toBe(0);
      expect(nextState.diceRollSequence).toBe(1);
      expect(nextState.lastDiceRoll).toEqual({
        die1: 6,
        die2: 6,
        total: 12,
      });
      expect(nextState.log[0].message).toBe(
        "Player 1 rolled doubles for the third time and is sent to Jail!",
      );
    });

    it("adds the pass-Go reward when a pending roll wraps around the board", () => {
      const state = gameReducer(
        setCurrentPlayerPosition(createActiveGameForTest(), 38),
        {
          type: "ROLL_DICE",
        },
      );

      const movedState = gameReducer(state, {
        type: "COMPLETE_MOVE",
      });

      const nextState = gameReducer(movedState, {
        type: "RESOLVE_SQUARE",
      });

      expect(nextState.players[0].position).toBe(0);
      expect(nextState.players[0].cash).toBe(1700);
      expect(nextState.log[0].message).toBe(
        "Player 1 passed Start and collected $200.",
      );
    });

    it("can finish the game when utility rent bankrupts the current player", () => {
      mockedRollTwoDice.mockReturnValue({
        die1: 3,
        die2: 4,
        total: 7,
      });

      const state = markPropertyOwned(
        markPropertyOwned(
          setCurrentPlayerCash(
            setCurrentPlayerPosition(createActiveGameForTest(), 5),
            69,
          ),
          "electric-company",
          "player-2",
        ),
        "water-works",
        "player-2",
      );

      const rolledState = gameReducer(state, {
        type: "ROLL_DICE",
      });

      const movedState = gameReducer(rolledState, {
        type: "COMPLETE_MOVE",
      });

      const nextState = gameReducer(movedState, {
        type: "RESOLVE_SQUARE",
      });

      expect(nextState.players[0].cash).toBe(0);
      expect(nextState.players[0].status).toBe("BANKRUPT");
      expect(nextState.players[1].cash).toBe(1569);
      expect(nextState.status).toBe("FINISHED");
      expect(nextState.winnerId).toBe("player-2");
      expect(nextState.log[0].message).toBe("Player 2 wins the game!");
      expect(nextState.log[1].message).toBe(
        "Player 1 is bankrupt owing $70 to Player 2.",
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

    it("does nothing after the game is finished", () => {
      const finishedState = checkWinCondition({
        ...setCurrentPlayerPosition(createActiveGameForTest(), 38),
        players: createActiveGameForTest().players.map((player, index) =>
          index === 0
            ? { ...player, status: "BANKRUPT" as const, position: 38 }
            : player,
        ),
      });

      const nextState = gameReducer(finishedState, {
        type: "ROLL_DICE",
      });

      expect(nextState).toBe(finishedState);
      expect(mockedRollTwoDice).not.toHaveBeenCalled();
    });

    it("does nothing when there is no pending roll to resolve", () => {
      const state = createActiveGameForTest();

      const movedState = gameReducer(state, {
        type: "COMPLETE_MOVE",
      });

      const nextState = gameReducer(movedState, {
        type: "RESOLVE_SQUARE",
      });

      expect(nextState).toBe(state);
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

    it("does nothing while a roll is waiting for movement resolution", () => {
      const state = gameReducer(createActiveGameForTest(), {
        type: "ROLL_DICE",
      });

      const nextState = gameReducer(state, {
        type: "END_TURN",
      });

      expect(nextState).toBe(state);
      expect(nextState.currentPlayerIndex).toBe(0);
    });

    it("does nothing while an unowned property decision is pending", () => {
      const state = markPropertyDecision(
        setCurrentPlayerPosition(createActiveGameForTest(), 1),
      );

      const nextState = gameReducer(state, {
        type: "END_TURN",
      });

      expect(nextState).toBe(state);
      expect(nextState.currentPlayerIndex).toBe(0);
    });

    it("switches to the next player after rolling and resets turn roll state", () => {
      const state = markTurnRolled(createActiveGameForTest());

      const nextState = gameReducer(state, {
        type: "END_TURN",
      });

      expect(nextState.currentPlayerIndex).toBe(1);
      expect(nextState.turnPhase).toBe("ROLL_READY");
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

    it("does nothing after the game is finished", () => {
      const finishedState = markTurnRolled(
        checkWinCondition({
          ...createActiveGameForTest(),
          players: createActiveGameForTest().players.map((player, index) =>
            index === 0 ? { ...player, status: "BANKRUPT" as const } : player,
          ),
        }),
      );

      const nextState = gameReducer(finishedState, {
        type: "END_TURN",
      });

      expect(nextState).toBe(finishedState);
      expect(nextState.currentPlayerIndex).toBe(0);
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
      const state = markPropertyDecision(
        setCurrentPlayerPosition(createActiveGameForTest(), 1),
      );

      const nextState = gameReducer(state, {
        type: "BUY_PROPERTY",
        propertyId: "mediterranean-avenue",
      });

      expect(nextState.players[0].cash).toBe(1440);
      expect(nextState.ownedProperties).toEqual([
        {
          propertyId: "mediterranean-avenue",
          ownerId: "player-1",
          houses: 0,
          hotel: false,
          mortgaged: false,
        },
      ]);
      expect(getPropertyOwnerId(nextState, "mediterranean-avenue")).toBe(
        "player-1",
      );
      expect(nextState.log[0].message).toBe(
        "Player 1 bought Mediterranean Avenue for $60.",
      );
      expect(nextState.turnPhase).toBe("OPTIONAL_ACTIONS");
    });

    it("does not duplicate an already owned property", () => {
      const state = markPropertyOwned(
        markPropertyDecision(
          setCurrentPlayerPosition(createActiveGameForTest(), 1),
        ),
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
        markPropertyDecision(
          setCurrentPlayerPosition(createActiveGameForTest(), 1),
        ),
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
      expect(nextState.turnPhase).toBe("PROPERTY_DECISION");
    });

    it("does nothing when the property decision is not pending", () => {
      const state = markTurnRolled(
        setCurrentPlayerPosition(createActiveGameForTest(), 1),
      );

      const nextState = gameReducer(state, {
        type: "BUY_PROPERTY",
        propertyId: "mediterranean-avenue",
      });

      expect(nextState).toBe(state);
      expect(nextState.ownedProperties).toEqual([]);
    });

    it("does nothing after the game is finished", () => {
      const finishedState = checkWinCondition({
        ...setCurrentPlayerPosition(createActiveGameForTest(), 1),
        players: createActiveGameForTest().players.map((player, index) =>
          index === 0
            ? { ...player, status: "BANKRUPT" as const, position: 1 }
            : player,
        ),
      });

      const nextState = gameReducer(finishedState, {
        type: "BUY_PROPERTY",
        propertyId: "mediterranean-avenue",
      });

      expect(nextState).toBe(finishedState);
      expect(nextState.ownedProperties).toEqual([]);
    });
  });

  describe("DECLINE_PROPERTY", () => {
    it("starts an auction when the current player declines an unowned property", () => {
      const state = markPropertyDecision(
        setCurrentPlayerPosition(createActiveGameForTest(), 1),
      );

      const nextState = gameReducer(state, {
        type: "DECLINE_PROPERTY",
        propertyId: "mediterranean-avenue",
      });

      expect(nextState.turnPhase).toBe("AUCTION");
      expect(nextState.auctionState).toEqual({
        propertyId: "mediterranean-avenue",
        currentBidderId: "player-1",
        topBidderId: null,
        topBid: 0,
        passedPlayerIds: [],
        declinedByPlayerId: "player-1",
      });
      expect(nextState.ownedProperties).toEqual([]);
      expect(nextState.log[0].message).toBe(
        "Player 1 declined Mediterranean Avenue. Auction will start.",
      );
    });

    it("does nothing when the property decision is not pending", () => {
      const state = markTurnRolled(
        setCurrentPlayerPosition(createActiveGameForTest(), 1),
      );

      const nextState = gameReducer(state, {
        type: "DECLINE_PROPERTY",
        propertyId: "mediterranean-avenue",
      });

      expect(nextState).toBe(state);
    });
  });

  describe("auction actions", () => {
    function createAuctionState() {
      return gameReducer(
        markPropertyDecision(
          setCurrentPlayerPosition(createActiveGameForTest(), 1),
        ),
        {
          type: "DECLINE_PROPERTY",
          propertyId: "mediterranean-avenue",
        },
      );
    }

    it("keeps the declining player eligible to bid first", () => {
      const state = createAuctionState();

      expect(state.auctionState?.currentBidderId).toBe("player-1");
      expect(state.auctionState?.declinedByPlayerId).toBe("player-1");
    });

    it("lets the current bidder place a legal bid and rotates to the next eligible bidder", () => {
      const state = createAuctionState();

      const nextState = gameReducer(state, {
        type: "PLACE_AUCTION_BID",
        bidderId: "player-1",
        amount: 80,
      });

      expect(nextState.auctionState).toMatchObject({
        propertyId: "mediterranean-avenue",
        currentBidderId: "player-2",
        topBidderId: "player-1",
        topBid: 80,
        passedPlayerIds: [],
      });
      expect(nextState.log[0].message).toBe(
        "Player 1 bid $80 for Mediterranean Avenue.",
      );
    });

    it("does nothing when a non-current bidder tries to bid", () => {
      const state = createAuctionState();

      const nextState = gameReducer(state, {
        type: "PLACE_AUCTION_BID",
        bidderId: "player-2",
        amount: 80,
      });

      expect(nextState).toBe(state);
    });

    it("does nothing when a non-current bidder tries to pass", () => {
      const state = createAuctionState();

      const nextState = gameReducer(state, {
        type: "PASS_AUCTION_BID",
        bidderId: "player-2",
      });

      expect(nextState).toBe(state);
    });

    it("marks the current bidder out when they pass and rotates to the next eligible bidder", () => {
      const state = createAuctionState();

      const nextState = gameReducer(state, {
        type: "PASS_AUCTION_BID",
        bidderId: "player-1",
      });

      expect(nextState.auctionState).toMatchObject({
        currentBidderId: "player-2",
        topBidderId: null,
        topBid: 0,
        passedPlayerIds: ["player-1"],
      });
      expect(nextState.log[0].message).toBe(
        "Player 1 passed on Mediterranean Avenue.",
      );
    });

    it("skips bankrupt players and does not leave the auction stuck", () => {
      const state = gameReducer(
        markPropertyDecision(
          setPlayerStatus(
            setCurrentPlayerPosition(createActiveGameForTest(), 1),
            1,
            "BANKRUPT",
          ),
        ),
        {
          type: "DECLINE_PROPERTY",
          propertyId: "mediterranean-avenue",
        },
      );

      const nextState = gameReducer(state, {
        type: "PASS_AUCTION_BID",
        bidderId: "player-1",
      });

      expect(nextState.auctionState).toBeNull();
      expect(nextState.turnPhase).toBe("OPTIONAL_ACTIONS");
      expect(nextState.ownedProperties).toEqual([]);
      expect(nextState.log[0].message).toBe(
        "Auction ended for Mediterranean Avenue with no bids.",
      );
    });

    it("does not allow a player to bid more cash than they have", () => {
      const state = setPlayerCash(createAuctionState(), 0, 79);

      const nextState = gameReducer(state, {
        type: "PLACE_AUCTION_BID",
        bidderId: "player-1",
        amount: 80,
      });

      expect(nextState).toBe(state);
    });

    it("does not allow a bid less than or equal to the current top bid", () => {
      const state = gameReducer(createAuctionState(), {
        type: "PLACE_AUCTION_BID",
        bidderId: "player-1",
        amount: 80,
      });

      const nextState = gameReducer(state, {
        type: "PLACE_AUCTION_BID",
        bidderId: "player-2",
        amount: 80,
      });

      expect(nextState).toBe(state);
    });

    it("does not allow bidding on an already-owned property", () => {
      const state = markPropertyOwned(
        createAuctionState(),
        "mediterranean-avenue",
        "player-2",
      );

      const nextState = gameReducer(state, {
        type: "PLACE_AUCTION_BID",
        bidderId: "player-1",
        amount: 80,
      });

      expect(nextState).toBe(state);
    });

    it("ends with no owner if everyone passes before any bid is placed", () => {
      const state = gameReducer(createAuctionState(), {
        type: "PASS_AUCTION_BID",
        bidderId: "player-1",
      });

      const nextState = gameReducer(state, {
        type: "PASS_AUCTION_BID",
        bidderId: "player-2",
      });

      expect(nextState.auctionState).toBeNull();
      expect(nextState.turnPhase).toBe("OPTIONAL_ACTIONS");
      expect(nextState.ownedProperties).toEqual([]);
      expect(getPropertyOwnerId(nextState, "mediterranean-avenue")).toBeNull();
      expect(nextState.log[0].message).toBe(
        "Auction ended for Mediterranean Avenue with no bids.",
      );
    });

    it("awards the property when one bidder remains after at least one bid", () => {
      const state = gameReducer(createAuctionState(), {
        type: "PLACE_AUCTION_BID",
        bidderId: "player-1",
        amount: 80,
      });

      const nextState = gameReducer(state, {
        type: "PASS_AUCTION_BID",
        bidderId: "player-2",
      });

      expect(nextState.auctionState).toBeNull();
      expect(nextState.turnPhase).toBe("OPTIONAL_ACTIONS");
      expect(nextState.players[0].cash).toBe(1420);
      expect(nextState.ownedProperties).toEqual([
        {
          propertyId: "mediterranean-avenue",
          ownerId: "player-1",
          houses: 0,
          hotel: false,
          mortgaged: false,
        },
      ]);
      expect(getPropertyOwnerId(nextState, "mediterranean-avenue")).toBe(
        "player-1",
      );
      expect(nextState.log[0].message).toBe(
        "Player 1 won Mediterranean Avenue at auction for $80.",
      );
    });
  });
});
