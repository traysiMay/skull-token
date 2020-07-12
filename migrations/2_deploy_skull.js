const Skull = artifacts.require("Skull");

module.exports = function (deployer) {
  deployer.deploy(Skull);
};
