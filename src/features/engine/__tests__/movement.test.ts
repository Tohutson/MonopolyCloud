import { describe, expect, it } from "vitest";
import { calculateNewPosition } from "../rules/movement";

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
