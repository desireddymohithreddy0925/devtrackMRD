import { describe, expect, it, vi, afterEach } from "vitest";
import dns from "dns/promises";
import { isSafeUrl } from "./ssrf-protection";

describe("SSRF Protection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should block 0.0.0.0 bypasses (routes to localhost)", async () => {
    // 1. Direct 0.0.0.0
    expect(await isSafeUrl("http://0.0.0.0/")).toBe(false);

    // 2. DNS resolving to 0.0.0.0
    vi.spyOn(dns, "lookup").mockResolvedValue([{ address: "0.0.0.0", family: 4 }] as any);
    expect(await isSafeUrl("http://some-malicious-domain.com/")).toBe(false);
  });
});
