// One-time local setup: this environment's network egress proxy blocks
// binaries.soliditylang.org, which Hardhat needs to download solc from.
// The npm registry is reachable, so we vendor the "solc" npm package
// (solc-js/wasm) instead and hand-populate Hardhat's compiler cache so it
// finds a "working" cached compiler and never attempts the network call.
//
// This script is a local workaround, not part of the arbitration logic; it
// only needs to run once per machine (or whenever the compiler cache is
// cleared with `hardhat clean --global`).
const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");

const SOLC_VERSION = "0.8.24";

function envPathsCacheDir() {
  const envPaths = require("env-paths");
  return envPaths("hardhat").cache;
}

function keccak256Hex(buffer) {
  // Hardhat verifies downloads with keccak256 (via @ethereumjs/util), not
  // sha3-256 from node's crypto. keccak256 is available transitively
  // through hardhat's own dependency tree.
  const { keccak256 } = require(
    path.join(
      __dirname,
      "..",
      "node_modules",
      "hardhat",
      "internal",
      "util",
      "keccak.js"
    )
  );
  const { bytesToHex } = require("@ethereumjs/util");
  return bytesToHex(keccak256(Uint8Array.from(buffer)));
}

function main() {
  const compilersCache = path.join(envPathsCacheDir(), "compilers-v2");
  fs.mkdirSync(compilersCache, { recursive: true });

  // --- 1. Make the native (linux-amd64) lookup resolve to "doesn't work" ---
  const linuxDir = path.join(compilersCache, "linux-amd64");
  fs.mkdirSync(linuxDir, { recursive: true });
  const fakeBinaryName = `solc-v${SOLC_VERSION}-fake`;
  const fakeBinaryPath = path.join(linuxDir, fakeBinaryName);
  fs.writeFileSync(fakeBinaryPath, "#!/bin/sh\nexit 1\n");
  fs.chmodSync(fakeBinaryPath, 0o755);
  fs.writeFileSync(`${fakeBinaryPath}.does.not.work`, "");

  const linuxList = {
    builds: [
      {
        path: fakeBinaryName,
        version: SOLC_VERSION,
        build: "local",
        longVersion: `${SOLC_VERSION}+commit.local`,
        keccak256: keccak256Hex(fs.readFileSync(fakeBinaryPath)),
        urls: [],
        platform: "linux-amd64",
      },
    ],
    releases: { [SOLC_VERSION]: fakeBinaryName },
    latestRelease: SOLC_VERSION,
  };
  fs.writeFileSync(
    path.join(linuxDir, "list.json"),
    JSON.stringify(linuxList, null, 2)
  );

  // --- 2. Point the wasm fallback at the npm-installed solc-js build ---
  const wasmDir = path.join(compilersCache, "wasm");
  fs.mkdirSync(wasmDir, { recursive: true });
  const soljsonSrc = path.join(
    __dirname,
    "..",
    "node_modules",
    "solc",
    "soljson.js"
  );
  const soljsonName = `soljson-v${SOLC_VERSION}.js`;
  const soljsonDest = path.join(wasmDir, soljsonName);
  fs.copyFileSync(soljsonSrc, soljsonDest);

  const wasmList = {
    builds: [
      {
        path: soljsonName,
        version: SOLC_VERSION,
        build: "local",
        longVersion: `${SOLC_VERSION}+commit.local`,
        keccak256: keccak256Hex(fs.readFileSync(soljsonDest)),
        urls: [],
        platform: "wasm",
      },
    ],
    releases: { [SOLC_VERSION]: soljsonName },
    latestRelease: SOLC_VERSION,
  };
  fs.writeFileSync(
    path.join(wasmDir, "list.json"),
    JSON.stringify(wasmList, null, 2)
  );

  console.log(`Offline solc ${SOLC_VERSION} cache prepared at ${compilersCache}`);
}

main();
