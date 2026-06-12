"use client";

import { FormEvent } from "react";
import { GameAction } from "../types/actions";
import { GameState } from "../types/game";
import {
  controlHeaderKickerClass,
  controlHeaderTitleClass,
  controlPanelClass,
  controlPrimaryButtonClass,
  controlSecondaryButtonClass,
} from "./controlStyles";

interface AuctionControlsProps {
  state: GameState;
  dispatch: (action: GameAction) => void;
}

export function AuctionControls({ state, dispatch }: AuctionControlsProps) {
  const auctionState = state.auctionState;

  const property = auctionState
    ? state.board.find((square) => square.id === auctionState.propertyId)
    : null;
  const currentBidder = auctionState
    ? state.players.find((player) => player.id === auctionState.currentBidderId)
    : null;
  const topBidder = auctionState?.topBidderId
    ? state.players.find((player) => player.id === auctionState.topBidderId)
    : null;
  const declinedByPlayer = auctionState
    ? state.players.find((player) => player.id === auctionState.declinedByPlayerId)
    : null;

  if (!auctionState || property?.type !== "PROPERTY" || !currentBidder) {
    return null;
  }

  const activeAuctionState = auctionState;
  const activeCurrentBidder = currentBidder;
  const minimumBid = activeAuctionState.topBid + 1;
  const canBid = minimumBid <= activeCurrentBidder.cash;

  function submitBid(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const amount = Number(formData.get("bidAmount"));

    if (
      !auctionState ||
      !Number.isInteger(amount) ||
      amount < minimumBid ||
      amount > activeCurrentBidder.cash
    ) {
      return;
    }

    dispatch({
      type: "PLACE_AUCTION_BID",
      bidderId: activeAuctionState.currentBidderId,
      amount,
    });
  }

  return (
    <section className={controlPanelClass}>
      <div className="border-b border-slate-950 pb-3">
        <p className={controlHeaderKickerClass}>Bank Auction</p>
        <h2 className={controlHeaderTitleClass}>{property.name}</h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-px border border-slate-950 bg-slate-200 text-sm">
        <div className="bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Current Bid
          </p>
          <p className="mt-1 text-lg font-black">${auctionState.topBid}</p>
        </div>
        <div className="bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Top Bidder
          </p>
          <p className="mt-1 font-black">{topBidder?.name ?? "None"}</p>
        </div>
        <div className="bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Current Bidder
          </p>
          <p className="mt-1 font-black">{currentBidder.name}</p>
        </div>
        <div className="bg-white p-3">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Cash
          </p>
          <p className="mt-1 font-black">${activeCurrentBidder.cash}</p>
        </div>
      </div>

      <p className="mt-3 text-sm font-semibold text-slate-700">
        {declinedByPlayer?.name ?? "The declining player"} may still bid. The
        first bid can be any amount above $0.
      </p>

      <form className="mt-4 space-y-3" onSubmit={submitBid}>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
            Bid Amount
          </span>
          <input
            key={`${auctionState.currentBidderId}-${auctionState.topBid}`}
            className="mt-1 w-full border border-slate-950 px-3 py-2 text-lg font-black outline-none focus:bg-amber-50"
            name="bidAmount"
            min={minimumBid}
            max={activeCurrentBidder.cash}
            inputMode="numeric"
            type="number"
            defaultValue={minimumBid}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <button className={controlPrimaryButtonClass} disabled={!canBid}>
            Place Bid
          </button>
          <button
            className={controlSecondaryButtonClass}
            type="button"
            onClick={() =>
              dispatch({
                type: "PASS_AUCTION_BID",
                bidderId: activeAuctionState.currentBidderId,
              })
            }
          >
            Pass
          </button>
        </div>
      </form>
    </section>
  );
}
