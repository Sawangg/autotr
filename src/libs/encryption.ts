import { createPublicKey, createSign } from "node:crypto";

export const signPayload = (payload: string): { time: number; signedPayload: string } => {
  const time = Date.now();
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) throw new Error("Cannot find private key in PEM format (environment variable: PRIVATE_KEY)");

  const signer = createSign("sha512").update(`${time}.${payload}`).end();

  return { signedPayload: signer.sign({ key: privateKey }, "base64"), time };
};

export const spkiToUncompressedBase64 = (spkiPem: string): string => {
  const pubKeyDer = createPublicKey(spkiPem).export({ format: "der", type: "spki" });

  if (pubKeyDer.length < 65) throw new Error("Public key DER is too short to contain an uncompressed P-256 key");

  const uncompressedStart = pubKeyDer.length - 65;
  if (pubKeyDer[uncompressedStart] !== 0x04) throw new Error("Expected uncompressed point starting with 0x04");

  const uncompressed = pubKeyDer.subarray(uncompressedStart);
  return uncompressed.toString("base64");
};
