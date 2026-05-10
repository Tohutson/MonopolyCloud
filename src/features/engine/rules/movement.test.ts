import { describe, expect, it } from "vitest";
import { calculateNewPosition } from "./movement";

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
});
