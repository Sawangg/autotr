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
      const res = await sub<{ bid: { price: string } }>({ type: "ticker", id: `${position.instrumentId}.LSX` }, token);
      portfolioValue += Number.parseFloat(position.netSize) * Number.parseFloat(res.bid.price);
    }
    return { positions: positions.positions, cash: cash[0].amount, portfolio: portfolioValue };
  })

  .get("/transactions", async ({ request, error }) => {
    const token = request.headers.get("X-TR-Token");
    if (!token) return error("Bad Request");

    return sub({ type: "timelineTransactions" }, token);
  });
