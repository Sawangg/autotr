import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { ec as EC } from "elliptic";

type Keys = {
  privateKey: string;
  publicKey: string;
};

const ec = new EC("p256");

export const generateKeys = (): Keys => {
  const keyPair = ec.genKeyPair();
  const pubKeyBytes = keyPair.getPublic(false, "array");
  const pubKeyBase64 = Buffer.from(pubKeyBytes).toString("base64");
  const privateKey = keyPair.getPrivate("hex");

  // Private key is saved in "hex" format and public key is saved in base64 format
  const keyData = {
    privateKey: privateKey,
    publicKey: pubKeyBase64,
  };

  writeFileSync("keys.json", JSON.stringify(keyData));
  return keyData;
};

export const getKeys = (): Keys => {
  const keyData = JSON.parse(readFileSync("keys.json", "utf-8"));

  return {
    privateKey: keyData.privateKey,
    publicKey: keyData.publicKey,
  };
};

export const signPayload = (payload: string): { time: number; signedPayload: string } => {
  const time = Date.now();
  const { privateKey } = getKeys();
  const keyPair = ec.keyFromPrivate(privateKey, "hex");

  const hash = createHash("sha512").update(`${time}.${payload}`).digest();

  const signature = keyPair.sign(hash, { canonical: true }).toDER();
  const signedPayload = Buffer.from(signature).toString("base64");

  return { time, signedPayload };
};
