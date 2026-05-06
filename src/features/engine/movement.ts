export interface MovementResult {
  newPosition: number;
  passedStart: boolean;
}

export function calculateNewPosition(
  currentPosition: number,
  spacesToMove: number,
  boardSize: number,
): MovementResult {
  const rawPosition = currentPosition + spacesToMove;
  const newPosition = rawPosition % boardSize;
  const passedStart = rawPosition >= boardSize;

  return {
    newPosition,
    passedStart,
  };
}
