import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ThemeSwitcher from "./ThemeSwitcher";

const storage = {
  clear: vi.fn(),
  getItem: vi.fn(),
  key: vi.fn(),
  length: 0,
  removeItem: vi.fn(),
  setItem: vi.fn(),
} as unknown as Storage;

describe("ThemeSwitcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("localStorage", storage);
    document.documentElement.removeAttribute("data-theme");
    document.documentElement.style.colorScheme = "";
  });

  it("provides a labelled light/dark/system control without persisting lookup data", async () => {
    const user = userEvent.setup();
    render(<ThemeSwitcher />);

    const selector = screen.getByRole("combobox", { name: "Color theme" });
    expect(selector).toHaveValue("system");

    await user.selectOptions(selector, "dark");
    expect(selector).toHaveValue("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
