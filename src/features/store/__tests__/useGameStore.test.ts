import { beforeEach, describe, expect, it } from "vitest";
import { createInitialGame } from "../../engine/createInitialGame";
import { useGameStore } from "../useGameStore";

describe("useGameStore", () => {
  beforeEach(() => {
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

  it("keeps a roll pending until movement is resolved", () => {
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
      type: "RESOLVE_ROLL",
    });

    const resolvedState = useGameStore.getState().state;

    expect(resolvedState.pendingRoll).toBeNull();
    expect(resolvedState.players[0].position).toBe(pendingRoll.finalPosition);
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
