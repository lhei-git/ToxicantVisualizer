import { unmountComponentAtNode, render } from "react-dom";
import MapLegend from "./index";
import React from "react";
import { act } from "react-dom/test-utils";
require("jest");

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

it("renders", () => {
  act(() => {
    render(<MapLegend releaseType="air"></MapLegend>, container);
  });
  expect(container.textContent).toBe(
    "Total releases (air, water, land and off-site)0 lbs 0 - 100 lbs 100 - 10,000 lbs 10,000 - 100,000 lbs 100,000 - 1,000,000 lbs >1,000,000 lbs"
  );
});
