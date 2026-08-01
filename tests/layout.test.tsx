import { createElement, isValidElement, type ReactElement } from "react";
import { describe, expect, it } from "vitest";
import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("menoleransi atribut body yang disisipkan ekstensi browser sebelum hydration", () => {
    const layout = RootLayout({ children: createElement("main") });

    expect(isValidElement(layout)).toBe(true);

    const body = layout.props.children as ReactElement<{
      suppressHydrationWarning?: boolean;
    }>;
    expect(body.props.suppressHydrationWarning).toBe(true);
  });
});
