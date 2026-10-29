import { expect } from "chai";
import { ethers } from "hardhat";
import { FraudShieldRegistry } from "../typechain-types";

describe("FraudShieldRegistry", function () {
  let registry: FraudShieldRegistry;
  let admin: any, registrar: any, reviewer: any, stranger: any;

  const REGISTRAR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("REGISTRAR_ROLE"));
  const REVIEWER_ROLE  = ethers.keccak256(ethers.toUtf8Bytes("REVIEWER_ROLE"));

  const REPORT_REF = "FS-DEMO0001";
  const EVIDENCE_HASH = ethers.keccak256(ethers.toUtf8Bytes("synthetic_demo_evidence_content"));
  const ZERO_HASH = ethers.ZeroHash;

  beforeEach(async function () {
    [admin, registrar, reviewer, stranger] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("FraudShieldRegistry");
    registry = await Factory.deploy(admin.address);
    await registry.waitForDeployment();

    // Grant roles
    await registry.connect(admin).grantRole(REGISTRAR_ROLE, registrar.address);
    await registry.connect(admin).grantRole(REVIEWER_ROLE, reviewer.address);
  });

  describe("registerReport", function () {
    it("should register a report with valid inputs", async function () {
      await expect(registry.connect(registrar).registerReport(REPORT_REF, EVIDENCE_HASH))
        .to.emit(registry, "ReportRegistered")
        .withArgs(REPORT_REF, EVIDENCE_HASH, await latestTimestamp(), registrar.address);

      const [hash, , reg] = await registry.getRecord(REPORT_REF);
      expect(hash).to.equal(EVIDENCE_HASH);
      expect(reg).to.equal(registrar.address);
    });

    it("should reject duplicate registration", async function () {
      await registry.connect(registrar).registerReport(REPORT_REF, EVIDENCE_HASH);
      await expect(
        registry.connect(registrar).registerReport(REPORT_REF, EVIDENCE_HASH)
      ).to.be.revertedWithCustomError(registry, "AlreadyRegistered");
    });

    it("should reject empty report ref", async function () {
      await expect(
        registry.connect(registrar).registerReport("", EVIDENCE_HASH)
      ).to.be.revertedWithCustomError(registry, "EmptyReportRef");
    });

    it("should reject zero hash", async function () {
      await expect(
        registry.connect(registrar).registerReport(REPORT_REF, ZERO_HASH)
      ).to.be.revertedWithCustomError(registry, "ZeroHash");
    });

    it("should reject unauthorized caller", async function () {
      await expect(
        registry.connect(stranger).registerReport(REPORT_REF, EVIDENCE_HASH)
      ).to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("verifyHash", function () {
    it("should return true for matching hash", async function () {
      await registry.connect(registrar).registerReport(REPORT_REF, EVIDENCE_HASH);
      expect(await registry.verifyHash(REPORT_REF, EVIDENCE_HASH)).to.be.true;
    });

    it("should return false for mismatched hash", async function () {
      await registry.connect(registrar).registerReport(REPORT_REF, EVIDENCE_HASH);
      const wrong = ethers.keccak256(ethers.toUtf8Bytes("tampered_content"));
      expect(await registry.verifyHash(REPORT_REF, wrong)).to.be.false;
    });

    it("should return false for unregistered ref", async function () {
      expect(await registry.verifyHash("FS-NOTEXIST", EVIDENCE_HASH)).to.be.false;
    });
  });

  describe("recordStatusTransition", function () {
    it("should record transition for reviewer role", async function () {
      await registry.connect(registrar).registerReport(REPORT_REF, EVIDENCE_HASH);
      const tHash = ethers.keccak256(ethers.toUtf8Bytes("status:substantiated:2024-09-01"));
      await expect(
        registry.connect(reviewer).recordStatusTransition(REPORT_REF, tHash, "substantiated")
      ).to.emit(registry, "StatusTransitionRecorded");
    });

    it("should reject transition for unregistered report", async function () {
      const tHash = ethers.keccak256(ethers.toUtf8Bytes("data"));
      await expect(
        registry.connect(reviewer).recordStatusTransition("FS-UNKNOWN", tHash, "under_review")
      ).to.be.revertedWithCustomError(registry, "NotRegistered");
    });

    it("should reject unauthorized caller for status transition", async function () {
      await registry.connect(registrar).registerReport(REPORT_REF, EVIDENCE_HASH);
      const tHash = ethers.keccak256(ethers.toUtf8Bytes("data"));
      await expect(
        registry.connect(stranger).recordStatusTransition(REPORT_REF, tHash, "rejected")
      ).to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
    });
  });

  describe("Access Control", function () {
    it("stranger cannot register", async function () {
      await expect(
        registry.connect(stranger).registerReport(REPORT_REF, EVIDENCE_HASH)
      ).to.be.revertedWithCustomError(registry, "AccessControlUnauthorizedAccount");
    });

    it("admin can grant registrar role", async function () {
      await registry.connect(admin).grantRole(REGISTRAR_ROLE, stranger.address);
      await expect(
        registry.connect(stranger).registerReport(REPORT_REF, EVIDENCE_HASH)
      ).to.not.be.reverted;
    });
  });

  async function latestTimestamp() {
    const block = await ethers.provider.getBlock("latest");
    return block?.timestamp ?? 0;
  }
});
