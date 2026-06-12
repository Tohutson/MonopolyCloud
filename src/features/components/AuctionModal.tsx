"use client";

import { FormEvent } from "react";
import { GameAction } from "../types/actions";
import { AuctionState, GameState } from "../types/game";
import {
  controlHeaderKickerClass,
  controlHeaderTitleClass,
  controlPrimaryButtonClass,
  controlSecondaryButtonClass,
} from "./controlStyles";

export interface CompletedAuctionResult {
  propertyName: string;
  winnerName: string | null;
  finalPrice: number;
}

interface AuctionModalProps {
  state: GameState;
  auctionState: AuctionState | null;
  completedAuction: CompletedAuctionResult | null;
  dispatch: (action: GameAction) => void;
  onCloseCompleted: () => void;
}

export function AuctionModal({
  state,
  auctionState,
  completedAuction,
  dispatch,
  onCloseCompleted,
}: AuctionModalProps) {
  const property = auctionState
    ? state.board.find((square) => square.id === auctionState.propertyId)
    : null;
  const currentBidder = auctionState
    ? state.players.find((player) => player.id === auctionState.currentBidderId)
    : null;
  const topBidder = auctionState?.topBidderId
    ? state.players.find((player) => player.id === auctionState.topBidderId)
    : null;
  const minimumBid = auctionState ? auctionState.topBid + 1 : 1;
  const canBid = Boolean(
    auctionState &&
      currentBidder &&
      !auctionState.passedPlayerIds.includes(currentBidder.id) &&
      minimumBid <= currentBidder.cash,
  );

  function submitBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!auctionState || !currentBidder) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get("bidAmount"));

    if (
      !Number.isInteger(amount) ||
      amount < minimumBid ||
      amount > currentBidder.cash ||
      auctionState.passedPlayerIds.includes(currentBidder.id)
    ) {
      return;
    }

    dispatch({
      type: "PLACE_AUCTION_BID",
      bidderId: auctionState.currentBidderId,
      amount,
    });
  }

  if (completedAuction) {
    return (
      <div
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6"
        role="dialog"
      >
        <section className="w-full max-w-lg border border-slate-950 bg-white shadow-[8px_8px_0_#d6a531]">
          <div className="border-b border-slate-950 bg-slate-950 px-4 py-3 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
              Auction Complete
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase tracking-wide">
              {completedAuction.propertyName}
            </h2>
          </div>
          <div className="space-y-4 p-4">
            <div className="border border-slate-950 bg-stone-50 p-4 text-center">
              {completedAuction.winnerName ? (
                <>
                  <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">
                    Winner
                  </p>
                  <p className="mt-1 text-3xl font-black">
                    {completedAuction.winnerName}
                  </p>
                  <p className="mt-2 text-lg font-black text-amber-700">
                    ${completedAuction.finalPrice}
                  </p>
                </>
              ) : (
                <p className="text-lg font-black">
                  Auction ended with no bids.
                </p>
              )}
            </div>
            <button
              className={controlPrimaryButtonClass}
              onClick={onCloseCompleted}
            >
              Close Auction
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (!auctionState || property?.type !== "PROPERTY" || !currentBidder) {
    return null;
  }

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6"
      role="dialog"
    >
      <section className="max-h-[90vh] w-full max-w-4xl overflow-hidden border border-slate-950 bg-white shadow-[8px_8px_0_#d6a531]">
        <div className="border-b border-slate-950 bg-slate-950 px-4 py-3 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">
            Bank Auction
          </p>
          <h2 className="mt-1 text-2xl font-black uppercase tracking-wide">
            {property.name}
          </h2>
        </div>

        <div className="max-h-[78vh] overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-px border border-slate-950 bg-slate-200 text-sm lg:grid-cols-4">
            <div className="bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Property Price
              </p>
              <p className="mt-1 text-lg font-black">${property.price}</p>
            </div>
            <div className="bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Highest Bid
              </p>
              <p className="mt-1 text-lg font-black">${auctionState.topBid}</p>
            </div>
            <div className="bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Highest Bidder
              </p>
              <p className="mt-1 font-black">{topBidder?.name ?? "None"}</p>
            </div>
            <div className="bg-white p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                Current Bidder
              </p>
              <p className="mt-1 font-black">{currentBidder.name}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section className="border border-slate-950">
              <div className="border-b border-slate-950 bg-stone-50 px-3 py-2">
                <p className={controlHeaderKickerClass}>Participants</p>
                <h3 className={controlHeaderTitleClass}>Auction Table</h3>
              </div>
              <div className="grid gap-px bg-slate-200 sm:grid-cols-2">
                {state.players.map((player) => {
                  const hasPassed = auctionState.passedPlayerIds.includes(
                    player.id,
                  );
                  const isCurrentBidder = player.id === currentBidder.id;
                  const isTopBidder = player.id === topBidder?.id;

                  return (
                    <div key={player.id} className="bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-black uppercase tracking-wide">
                            {player.name}
                          </p>
                          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                            {hasPassed
                              ? "Passed"
                              : isCurrentBidder
                                ? "Current bidder"
                                : "Still in"}
                          </p>
                        </div>
                        <p className="border border-slate-950 bg-stone-50 px-2 py-1 text-sm font-black">
                          ${player.cash}
                        </p>
                      </div>
                      {isTopBidder && (
                        <p className="mt-2 border border-amber-600 bg-amber-50 px-2 py-1 text-xs font-black uppercase tracking-wide text-amber-800">
                          Highest bidder
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <form className="border border-slate-950 p-3" onSubmit={submitBid}>
              <p className={controlHeaderKickerClass}>Bid Action</p>
              <h3 className={controlHeaderTitleClass}>{currentBidder.name}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-600">
                Minimum bid: ${minimumBid}. Available cash: $
                {currentBidder.cash}.
              </p>

              <label className="mt-4 block">
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  Bid Amount
                </span>
                <input
                  key={`${auctionState.currentBidderId}-${auctionState.topBid}`}
                  className="mt-1 w-full border border-slate-950 px-3 py-2 text-lg font-black outline-none focus:bg-amber-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                  name="bidAmount"
                  min={minimumBid}
                  max={currentBidder.cash}
                  inputMode="numeric"
                  type="number"
                  defaultValue={Math.min(minimumBid, currentBidder.cash)}
                  disabled={!canBid}
                />
              </label>

              <div className="mt-4 grid gap-2">
                <button className={controlPrimaryButtonClass} disabled={!canBid}>
                  Place Bid
                </button>
                <button
                  className={controlSecondaryButtonClass}
                  type="button"
                  disabled={auctionState.passedPlayerIds.includes(
                    auctionState.currentBidderId,
                  )}
                  onClick={() =>
                    dispatch({
                      type: "PASS_AUCTION_BID",
                      bidderId: auctionState.currentBidderId,
                    })
                  }
                >
                  Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
