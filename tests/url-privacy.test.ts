import { describe, expect, it } from "vitest";
import { privateUrl } from "@/lib/url-privacy";

describe("privateUrl", () => {
  it("keeps only routine settings on /session (absolute and relative)", () => {
    expect(privateUrl("https://www.bestfittips.com/session?d=5&l=desk&token=abc&email=a@b.co#x")).toBe("https://www.bestfittips.com/session?d=5&l=desk");
    expect(privateUrl("/session?d=2&f=energy&utm_source=x")).toBe("/session?d=2&f=energy");
  });

  it("drops all params elsewhere and survives garbage", () => {
    expect(privateUrl("/routines?name=bob")).toBe("/routines");
    expect(privateUrl("https://www.bestfittips.com/?q=1#top")).toBe("https://www.bestfittips.com/");
    expect(privateUrl("http://[::1")).toBe("[unparseable url]");
  });
});
