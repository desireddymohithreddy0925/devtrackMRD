import { extractValidRepoFromGoal, ActivityGoal } from "../src/lib/goals-sync-utils";
import { describe, it, expect } from "vitest";

describe("goals-sync-utils", () => {
  describe("extractValidRepoFromGoal", () => {
    const createGoal = (overrides: Partial<ActivityGoal>): ActivityGoal => ({
      id: "1",
      unit: "commits",
      repo: null,
      repository: null,
      repo_name: null,
      ...overrides,
    });

    it("should return unchanged for a valid owner/repo string", () => {
      expect(extractValidRepoFromGoal(createGoal({ repo: "facebook/react" }))).toBe("facebook/react");
      expect(extractValidRepoFromGoal(createGoal({ repo: "my-org/my.repo_name-123" }))).toBe("my-org/my.repo_name-123");
    });

    it("should trim and return owner/repo with whitespace", () => {
      expect(extractValidRepoFromGoal(createGoal({ repo: "  facebook/react  " }))).toBe("facebook/react");
      expect(extractValidRepoFromGoal(createGoal({ repo: "\nfacebook/react\t" }))).toBe("facebook/react");
    });

    it("should return null for null and undefined values", () => {
      expect(extractValidRepoFromGoal(createGoal({ repo: null, repository: null, repo_name: null }))).toBeNull();
      // @ts-expect-error Testing undefined which might happen at runtime
      expect(extractValidRepoFromGoal(createGoal({ repo: undefined }))).toBeNull();
    });

    it("should return null for an empty string", () => {
      expect(extractValidRepoFromGoal(createGoal({ repo: "" }))).toBeNull();
      expect(extractValidRepoFromGoal(createGoal({ repo: "   " }))).toBeNull();
    });

    it("should return null for malformed identifiers", () => {
      // no slash
      expect(extractValidRepoFromGoal(createGoal({ repo: "facebookreact" }))).toBeNull();
      // double slash
      expect(extractValidRepoFromGoal(createGoal({ repo: "facebook//react" }))).toBeNull();
      // owner starts with hyphen
      expect(extractValidRepoFromGoal(createGoal({ repo: "-facebook/react" }))).toBeNull();
      // owner ends with hyphen
      expect(extractValidRepoFromGoal(createGoal({ repo: "facebook-/react" }))).toBeNull();
      // too many slashes
      expect(extractValidRepoFromGoal(createGoal({ repo: "facebook/react/extra" }))).toBeNull();
    });

    it("should return null for dot-only segments (. and ..)", () => {
      expect(extractValidRepoFromGoal(createGoal({ repo: "facebook/." }))).toBeNull();
      expect(extractValidRepoFromGoal(createGoal({ repo: "facebook/.." }))).toBeNull();
      // Valid dot usage should pass
      expect(extractValidRepoFromGoal(createGoal({ repo: "facebook/.github" }))).toBe("facebook/.github");
      expect(extractValidRepoFromGoal(createGoal({ repo: "facebook/react.js" }))).toBe("facebook/react.js");
    });

    it("should check all three possible fields (repo, repository, repo_name)", () => {
      expect(extractValidRepoFromGoal(createGoal({ repo: "owner/repo1" }))).toBe("owner/repo1");
      expect(extractValidRepoFromGoal(createGoal({ repository: "owner/repo2" }))).toBe("owner/repo2");
      expect(extractValidRepoFromGoal(createGoal({ repo_name: "owner/repo3" }))).toBe("owner/repo3");

      // Precedence: repo > repository > repo_name
      expect(extractValidRepoFromGoal(createGoal({ repo: "owner/repo1", repository: "owner/repo2" }))).toBe("owner/repo1");
      expect(extractValidRepoFromGoal(createGoal({ repo: null, repository: "owner/repo2", repo_name: "owner/repo3" }))).toBe("owner/repo2");
    });
  });
});
