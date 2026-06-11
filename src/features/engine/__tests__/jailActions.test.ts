import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  attemptJailRoll,
  payToLeaveJail,
  playGetOutOfJailCard,
  useGetOutOfJailCard,
} from "../actions/jailActions";
import { rollTwoDice } from "../rules/dice";
import { JAIL_POSITION } from "../rules/constants";
import {
  createActiveGameForTest,
  setCurrentPlayerPosition,
} from "./testUtils";
import { GameState } from "../../types/game";

vi.mock("../rules/dice", () => ({
  rollTwoDice: vi.fn(),
}));

const mockedRollTwoDice = vi.mocked(rollTwoDice);

function putCurrentPlayerInJail(state: GameState): GameState {
  return {
    ...setCurrentPlayerPosition(state, JAIL_POSITION),
    players: state.players.map((player, index) =>
      index === state.currentPlayerIndex
        ? {
            ...player,
            position: JAIL_POSITION,
            jailState: {
              ...player.jailState,
              isInJail: true,
            },
          }
        : player,
    ),
  };
}

function setCurrentPlayerJailCards(
  state: GameState,
  getOutOfJailCards: number,
): GameState {
  return {
    ...state,
    players: state.players.map((player, index) =>
      index === state.currentPlayerIndex
        ? {
            ...player,
            getOutOfJailCards,
          }
        : player,
    ),
  };
}

describe("jail actions", () => {
  beforeEach(() => {
    mockedRollTwoDice.mockReset();
  });

  it("lets the current player pay the fine before rolling", () => {
    const state = putCurrentPlayerInJail(createActiveGameForTest());

    const nextState = payToLeaveJail(state);

    expect(nextState.players[0].cash).toBe(1450);
    expect(nextState.players[0].jailState.isInJail).toBe(false);
    expect(nextState.players[0].jailState.turnsAttempted).toBe(0);
    expect(nextState.turnPhase).toBe("ROLL_READY");
    expect(nextState.log[0].message).toBe("Player 1 paid $50 to leave jail.");
  });

  it("uses a Get Out of Jail Free card without going negative", () => {
    const state = setCurrentPlayerJailCards(
      putCurrentPlayerInJail(createActiveGameForTest()),
      2,
    );

    const nextState = playGetOutOfJailCard(state);

    expect(nextState.players[0].jailState.isInJail).toBe(false);
    expect(nextState.players[0].getOutOfJailCards).toBe(1);
    expect(nextState.players[0].jailState.turnsAttempted).toBe(0);
    expect(nextState.log[0].message).toBe(
      "Player 1 used a Get Out of Jail Free card.",
    );
  });

  it("does not use a Get Out of Jail Free card when the player has none", () => {
    const state = putCurrentPlayerInJail(createActiveGameForTest());

    const nextState = playGetOutOfJailCard(state);

    expect(nextState).toBe(state);
    expect(nextState.players[0].getOutOfJailCards).toBe(0);
  });

  it("does not use a Get Out of Jail Free card when the player is not in jail", () => {
    const state = setCurrentPlayerJailCards(createActiveGameForTest(), 1);

    const nextState = useGetOutOfJailCard(state);

    expect(nextState).toBe(state);
    expect(nextState.players[0].getOutOfJailCards).toBe(1);
  });

  it("increments attempts and ends the roll when doubles are not rolled", () => {
    mockedRollTwoDice.mockReturnValue({
      die1: 2,
      die2: 3,
      total: 5,
    });
    const state = putCurrentPlayerInJail(createActiveGameForTest());

    const nextState = attemptJailRoll(state);

    expect(nextState.players[0].position).toBe(JAIL_POSITION);
    expect(nextState.players[0].jailState.isInJail).toBe(true);
    expect(nextState.players[0].jailState.turnsAttempted).toBe(1);
    expect(nextState.turnPhase).toBe("OPTIONAL_ACTIONS");
    expect(nextState.diceRollSequence).toBe(1);
    expect(nextState.lastDiceRoll).toEqual({ die1: 2, die2: 3, total: 5 });
  });

  it("releases and moves the player when doubles are rolled", () => {
    mockedRollTwoDice.mockReturnValue({
      die1: 3,
      die2: 3,
      total: 6,
    });
    const state = putCurrentPlayerInJail(createActiveGameForTest());

    const nextState = attemptJailRoll(state);

    expect(nextState.players[0].position).toBe(16);
    expect(nextState.players[0].cash).toBe(1500);
    expect(nextState.players[0].jailState.isInJail).toBe(false);
    expect(nextState.players[0].jailState.turnsAttempted).toBe(0);
    expect(nextState.turnPhase).toBe("OPTIONAL_ACTIONS");
    expect(nextState.diceRollSequence).toBe(1);
    expect(nextState.log[1].message).toBe(
      "Player 1 rolled doubles and got out of jail!",
    );
  });

  it("does not roll for jail release twice in the same turn", () => {
    mockedRollTwoDice.mockReturnValue({
      die1: 2,
      die2: 3,
      total: 5,
    });
    const state = {
      ...putCurrentPlayerInJail(createActiveGameForTest()),
      turnPhase: "OPTIONAL_ACTIONS" as const,
    };

    const nextState = attemptJailRoll(state);

    expect(nextState).toBe(state);
    expect(mockedRollTwoDice).not.toHaveBeenCalled();
  });
});
