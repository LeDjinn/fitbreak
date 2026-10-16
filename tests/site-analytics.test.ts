import { describe, expect, it } from "vitest";
import { cleanUrl } from "@/components/site-analytics";

const pv = (url: string) => cleanUrl({ type: "pageview", url }).url;

describe("analytics URL cleaning", () => {
  it("keeps only routine settings on /session", () => {
    expect(pv("https://www.bestfittips.com/session?d=5&l=desk&f=full&i=gentle&s=0&v=3&p=5-minute-desk-break&email=a@b.co#x")).toBe(
      "https://www.bestfittips.com/session?d=5&l=desk&f=full&i=gentle&s=0&p=5-minute-desk-break",
    );
  });

  it("drops every query param and hash elsewhere", () => {
    expect(pv("https://www.bestfittips.com/routines?utm_source=x&name=bob#top")).toBe("https://www.bestfittips.com/routines");
    expect(pv("https://www.bestfittips.com/")).toBe("https://www.bestfittips.com/");
  });
});
