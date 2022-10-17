import { HardhatUserConfig, task } from "hardhat/config";
import { TASK_COMPILE } from "hardhat/builtin-tasks/task-names";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-circom";
import { TASK_CIRCOM } from "hardhat-circom";
import { config as configEnv } from "dotenv";

configEnv();

// NOTE: Hooks circuit compilation into hardhat compile
task(TASK_COMPILE, "hook compile task to include circuit compile and template").setAction(circuitsCompile);

async function circuitsCompile(args: any, hre: any, runSuper: any) {
  // TODO: consider adding in a config flag whether or not to run circuit compilation on hh compile
  await hre.run(TASK_CIRCOM, args);
  await runSuper();
}

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
// const deployerPK: string = process.env.DEPLOYER_PRIV_KEY!;
const powerOfTau = process.env.POFTAU ?? "https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_23.ptau"; // Supports 8m constraints, 9gb file
const MNEMONIC = process.env.MNEMONIC
const testnetAccounts = {
  mnemonic: MNEMONIC,
  path: "m/44'/60'/0'/0",
  initialIndex: 0,
  count: 10,
  passphrase: "",
};

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      gas: "auto",
      accounts: testnetAccounts,
    },
    ganache: {
      url: 'http://127.0.0.1:7545',
      accounts: testnetAccounts,
      loggingEnabled: true
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${INFURA_PROJECT_ID}`,
      accounts: testnetAccounts,
      chainId: 5
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  circom: {
    inputBasePath: "./circuits",
    // outputBasePath: "./snarkKeys/",
    ptau: powerOfTau, // TODO: calc number of constraints. EDCSA requires >2.1m, SMT requires ?
    // For list of higher order PofTau constraints, check here: https://github.com/iden3/snarkjs#7-prepare-phase-2 
    circuits: [
      {
        name: "authorize",
        // input: "inputs/authorize.json",
        protocol: "groth16", // No protocol, so it defaults to groth16
        version: 2,
      },
    ],
  },
};

export default config;
