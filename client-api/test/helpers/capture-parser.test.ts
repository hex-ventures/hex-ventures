import "jest";
import {
  parseLinks,
  parseTags,
  stripTags
} from "../../src/helpers/capture-parser";

describe("test parseTags", () => {
  test("parseTags no tags", () => {
    expect(parseTags("No tags")).toEqual([]);
  });

  test("parseTags empty string", () => {
    expect(parseTags("")).toEqual([]);
  });

  test("parseTags one tag", () => {
    expect(parseTags("one #tag")).toEqual(["tag"]);
  });

  test("parseTags two tags", () => {
    expect(parseTags("#one tag #two tag")).toEqual(["one", "two"]);
  });

  test("parseTags ending tag", () => {
    expect(parseTags("one #")).toEqual([]);
  });
});

describe("test stripTags", () => {
  test("stripTags no tags", () => {
    expect(stripTags("No tags")).toEqual("No tags");
  });

  test("stripTags empty string", () => {
    expect(stripTags("")).toEqual("");
  });

  test("stripTags one tag", () => {
    expect(stripTags("one #tag")).toEqual("one");
  });

  test("stripTags two tags", () => {
    expect(stripTags("#one tag #two tag")).toEqual("tag  tag");
  });

  test("stripTags ending tag", () => {
    expect(stripTags("one #")).toEqual("one");
  });
});

describe("test parseLinks", () => {
  test("parseLinks no links", () => {
    expect(parseLinks("No links")).toEqual([]);
  });

  test("parseLinks empty string", () => {
    expect(parseLinks("")).toEqual([]);
  });

  test("parseLinks one https link", () => {
    expect(parseLinks("one https://link.com")).toEqual(["https://link.com"]);
  });

  test("parseLinks one http link", () => {
    expect(parseLinks("one http://link.com")).toEqual(["http://link.com"]);
  });

  test("parseLinks two links", () => {
    expect(parseLinks("http://one.com and https://two.com")).toEqual([
      "http://one.com",
      "https://two.com"
    ]);
  });
});
