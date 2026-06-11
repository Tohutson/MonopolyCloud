import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { GameAction } from "../types/actions";
import { DiceRoll, GameState } from "../types/game";
import { TURN_ANIMATION_TIMING } from "./turnAnimationConfig";

export type TurnAnimationPhase =
  | "idle"
  | "rolling-dice"
  | "moving-token"
  | "resolving";

interface TurnAnimationController {
  displayedDiceRoll: DiceRoll | null;
  isAnimatingTurn: boolean;
  phase: TurnAnimationPhase;
  visualPlayerPositions: Record<string, number>;
}

function randomDieFace() {
  return Math.floor(Math.random() * 6) + 1;
}

function randomDiceRoll(): DiceRoll {
  const die1 = randomDieFace();
  const die2 = randomDieFace();

  return {
    die1,
    die2,
    total: die1 + die2,
  };
}

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

export function useTurnAnimationController(
  state: GameState,
  dispatch: (action: GameAction) => void,
): TurnAnimationController {
  const shouldReduceMotion = useReducedMotion();
  const [displayedDiceRoll, setDisplayedDiceRoll] = useState<DiceRoll | null>(
    state.lastDiceRoll,
  );
  const [phase, setPhase] = useState<TurnAnimationPhase>("idle");
  const [visualPlayerPositions, setVisualPlayerPositions] = useState<
    Record<string, number>
  >({});
  const lastHandledDiceRollSequence = useRef(state.diceRollSequence);

  useEffect(() => {
    if (!state.lastDiceRoll) {
      lastHandledDiceRollSequence.current = state.diceRollSequence;
      return;
    }

    if (state.diceRollSequence === lastHandledDiceRollSequence.current) {
      return;
    }

    lastHandledDiceRollSequence.current = state.diceRollSequence;

    const pendingRoll = state.pendingRoll;
    const activePendingRoll = pendingRoll;
    const finalDiceRoll = state.lastDiceRoll;
    let isCancelled = false;
    let diceShuffleTimer: number | undefined;

    async function animatePendingRoll() {
      if (activePendingRoll) {
        setVisualPlayerPositions({
          [activePendingRoll.playerId]: activePendingRoll.startPosition,
        });
      }

      if (shouldReduceMotion) {
        setDisplayedDiceRoll(finalDiceRoll);
      } else {
        setPhase("rolling-dice");
        setDisplayedDiceRoll(randomDiceRoll());
        diceShuffleTimer = window.setInterval(() => {
          setDisplayedDiceRoll(randomDiceRoll());
        }, TURN_ANIMATION_TIMING.diceFaceShuffleMs);

        await wait(TURN_ANIMATION_TIMING.diceRollDurationMs);
        window.clearInterval(diceShuffleTimer);
      }

      if (isCancelled) {
        return;
      }

      setDisplayedDiceRoll(finalDiceRoll);

      if (!activePendingRoll) {
        setVisualPlayerPositions({});
        setPhase("idle");
        return;
      }

      setPhase("moving-token");

      const stepDuration = shouldReduceMotion
        ? 0
        : TURN_ANIMATION_TIMING.tokenStepDurationMs;

      for (const position of activePendingRoll.movementPath) {
        if (isCancelled) {
          return;
        }

        setVisualPlayerPositions({
          [activePendingRoll.playerId]: position,
        });

        if (stepDuration > 0) {
          await wait(stepDuration);
        }
      }

      if (isCancelled) {
        return;
      }

      setPhase("resolving");
      dispatch({ type: "COMPLETE_MOVE" });
      setVisualPlayerPositions({});
      setPhase("idle");
    }

    void animatePendingRoll();

    return () => {
      isCancelled = true;

      if (diceShuffleTimer !== undefined) {
        window.clearInterval(diceShuffleTimer);
      }
    };
  }, [dispatch, shouldReduceMotion, state.diceRollSequence, state.lastDiceRoll, state.pendingRoll]);

  useEffect(() => {
    if (state.turnPhase !== "RESOLVE_SQUARE") {
      return;
    }

    dispatch({ type: "RESOLVE_SQUARE" });
  }, [dispatch, state.turnPhase]);

  return {
    displayedDiceRoll:
      phase !== "idle" || state.pendingRoll ? displayedDiceRoll : state.lastDiceRoll,
    isAnimatingTurn: phase !== "idle",
    phase,
    visualPlayerPositions: state.pendingRoll ? visualPlayerPositions : {},
  };
}
