import { Elysia, t } from "elysia";
import { sub } from "src/tr-ws";
import { randomUUID } from "node:crypto";

enum OrderType {
  buy = "buy",
  sell = "sell",
}

export const orders = new Elysia()
  // Get all orders
  .get("/", async ({ request, error }) => {
    const token = request.headers.get("X-TR-Token");
    if (!token) return error("Bad Request");

    const res = await sub({ type: "orders" }, token);
    return res;
  })

  // Price for an order
  .post(
    "/price",
    async ({ request, body, error }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return error("Bad Request");

      const res = await sub(
        {
          type: "priceForOrder",
          parameters: {
            exchangeId: body.exchange,
            instrumentId: body.isin,
            type: body.type,
          },
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
    async ({ request, body, error }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return error("Bad Request");

      const res = await sub(
        {
          type: "simpleCreateOrder",
          clientProcessId: randomUUID(),
          warningsShown: [],
          parameters: {
            mode: "market",
            instrumentId: body.isin,
            size: body.size,
          },
        },
        token,
      );

      return res;
    },
    {
      body: t.Object({
        type: t.Enum(OrderType),
        isin: t.String(),
        size: t.Number(),
      }),
    },
  )

  // Limit order
  .post(
    "/limit",
    async ({ request, body, error }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return error("Bad Request");

      const res = await sub(
        {
          type: "simpleCreateOrder",
          clientProcessId: randomUUID(),
          warningsShown: [],
          parameters: {
            instrumentId: body.isin,
            exchangeId: body.exchange,
            mode: "limit",
            type: body.type,
            size: body.size,
            expiry: { type: "gtd", value: body.expiry },
            limit: body.limit,
          },
        },
        token,
      );

      return res;
    },
    {
      body: t.Object({
        isin: t.String(),
        exchange: t.String(),
        type: t.Enum(OrderType),
        size: t.Number(),
        expiry: t.RegExp(/^\d{4}-\d{2}-\d{2}$/),
        limit: t.Number(),
      }),
    },
  )

  // Stop order
  .post(
    "/stop",
    async ({ request, body, error }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return error("Bad Request");

      const res = await sub(
        {
          type: "simpleCreateOrder",
          clientProcessId: randomUUID(),
          warningsShown: [],
          parameters: {
            instrumentId: body.isin,
            exchangeId: body.exchange,
            mode: "stopMarket",
            type: body.type,
            size: body.size,
            expiry: { type: "gtd", value: body.expiry },
            stop: body.stop,
          },
        },
        token,
      );

      return res;
    },
    {
      body: t.Object({
        isin: t.String(),
        exchange: t.String(),
        type: t.Enum(OrderType),
        size: t.Number(),
        expiry: t.RegExp(/^\d{4}-\d{2}-\d{2}$/),
        stop: t.Number(),
      }),
    },
  )

  // Cancel order
  .post(
    "/cancel",
    async ({ request, body, error }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return error("Bad Request");

      const res = await sub(
        {
          type: "cancelOrder",
          orderId: body.orderId,
        },
        token,
      );

      return res;
    },
    {
      body: t.Object({
        orderId: t.String(),
      }),
    },
  );
