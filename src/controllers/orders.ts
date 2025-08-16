import { randomUUID } from "node:crypto";
import { Elysia, t } from "elysia";
import { sub } from "src/tr-ws";

enum OrderType {
  buy = "buy",
  sell = "sell",
}

export const orders = new Elysia()
  // Get all orders
  .get("/", async ({ request, status }) => {
    const token = request.headers.get("X-TR-Token");
    if (!token) return status(400);

    return sub({ type: "orders" }, token);
  })

  // Price for an order
  .post(
    "/price",
    async ({ request, body, status }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return status("Bad Request");

      const res = await sub(
        {
          parameters: {
            exchangeId: body.exchange,
            instrumentId: body.isin,
            type: body.type,
          },
          type: "priceForOrder",
        },
        token,
      );
      return res;
    },
    {
      body: t.Object({
        exchange: t.String(),
        isin: t.String(),
        type: t.Enum(OrderType),
      }),
    },
  )

  // Market order
  .post(
    "/market",
    async ({ request, body, status }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return status(400);

      return sub(
        {
          clientProcessId: randomUUID(),
          parameters: {
            instrumentId: body.isin,
            mode: "market",
            size: body.size,
          },
          type: "simpleCreateOrder",
          warningsShown: [],
        },
        token,
      );
    },
    {
      body: t.Object({
        isin: t.String(),
        size: t.Number(),
        type: t.Enum(OrderType),
      }),
    },
  )

  // Limit order
  .post(
    "/limit",
    async ({ request, body, status }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return status(400);

      return sub(
        {
          clientProcessId: randomUUID(),
          parameters: {
            exchangeId: body.exchange,
            expiry: { type: "gtd", value: body.expiry },
            instrumentId: body.isin,
            limit: body.limit,
            mode: "limit",
            size: body.size,
            type: body.type,
          },
          type: "simpleCreateOrder",
          warningsShown: [],
        },
        token,
      );
    },
    {
      body: t.Object({
        exchange: t.String(),
        expiry: t.RegExp(/^\d{4}-\d{2}-\d{2}$/),
        isin: t.String(),
        limit: t.Number(),
        size: t.Number(),
        type: t.Enum(OrderType),
      }),
    },
  )

  // Stop order
  .post(
    "/stop",
    async ({ request, body, status }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return status(400);

      return sub(
        {
          clientProcessId: randomUUID(),
          parameters: {
            exchangeId: body.exchange,
            expiry: { type: "gtd", value: body.expiry },
            instrumentId: body.isin,
            mode: "stopMarket",
            size: body.size,
            stop: body.stop,
            type: body.type,
          },
          type: "simpleCreateOrder",
          warningsShown: [],
        },
        token,
      );
    },
    {
      body: t.Object({
        exchange: t.String(),
        expiry: t.RegExp(/^\d{4}-\d{2}-\d{2}$/),
        isin: t.String(),
        size: t.Number(),
        stop: t.Number(),
        type: t.Enum(OrderType),
      }),
    },
  )

  // Cancel order
  .post(
    "/cancel",
    async ({ request, body, status }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return status(400);

      return sub(
        {
          orderId: body.orderId,
          type: "cancelOrder",
        },
        token,
      );
    },
    {
      body: t.Object({
        orderId: t.String(),
      }),
    },
  );
