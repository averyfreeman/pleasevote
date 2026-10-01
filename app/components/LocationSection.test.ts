import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import LocationSection, { directionsUrl, formatAddress } from "./LocationSection";
import type { VotingLocation } from "~/lib/types";

function location(overrides: Partial<VotingLocation> = {}): VotingLocation {
  return {
    id: "place-1",
    kind: "polling",
    address: { city: "Columbus", state: "OH", zip: "43214" },
    sources: [],
    ...overrides,
  };
}

describe("location presentation helpers", () => {
  it("uses provider addressLine values when line1 is absent", () => {
    expect(formatAddress({ addressLine: ["93 W Weisheimer Rd"], city: "Columbus", state: "OH", zip: "43214" })).toBe("93 W Weisheimer Rd · Columbus, OH, 43214");
  });

  it("falls back to an address when a coordinate is invalid", () => {
    const url = directionsUrl(location({ address: { line1: "1 Main St", city: "Columbus", state: "OH" }, point: { latitude: 91, longitude: 0 } }));
    expect(url).toContain(encodeURIComponent("1 Main St · Columbus, OH"));
    expect(url).not.toContain("91%2C0");
  });

  it("keeps coordinate-free records visible with provider services", () => {
    render(createElement(LocationSection, {
      title: "Election-day locations",
      description: "Possible places to vote.",
      results: { inRadius: [], outsideRadius: [], missingCoordinates: [location({ voterServices: "Accessible voting" })] },
      emptyMessage: "No nearby records.",
    }));

    expect(screen.getByRole("heading", { name: /without coordinates/i })).toBeVisible();
    expect(screen.getByText("Accessible voting")).toBeVisible();
    expect(screen.queryByText(/show more/i)).not.toBeInTheDocument();
  });
});
