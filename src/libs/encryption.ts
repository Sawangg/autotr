import { createHash } from "node:crypto";
import { ec as EC } from "elliptic";

type Keys = {
  publicKey: string;
  privateKey: string;
};

const ec = new EC("p256");

export const generateKeys = (): Keys => {
  const keyPair = ec.genKeyPair();
  const pubKeyBytes = keyPair.getPublic(false, "array");
  const pubKeyBase64 = Buffer.from(pubKeyBytes).toString("base64");
  const privateKey = keyPair.getPrivate("hex");

  // Private key is in "hex" format and public key is in base64 format
  return {
    publicKey: pubKeyBase64,
    privateKey: privateKey,
  };
};

export const getKeys = (): Keys => {
  const publicKey = process.env.PUBLIC_KEY;
  const privateKey = process.env.PRIVATE_KEY;

  if (!publicKey || !privateKey) throw new Error("Couldn't get keys");

  return {
    publicKey,
    privateKey,
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
