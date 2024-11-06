import { createECDH } from "node:crypto";
import { writeFileSync } from "node:fs";
import { AGENT } from "@libs/constant";
import prompts from "prompts";

const generateKeys = () => {
  const ecdh = createECDH("p256");
  ecdh.generateKeys();
  return {
    publicKey: ecdh.getPublicKey("base64"),
    privateKey: ecdh.getPrivateKey("hex"),
  };
};

const registerDevice = async (publicKey: string, phoneNumber: string, pin: string): Promise<boolean> => {
  const resetRes = await fetch("https://api.traderepublic.com/api/v1/auth/account/reset/device", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": AGENT,
    },
    body: JSON.stringify({ phoneNumber, pin }),
  });

  if (resetRes.status === 429) throw new Error("Too many reset attempts");

  const resetData = await resetRes.json();
  if (!resetData.processId) throw new Error("Couldn't get a processId to reset");

  // Confirmation
  const prompt = await prompts({
    type: "text",
    name: "code",
    message: "Enter the code you just received by SMS",
    validate: (value) => (value.length !== 4 ? "Your validation code should have 4 digits" : true),
  });

  if (!prompt.code) throw new Error("Invalid validation code!");

  const res = await fetch(`https://api.traderepublic.com/api/v1/auth/account/reset/device/${resetData.processId}/key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": AGENT,
    },
    body: JSON.stringify({ code: prompt.code, deviceKey: publicKey }),
  });

  if (res.status === 200) return true;
  return false;
};

console.log(` _______          _________ _______ _________ _______
(  ___  )|\\     /|\\__   __/(  ___  )\\__   __/(  ____ )
| (   ) || )   ( |   ) (   | (   ) |   ) (   | (    )|
| (___) || |   | |   | |   | |   | |   | |   | (____)|
|  ___  || |   | |   | |   | |   | |   | |   |     __)
| (   ) || |   | |   | |   | |   | |   | |   | (\\ (
| )   ( || (___) |   | |   | (___) |   | |   | ) \\ \\__
|/     \\|(_______)   )_(   (_______)   )_(   |/   \\__/\n`);

const keys = generateKeys();
if (!keys) throw new Error("No keys generated");
console.log("Generated new keys! Don't forget to save them\n");
console.log(`Public key: ${keys.publicKey}`);
console.log(`Private key: ${keys.privateKey}\n`);

const confirm = await prompts({
  type: "confirm",
  name: "value",
  message: "Do you want to save the keys to disk at your current location?",
});

if (confirm.value) {
  writeFileSync("keys.json", JSON.stringify(keys, null, 2));
  console.log("Saved keys to keys.json");
}

const pn = await prompts({
  type: "text",
  name: "phonenumber",
  message: "Enter the phone number of your Trade Republic account",
  validate: (value: string) => (!value.startsWith("+") ? "Your phone number should start with a +" : true),
});
if (!pn.phonenumber) throw new Error("Invalid phone number!");

const pwd = await prompts({
  type: "password",
  name: "pin",
  message: "Enter the pin of your Trade Republic account",
  validate: (value) => (value.length !== 4 ? "Your pin should have 4 numbers" : true),
});
if (!pwd.pin) throw new Error("Invalid pin!");

const isPaired = await registerDevice(keys.publicKey, pn.phonenumber, pwd.pin);
if (!isPaired) throw new Error("Couldn't pair the account!");
console.log("Successfully paired your account!");
