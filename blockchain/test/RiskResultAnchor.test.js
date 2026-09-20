const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RiskResultAnchor", function () {
  let RiskResultAnchor;
  let anchor;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    RiskResultAnchor = await ethers.getContractFactory("RiskResultAnchor");
    anchor = await RiskResultAnchor.deploy();
    await anchor.waitForDeployment();
  });

  it("Should anchor a risk hash and emit event", async function () {
    const testHash = ethers.keccak256(ethers.toUtf8Bytes("RiskAssessment_2026_Org1"));
    const resultId = "SIM-2026-001";
    const orgId = "ORG-FIN-01";
    const metadataUri = "ipfs://QmSimResultMetadataHash123";

    await expect(anchor.anchorHash(testHash, resultId, orgId, metadataUri))
      .to.emit(anchor, "RiskHashAnchored")
      .withArgs(testHash, owner.address, resultId, orgId, (val) => val > 0);

    const verification = await anchor.verifyHash(testHash);
    expect(verification.isAnchored).to.be.true;
    expect(verification.submitter).to.equal(owner.address);
    expect(verification.resultId).to.equal(resultId);
    expect(verification.organizationId).to.equal(orgId);
  });

  it("Should reject duplicate hash anchoring", async function () {
    const testHash = ethers.keccak256(ethers.toUtf8Bytes("DuplicateTest"));
    await anchor.anchorHash(testHash, "SIM-001", "ORG-01", "uri1");

    await expect(
      anchor.anchorHash(testHash, "SIM-002", "ORG-01", "uri2")
    ).to.be.revertedWith("Anchor: hash already anchored");
  });

  it("Should return false for unanchored hash", async function () {
    const randomHash = ethers.keccak256(ethers.toUtf8Bytes("NeverAnchored"));
    const verification = await anchor.verifyHash(randomHash);
    expect(verification.isAnchored).to.be.false;
  });
});
