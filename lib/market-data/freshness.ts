import type { DataFreshness } from "./types";

export function simulatedFreshness(): DataFreshness {
  return {
    status: "simulated",
    label: "Simulated fixture",
    isLive: false,
    isSimulated: true,
  };
}

export function unavailableFreshness(): DataFreshness {
  return {
    status: "unavailable",
    label: "Unavailable",
    isLive: false,
    isSimulated: true,
  };
}
