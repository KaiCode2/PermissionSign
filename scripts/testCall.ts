import { ethers } from "hardhat";
// import { signTypedData_v4 } from "eth-sig-util";

const contractAddress = "0xeeb41F8D623A622F10CB9D56dc9A89B29a7AF0E5"; //"0x7F4bc453C3636F192e065DD6803d43C34999Ce25";

async function encodePayload(value: number, signer: string) {
  const abiCoder = ethers.utils.defaultAbiCoder;
  const payload = abiCoder.encode(["uint256", "address"], [value, signer]);
  return payload;
}

async function encodeSelector() {
  const selector = ethers.utils.keccak256(Buffer.from("set(uint256,address)"));
  return selector.slice(0, 10);
}

// 0x2f30c6f600000000000000000000000000000000000000000000000000000000000001f4000000000000000000000000281e9587fcf2c295c55975f4f1dc25f419db84ea 
// 0x00000000000000000000000000000000000000000000000000000000000001f4000000000000000000000000281e9587fcf2c295c55975f4f1dc25f419db84ea

async function main() {
  const contract = await ethers.getContractAt(
    "MockPermissions",
    contractAddress
  );
  const accounts = await ethers.getSigners();
  const chainId = await accounts[0].getChainId();

  const deadline = 1763716118;
  const selector = await encodeSelector();
  const test = await contract.interface.encodeFunctionData("set(uint256,address)", [500, accounts[0].address]);
  const payload = await encodePayload(500, accounts[0].address);

    console.log(test, payload)

  const domain = {
    name: "Permissions",
    version: "1",
    chainId: chainId,
    verifyingContract: contract.address.toLowerCase(),
  };
  const types = {
    authorizedCall: [
      { name: "selector", type: "bytes4" },
      { name: "payload", type: "bytes" },
      { name: "deadline", type: "uint256" },
    ],
  };
  const value = {
    selector: selector,
    payload: payload,
    deadline: deadline,
  };

  // console.log(await contract.testEncode(selector, payload))

  const signature = await accounts[0]._signTypedData(domain, types, value);
  console.log(`Signature is: ${signature}`);

  let tx = await contract.authorizedCall(
    signature,
    selector,
    payload,
    deadline
  );

  await tx.wait();
  console.log(tx);





  // const hashCall = await contract.hashPayload(payload);
  // if (hashCall != ethers.utils.keccak256(payload)) {
  //   console.log(
  //     `Payload hashes did not match. The contract hash is ${hashCall} the call made ${ethers.utils.keccak256(
  //       payload
  //     )}`
  //   );
  // }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// const method = "eth_signTypedData_v4";
// const msgParams = JSON.stringify({
//   types: {
//     EIP712Domain: [
//       { name: "name", type: "string" },
//       { name: "version", type: "string" },
//       { name: "chainId", type: "uint256" },
//       { name: "verifyingContract", type: "address" },
//     ],
//     authorizedCall: [
//       // { name: "selector", type: "bytes4" },
//       // { name: "payload", type: "bytes32" },
//       { name: "deadline", type: "uint256" },
//     ],
//   },
//   primaryType: "authorizedCall",
//   domain: {
//     name: "Permissions",
//     version: "1",
//     chainId: chainId,
//     verifyingContract: contract.address.toLowerCase(),
//   },
//   message: {
//     // selector: selector,
//     // payload: hre.ethers.utils.keccak256(payload),
//     deadline: deadline,
//   },
// });
// const typedData = {
//   types: {
//     EIP712Domain: [
//       { name: "name", type: "string" },
//       { name: "version", type: "string" },
//       { name: "chainId", type: "uint256" },
//       { name: "verifyingContract", type: "address" },
//     ],
//   },
//   domain: {
//     name: "Permissions",
//     version: "1",
//     chainId: chainId,
//     verifyingContract: contract.address.toLowerCase(),
//   },
//   primaryType: "EIP712Domain",
//   message: {
//     deadline: deadline,
//   },
// };

// // const result = await accounts[0].provider!.send(
// //   method, [
// //     accounts[0].address.toLowerCase(),
// //     msgParams
// // ]);
// //   ,
// //   [accounts[0].address.toLowerCase(), msgParams],
// //   accounts[0]
// // );

// const sign = signTypedData_v4(
//   Buffer.from(
//     ethers.utils.arrayify(
//       "PKEY"
//     )
//   ),
//   {
//     data: {
//       types: {
//         EIP712Domain: [
//           { name: "name", type: "string" },
//           { name: "version", type: "string" },
//           { name: "chainId", type: "uint256" },
//           { name: "verifyingContract", type: "address" },
//         ],
//         authorizedCall: [{ name: "deadline", type: "uint256" }],
//       },
//       domain: {
//         name: "Permissions",
//         version: "1",
//         chainId: chainId,
//         verifyingContract: contract.address.toLowerCase(),
//       },
//       primaryType: "authorizedCall",
//       message: {
//         deadline: deadline,
//       },
//     },
//   }
// );
// console.log(sign);
