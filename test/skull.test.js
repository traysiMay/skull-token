const {
  expectEvent,
  singletons,
  constants,
} = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const { ZERO_ADDRESS } = constants;

const Skull = artifacts.require("Skull");

contract("Skull", function ([_, registryFunder, creator, operator]) {
  beforeEach(async function () {
    this.skull = await Skull.new({ from: creator });
  });

  it("has a default color as red", async function () {
    const color = await this.skull.color();
    const { r, g, b } = color;
    expect(r.toString()).to.equal("255");
    expect(g.toString()).to.equal("0");
    expect(b.toString()).to.equal("0");
  });

  it("changes color", async function () {
    await this.skull.setColor(0, 0, 255, { from: creator });
    const newColor = await this.skull.color();
    const { b } = newColor;
    expect(b.toString()).to.equal("255");
  });
});
