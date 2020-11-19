import React from "react";
import { shallow } from "enzyme";
import { App } from "../App";

describe("App", () => {
  it("Renders application", () => {
    const wrapper = shallow(<App />);
    expect(wrapper).toMatchSnapshot();
  });
});
