// TODO: remove elliptic package and use node:crypto
import { createHash } from "node:crypto";
import { ec as EC } from "elliptic";

export const signPayload = (payload: string): { time: number; signedPayload: string } => {
  const time = Date.now();
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("Cannot find private key");

  const ec = new EC("p256");
  const keyPair = ec.keyFromPrivate(privateKey, "hex");

  const hash = createHash("sha512").update(`${time}.${payload}`).digest();

  const signature = keyPair.sign(hash, { canonical: true }).toDER();
  const signedPayload = Buffer.from(signature).toString("base64");

  return { time, signedPayload };
};
