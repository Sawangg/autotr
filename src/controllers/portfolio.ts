import { Elysia } from "elysia";
import { sub } from "src/tr-ws";

export const portfolio = new Elysia()
  .get("/", async ({ request, status }) => {
    const token = request.headers.get("X-TR-Token");
    if (!token) return status(400);

    const positions = await sub<{ positions: [{ instrumentId: string; netSize: string }] }>(
      { type: "compactPortfolio" },
      token,
    );
    const cash = await sub<Array<{ amount: number }>>({ type: "cash" }, token);

    let portfolioValue = 0;
    for (const position of positions.positions) {
      const res = await sub<{ bid: { price: string } }>({ id: `${position.instrumentId}.LSX`, type: "ticker" }, token);
      portfolioValue += Number.parseFloat(position.netSize) * Number.parseFloat(res.bid.price);
    }
    return { cash: cash[0].amount, portfolio: portfolioValue, positions: positions.positions };
  })

  .get("/transactions", async ({ request, status }) => {
    const token = request.headers.get("X-TR-Token");
    if (!token) return status(400);

    return sub({ type: "timelineTransactions" }, token);
  });
