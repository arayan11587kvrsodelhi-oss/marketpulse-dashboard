// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DemandValidation } from "./demand-validation";

afterEach(cleanup);

function formForHeading(heading: string) {
  const form = screen.getByRole("heading", { name: heading }).closest("form");
  if (!form) throw new Error(`Missing form for ${heading}`);
  return within(form as HTMLElement);
}

describe("Demand validation", () => {
  it("labels plans as proposed and keeps unavailable features planned", () => {
    render(<DemandValidation />);

    expect(screen.getByText("Free")).toBeTruthy();
    expect(screen.getByText("₹0", { exact: false })).toBeTruthy();
    expect(screen.getByText("₹199–₹299", { exact: false })).toBeTruthy();
    expect(screen.getByText("Proposed for validation")).toBeTruthy();
    expect(screen.getAllByText("Planned")).toHaveLength(3);
    expect(screen.getByText("Discuss individually")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /subscribe|activate|purchase/i })).toBeNull();
  });

  it("validates individual email locally and reports that nothing was sent", () => {
    render(<DemandValidation />);
    const form = formForHeading("Individual early access");
    const email = form.getByLabelText(/Email/);

    fireEvent.submit(email.closest("form") as HTMLFormElement);
    expect(form.getByText("Please enter an email address.")).toBeTruthy();

    fireEvent.change(email, { target: { value: "person@example.com" } });
    fireEvent.submit(email.closest("form") as HTMLFormElement);
    expect(form.getByRole("status").textContent).toContain("nothing was sent or stored");
  });

  it("requires business name, work email, and dashboard description", () => {
    render(<DemandValidation />);
    const form = formForHeading("Business dashboard inquiry");
    const email = form.getByLabelText(/Work email/);

    fireEvent.submit(email.closest("form") as HTMLFormElement);
    expect(form.getByText("Please enter your name.")).toBeTruthy();
    expect(form.getByText("Please enter an email address.")).toBeTruthy();
    expect(form.getByText("Please describe the dashboard you need.")).toBeTruthy();

    fireEvent.change(form.getByLabelText("Name"), { target: { value: "Jordan Lee" } });
    fireEvent.change(email, { target: { value: "jordan@company.example" } });
    fireEvent.change(form.getByLabelText(/What dashboard would you need/), { target: { value: "A private research view." } });
    fireEvent.submit(email.closest("form") as HTMLFormElement);
    expect(form.getByRole("status").textContent).toContain("nothing was sent or stored");
  });
});
