import { AGENT } from "@libs/constant";
import { signPayload } from "@libs/encryption";

export const login = async () => {
  const payload = JSON.stringify({ phoneNumber: process.env.PHONE_NUMBER, pin: process.env.PIN });
  const { time, signedPayload } = signPayload(payload);

  const res = await fetch("https://api.traderepublic.com/api/v1/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": AGENT,
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
