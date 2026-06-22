import { csvCell, toCsv } from "../src/lib/csv";
import { describe, it, expect } from "vitest";

describe("csv utility functions", () => {
  describe("csvCell", () => {
    it("should return empty string for null and undefined", () => {
      expect(csvCell(null)).toBe("");
      expect(csvCell(undefined)).toBe("");
    });

    it("should return string representation without quotes for standard strings, numbers, and booleans", () => {
      expect(csvCell("hello")).toBe("hello");
      expect(csvCell("hello world")).toBe("hello world");
      expect(csvCell(123)).toBe("123");
      expect(csvCell(0)).toBe("0");
      expect(csvCell(true)).toBe("true");
      expect(csvCell(false)).toBe("false");
    });

    it("should escape and quote values containing commas", () => {
      expect(csvCell("hello, world")).toBe('"hello, world"');
    });

    it("should escape and quote values containing newlines and carriage returns", () => {
      expect(csvCell("hello\nworld")).toBe('"hello\nworld"');
      expect(csvCell("hello\rworld")).toBe('"hello\rworld"');
      expect(csvCell("hello\r\nworld")).toBe('"hello\r\nworld"');
    });

    it("should escape double quotes by doubling them and wrapping in quotes (RFC 4180)", () => {
      expect(csvCell('hello "world"')).toBe('"hello ""world"""');
      expect(csvCell('"already quoted"')).toBe('"""already quoted"""');
    });

    it("should handle combinations of special characters", () => {
      expect(csvCell('hello, "world"\n')).toBe('"hello, ""world""\n"');
    });
  });

  describe("toCsv", () => {
    it("should return empty string for an empty array", () => {
      expect(toCsv([])).toBe("");
    });

    it("should correctly format a single row of data", () => {
      const data = [{ name: "Alice", age: 30, active: true }];
      const expectedCsv = "name,age,active\nAlice,30,true";
      expect(toCsv(data)).toBe(expectedCsv);
    });

    it("should correctly format multiple rows of data", () => {
      const data = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25 },
        { name: "Charlie", age: 35 },
      ];
      const expectedCsv = "name,age\nAlice,30\nBob,25\nCharlie,35";
      expect(toCsv(data)).toBe(expectedCsv);
    });

    it("should correctly escape values within the CSV", () => {
      const data = [
        { name: "Alice, the great", quote: 'She said "hello"' },
        { name: "Bob\nSmith", quote: "No quotes here" },
      ];
      const expectedCsv = 'name,quote\n"Alice, the great","She said ""hello"""\n"Bob\nSmith",No quotes here';
      expect(toCsv(data)).toBe(expectedCsv);
    });

    it("should handle missing keys by outputting empty cells based on first row headers", () => {
      const data = [
        { name: "Alice", age: 30, city: "London" },
        { name: "Bob", age: 25 }, // Missing city
        { name: "Charlie", city: "Paris" }, // Missing age
      ];
      const expectedCsv = "name,age,city\nAlice,30,London\nBob,25,\nCharlie,,Paris";
      expect(toCsv(data)).toBe(expectedCsv);
    });

    it("should ignore extra keys not present in the first row", () => {
      const data = [
        { name: "Alice", age: 30 },
        { name: "Bob", age: 25, extra: "ignored" }, // Extra key
      ] as Record<string, unknown>[];
      const expectedCsv = "name,age\nAlice,30\nBob,25";
      expect(toCsv(data)).toBe(expectedCsv);
    });
  });
});