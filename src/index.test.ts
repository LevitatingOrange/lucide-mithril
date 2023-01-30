/**
 * @jest-environment jsdom
 */

import m, { Component } from "mithril";

import * as icons from "./index";

const TestComponent: Component = {
  view: () => {
    return m(
      ".icons",
      Object.values(icons).map((icon) => m(icon))
    );
  },
};

test("icons get rendered", () => {
  document.body.innerHTML = `<div id="main"></div>`;
  m.render(document.querySelector("#main")!, m(TestComponent));

  const icon_container = document.querySelector(".icons")!;
  const icons = Array.from(icon_container.children);

  expect(icons.length).toBeGreaterThan(1);

  for (let child of icons) {
    expect(child.tagName.toLowerCase()).toBe("div");
    let children = child.children;
    expect(children.length).toBe(1);
    expect(children[0].tagName.toLowerCase()).toBe("svg");
  }
});
