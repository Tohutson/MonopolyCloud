import { beforeEach, describe, expect, it, vi } from "vitest";
import { rollTwoDice } from "../../engine/rules/dice";
import { createInitialGame } from "../../engine/createInitialGame";
import { useGameStore } from "../useGameStore";

vi.mock("../../engine/rules/dice", () => ({
  rollTwoDice: vi.fn(),
}));

const mockedRollTwoDice = vi.mocked(rollTwoDice);

describe("useGameStore", () => {
  beforeEach(() => {
    mockedRollTwoDice.mockReset();
    mockedRollTwoDice.mockReturnValue({
      die1: 1,
      die2: 2,
      total: 3,
    });

    useGameStore.setState({
      state: createInitialGame(),
    });
  });

  it("dispatches START_GAME through the reducer", () => {
    useGameStore.getState().dispatch({
      type: "START_GAME",
    });

    expect(useGameStore.getState().state.status).toBe("ACTIVE");
  });

  it("keeps a roll pending until movement is completed and resolved", () => {
    useGameStore.getState().dispatch({
      type: "START_GAME",
    });

    useGameStore.getState().dispatch({
      type: "ROLL_DICE",
    });

    const rolledState = useGameStore.getState().state;
    const pendingRoll = rolledState.pendingRoll;

    expect(pendingRoll).not.toBeNull();
    if (!pendingRoll) {
      throw new Error("Expected a pending roll after rolling dice.");
    }
    expect(rolledState.players[0].position).toBe(0);

    useGameStore.getState().dispatch({
      type: "COMPLETE_MOVE",
    });

    const movedState = useGameStore.getState().state;

    expect(movedState.pendingRoll).toBeNull();
    expect(movedState.players[0].position).toBe(pendingRoll.finalPosition);
    expect(movedState.turnPhase).toBe("RESOLVE_SQUARE");

    useGameStore.getState().dispatch({
      type: "RESOLVE_SQUARE",
    });

    const resolvedState = useGameStore.getState().state;

    expect(resolvedState.pendingRoll).toBeNull();
    expect(resolvedState.players[0].position).toBe(pendingRoll.finalPosition);
    expect(resolvedState.turnPhase).toBe("PROPERTY_DECISION");
  });

  it("dispatches RESET_GAME back to a fresh initial state", () => {
    useGameStore.setState({
      state: {
        ...createInitialGame(),
        status: "ACTIVE",
        currentPlayerIndex: 1,
        ownedProperties: [
          {
            propertyId: "boardwalk",
            ownerId: "player-1",
            houses: 0,
            hotel: false,
            mortgaged: false,
          },
        ],
        log: [{ id: "test-log", message: "Previous event." }],
      },
    });

    useGameStore.getState().dispatch({
      type: "RESET_GAME",
    });

    const resetState = useGameStore.getState().state;

    expect(resetState.status).toBe("NOT_STARTED");
    expect(resetState.currentPlayerIndex).toBe(0);
    expect(resetState.ownedProperties).toEqual([]);
    expect(resetState.log).toEqual([]);
  });
});
