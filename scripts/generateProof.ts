import { ethers } from "hardhat";
import { getPublicKey, sign, Point, utils } from "@noble/secp256k1";
import * as fs from "fs/promises";
// @ts-ignore
import * as snarkjs from "snarkjs";

async function main() {
  var test_cases: Array<[bigint, bigint, bigint, bigint]> = [];

  const privKey = Uint8Array_to_bigint(utils.randomPrivateKey()); // 88549154299169935420064281163296845505587953610183896504176354567359434168161n;
  console.log(`Priv key is: ${privKey}`);

  var pubkey: Point = Point.fromPrivateKey(privKey);
  var msghash_bigint: bigint = 1234n;

  test_cases.push([privKey, msghash_bigint, pubkey.x, pubkey.y]);

  let pub0 = pubkey.x;
  let pub1 = pubkey.y;

  var msghash: Uint8Array = bigint_to_Uint8Array(msghash_bigint);

  var sig: Uint8Array = await sign(msghash, bigint_to_Uint8Array(privKey), {
    canonical: true,
    der: false,
  });
  var r: Uint8Array = sig.slice(0, 32);
  var r_bigint: bigint = Uint8Array_to_bigint(r);
  var s: Uint8Array = sig.slice(32, 64);
  var s_bigint: bigint = Uint8Array_to_bigint(s);

  var priv_array: bigint[] = bigint_to_array(64, 4, privKey);
  var r_array: bigint[] = bigint_to_array(64, 4, r_bigint);
  var s_array: bigint[] = bigint_to_array(64, 4, s_bigint);
  var msghash_array: bigint[] = bigint_to_array(64, 4, msghash_bigint);
  var pub0_array: bigint[] = bigint_to_array(64, 4, pub0);
  var pub1_array: bigint[] = bigint_to_array(64, 4, pub1);
  var res = 1n;

  console.log("r", r_bigint);
  console.log("s", s_bigint);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve({
    r: r_array,
    s: s_array,
    msghash: msghash_array,
    pubkey: [pub0_array, pub1_array],
  }, "circuit.wasm", "circuit_final.zkey");

    console.log("Proof: ");
    console.log(JSON.stringify(proof, null, 1));

    const vKey = JSON.parse((await fs.readFile("verification_key.json")).toString());

    const result = await snarkjs.groth16.verify(vKey, publicSignals, proof);

    if (result === true) {
        console.log("Verification OK");
    } else {
        console.log("Invalid proof");
    }

//   let witness = await circuit.calculateWitness({
//     r: r_array,
//     s: s_array,
//     msghash: msghash_array,
//     pubkey: [pub0_array, pub1_array],
//   });
// //   expect(witness[1]).to.equal(res);
//   await circuit.checkConstraints(witness);
}

// bigendian
function bigint_to_Uint8Array(x: bigint) {
  var ret: Uint8Array = new Uint8Array(32);
  for (var idx = 31; idx >= 0; idx--) {
    ret[idx] = Number(x % 256n);
    x = x / 256n;
  }
  return ret;
}

function bigint_to_array(n: number, k: number, x: bigint) {
    let mod: bigint = 1n;
    for (var idx = 0; idx < n; idx++) {
        mod = mod * 2n;
    }

    let ret: bigint[] = [];
    var x_temp: bigint = x;
    for (var idx = 0; idx < k; idx++) {
        ret.push(x_temp % mod);
        x_temp = x_temp / mod;
    }
    return ret;
}

function Uint8Array_to_bigint(x: Uint8Array) {
    var ret: bigint = 0n;
    for (var idx = 0; idx < x.length; idx++) {
        ret = ret * 256n;
        ret = ret + BigInt(x[idx]);
    }
    return ret;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
