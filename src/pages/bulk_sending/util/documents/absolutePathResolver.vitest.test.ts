import { expect, test } from "vitest";
import AbsolutePathResolver from "./absolutePathResolver";
import path from "path";

test("check path resolvation", () => {

    const p1 = "/a/abolute/path";
    const p2 = "a/relative/path";
    const p3 = "C:\\Windows\\path\\to\\file.txt";
    const p4 = "another";

    const base = "/base/path";
    const resolver = new AbsolutePathResolver(base);

    const r1 = resolver.resolve(p1);
    const r2 = resolver.resolve(p2);
    const r3 = resolver.resolve(p3);
    const r4 = resolver.resolve(p4);

    // Check if the paths are resolved correctly
    // p1 is absolute, so it should remain unchanged
    expect(r1).toBe(p1);
    // p2 is relative, so it should be resolved against the base path
    expect(r2).toBe(path.resolve(base, p2));
    // p3 is absolute, so it should remain unchanged
    expect(r3).toBe(p3);
    // p4 is relative, so it should be resolved against the base path
    expect(r4).toBe(path.resolve(base, p4));



});