"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameAction } from "../types/actions";
import { Card } from "../types/cards";
import { useGameStore } from "../store/useGameStore";
import { AuctionModal, CompletedAuctionResult } from "./AuctionModal";
import { BoardCenterPanel } from "./BoardCenterPanel";
import { BuildingManagementModal } from "./BuildingManagementModal";
import { CardDrawAnimation } from "./CardDrawAnimation";
import { GameBoard } from "./GameBoard";
import { GameHeader } from "./GameHeader";
import { GameLogButton } from "./GameLog";
import { PlayerAssetsModal } from "./PlayerAssetsModal";
import { PlayerPanel } from "./PlayerPanel";
import { TurnControls } from "./TurnControls";
import { useTurnAnimationController } from "./useTurnAnimationController";

export function GameScreen() {
  const state = useGameStore((store) => store.state);
  const rawDispatch = useGameStore((store) => store.dispatch);
  const stateRef = useRef(state);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [isAssetsOpen, setIsAssetsOpen] = useState(false);
  const [isBuildingsOpen, setIsBuildingsOpen] = useState(false);
  const [activeCardDraw, setActiveCardDraw] = useState<Card | null>(null);
  const [latestCard, setLatestCard] = useState<Card | null>(null);
  const [completedAuction, setCompletedAuction] =
    useState<CompletedAuctionResult | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const dispatch = useCallback(
    (action: GameAction) => {
      const currentState = stateRef.current;
      const currentPlayer =
        currentState.players[currentState.currentPlayerIndex];
      const currentSquare = currentState.board[currentPlayer.position];

      if (
        action.type === "RESOLVE_SQUARE" &&
        (currentSquare.type === "CHANCE" ||
          currentSquare.type === "COMMUNITY_CHEST")
      ) {
        const card =
          currentSquare.type === "CHANCE"
            ? currentState.chanceDeck[0]
            : currentState.communityChestDeck[0];

        if (card) {
          setActiveCardDraw(card);
          setLatestCard(card);
        }
      }

      if (
        action.type === "ROLL_DICE" ||
        action.type === "END_TURN" ||
        action.type === "RESET_GAME"
      ) {
        setLatestCard(null);
      }

      if (action.type === "RESET_GAME") {
        setActiveCardDraw(null);
        setCompletedAuction(null);
        setIsLogOpen(false);
        setIsAssetsOpen(false);
        setIsBuildingsOpen(false);
      }

      rawDispatch(action);

      const nextState = useGameStore.getState().state;
      const previousAuction = currentState.auctionState;

      if (nextState.auctionState) {
        setCompletedAuction(null);
      }

      if (previousAuction && !nextState.auctionState) {
        const property = nextState.board.find(
          (square) => square.id === previousAuction.propertyId,
        );
        const winner = previousAuction.topBidderId
          ? nextState.players.find(
              (player) => player.id === previousAuction.topBidderId,
            )
          : null;

        setCompletedAuction({
          propertyName: property?.name ?? "Property",
          winnerName: winner?.name ?? null,
          finalPrice: previousAuction.topBid,
        });
      }
    },
    [rawDispatch],
  );

  const turnAnimation = useTurnAnimationController(state, dispatch);

  const currentPlayer = state.players[state.currentPlayerIndex];
  const currentSquare = state.board[currentPlayer.position];

  const ownedProperty =
    currentSquare.type === "PROPERTY"
      ? state.ownedProperties.find(
          (owned) => owned.propertyId === currentSquare.id,
        )
      : undefined;

  const propertyOwner = ownedProperty
    ? (state.players.find((player) => player.id === ownedProperty.ownerId) ??
      null)
    : null;

  const isAuctionPending =
    state.status === "ACTIVE" &&
    state.turnPhase === "AUCTION" &&
    currentSquare.type === "PROPERTY" &&
    !ownedProperty;

  return (
    <main className="min-h-screen bg-stone-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <AuctionModal
        state={state}
        auctionState={state.auctionState}
        completedAuction={completedAuction}
        dispatch={dispatch}
        onCloseCompleted={() => setCompletedAuction(null)}
      />
      <PlayerAssetsModal
        state={state}
        dispatch={dispatch}
        isOpen={isAssetsOpen}
        onClose={() => setIsAssetsOpen(false)}
      />
      <BuildingManagementModal
        state={state}
        dispatch={dispatch}
        isOpen={isBuildingsOpen}
        onClose={() => setIsBuildingsOpen(false)}
      />
      <CardDrawAnimation
        card={activeCardDraw}
        onClose={() => setActiveCardDraw(null)}
      />

      <div className="mx-auto max-w-[1560px] space-y-5">
        <GameHeader state={state} currentPlayer={currentPlayer} />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_390px]">
          <section className="min-w-0">
            <GameBoard
              state={state}
              visualPlayerPositions={turnAnimation.visualPlayerPositions}
              centerContent={
                <BoardCenterPanel
                  state={state}
                  currentPlayer={currentPlayer}
                  currentSquare={currentSquare}
                  ownedProperty={ownedProperty}
                  propertyOwner={propertyOwner}
                  isAuctionPending={isAuctionPending}
                  latestCard={latestCard}
                />
              }
            />
          </section>

          <aside className="space-y-4 xl:max-h-[calc(100vh-150px)] xl:overflow-y-auto xl:pr-1">
            <TurnControls
              state={state}
              dispatch={dispatch}
              displayedDiceRoll={turnAnimation.displayedDiceRoll}
              isDiceRolling={turnAnimation.phase === "rolling-dice"}
              isTurnAnimating={turnAnimation.isAnimatingTurn}
              onOpenAssets={() => setIsAssetsOpen(true)}
              onOpenBuildings={() => setIsBuildingsOpen(true)}
            />
            <PlayerPanel state={state} />
            <div className="border border-slate-950 bg-white p-4 shadow-[4px_4px_0_#d6a531]">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="w-full border border-slate-950 bg-white px-4 py-2 text-sm font-black uppercase tracking-wide text-slate-950 transition hover:bg-amber-50"
                  onClick={() => setIsAssetsOpen(true)}
                >
                  Assets
                </button>
                <GameLogButton
                  entries={state.log}
                  isOpen={isLogOpen}
                  onClose={() => setIsLogOpen(false)}
                  onOpen={() => setIsLogOpen(true)}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
