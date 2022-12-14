import { HardhatUserConfig } from "hardhat/config";
import "hardhat-deploy";
import "@nomicfoundation/hardhat-toolbox";
import { config as configEnv } from "dotenv";

configEnv();

const INFURA_PROJECT_ID = process.env.INFURA_PROJECT_ID;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const deployerPK: string = process.env.DEPLOYER_PRIV_KEY!;
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
};

export default config;
