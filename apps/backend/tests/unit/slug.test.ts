import { describe, expect, it } from "vitest";
import { slugify } from "../../src/utils/slug";

describe("slugify", () => {
  it("lowercases and joins words with hyphens", () => {
    expect(slugify("Gunung Bromo")).toBe("gunung-bromo");
  });

  it("strips diacritics", () => {
    expect(slugify("Kénédi")).toBe("kenedi");
  });

  it("collapses punctuation and trims hyphens", () => {
    expect(slugify("  Bukit  Moko!! (Bandung) ")).toBe("bukit-moko-bandung");
  });

  it("returns an empty string for symbol-only input", () => {
    expect(slugify("!!!")).toBe("");
  });
});
