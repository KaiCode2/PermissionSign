import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const deployADT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    console.log("deploying Permission mock to: ", hre.network.name);
    const { ethers } = hre;

    const Mock = await ethers.getContractFactory("MockPermissions");
    const mock = await Mock.deploy();
    
    await mock.deployTransaction.wait();

    console.log(`Mock permission deployed to: ${mock.address}`);
};
export default deployADT;