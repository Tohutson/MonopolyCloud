import { describe, expect, it } from "vitest";
import { rollTwoDice } from "../dice";

describe("rollTwoDice", () => {
  it("returns two dice between 1 and 6 with a matching total", () => {
    for (let rollCount = 0; rollCount < 100; rollCount += 1) {
      const roll = rollTwoDice();

      expect(Number.isInteger(roll.die1)).toBe(true);
      expect(Number.isInteger(roll.die2)).toBe(true);
      expect(roll.die1).toBeGreaterThanOrEqual(1);
      expect(roll.die1).toBeLessThanOrEqual(6);
      expect(roll.die2).toBeGreaterThanOrEqual(1);
      expect(roll.die2).toBeLessThanOrEqual(6);
      expect(roll.total).toBe(roll.die1 + roll.die2);
    }
  });
});
