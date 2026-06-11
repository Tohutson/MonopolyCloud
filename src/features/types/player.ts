export type PlayerStatus = "ACTIVE" | "BANKRUPT";

export interface Player {
  id: string;
  name: string;
  cash: number;
  position: number;
  status: PlayerStatus;
  getOutOfJailCards: number;
  jailState: JailState;
}

export interface JailState {
  isInJail: boolean;
  turnsAttempted: number;
}
