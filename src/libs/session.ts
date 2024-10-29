import { getKeys, signPayload } from "@libs/encryption";
import prompts from "prompts";

const userAgent = "TradeRepublic/Android 30/App Version 3.110.0";

export const resetDevice = async (): Promise<boolean> => {
  const resetRes = await fetch("https://api.traderepublic.com/api/v1/auth/account/reset/device", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify({ phoneNumber: process.env.PHONE_NUMBER, pin: process.env.PIN }),
  });

  if (resetRes.status === 429) throw new Error("Too many reset attempts");

  const resetData = await resetRes.json();
  if (!resetData.processId) throw new Error("Couldn't get a processId to reset");

  // Confirmation
  const { publicKey } = getKeys();
  const prompt = await prompts({
    type: "text",
    name: "code",
    message: "Enter the code you just received by SMS",
  });

  if (!prompt.code || prompt.code.length !== 4) throw new Error("Invalid validation code!");

  const res = await fetch(`https://api.traderepublic.com/api/v1/auth/account/reset/device/${resetData.processId}/key`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": userAgent,
    },
    body: JSON.stringify({
      code: prompt.code,
      deviceKey: publicKey,
    }),
  });

  if (res.status === 200) return true;
  return false;
};

export const login = async () => {
  const payload = JSON.stringify({ phoneNumber: process.env.PHONE_NUMBER, pin: process.env.PIN });
  const { time, signedPayload } = signPayload(payload);

  const res = await fetch("https://api.traderepublic.com/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": userAgent,
      "X-Zeta-Timestamp": time.toString(),
      "X-Zeta-Signature": signedPayload,
    },
    body: payload,
  });

  const data = await res.json();

  return {
    refreshToken: data.refreshToken, // 2 hours
    sessionToken: data.sessionToken, // 5 minutes
  };
};
