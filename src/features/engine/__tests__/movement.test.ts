import { describe, expect, it } from "vitest";
import { calculateNewPosition, getMovementPath } from "../rules/movement";

describe("calculateNewPosition", () => {
  it("moves without passing start", () => {
    const result = calculateNewPosition(5, 3, 40);

    expect(result.newPosition).toBe(8);
    expect(result.passedStart).toBe(false);
  });

  it("wraps around the board when passing start", () => {
    const result = calculateNewPosition(38, 5, 40);

    expect(result.newPosition).toBe(3);
    expect(result.passedStart).toBe(true);
  });

  it("lands on start and counts as passing start when movement wraps exactly", () => {
    const result = calculateNewPosition(38, 2, 40);

    expect(result.newPosition).toBe(0);
    expect(result.passedStart).toBe(true);
  });
});

describe("getMovementPath", () => {
  it("returns each board position the token should visit", () => {
    expect(getMovementPath(5, 3, 40)).toEqual([6, 7, 8]);
  });

  it("wraps around the board from the final square to start", () => {
    expect(getMovementPath(38, 4, 40)).toEqual([39, 0, 1, 2]);
  });

  it("returns an empty path when no movement is requested", () => {
    expect(getMovementPath(10, 0, 40)).toEqual([]);
  });
});
