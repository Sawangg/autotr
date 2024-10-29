import { generateKeys } from "@libs/encryption";
import { resetDevice } from "@libs/session";

const keys = generateKeys();
if (!keys) throw new Error("No keys generated");
console.log("Generated new keys");

const isPaired = await resetDevice();
if (!isPaired) throw new Error("An error occured");
console.log("Successfully paired the API");
