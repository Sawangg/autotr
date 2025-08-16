import { Elysia, t } from "elysia";
import { sub } from "src/tr-ws";

enum DerivativeDirection {
  long = "long",
  short = "short",
  call = "call",
  put = "put",
}

export const derivatives = new Elysia()
  .post(
    "/knockout",
    async ({ request, body, status }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return status(400);

      return sub(
        {
          leverage: body.leverage,
          optionType: body.direction,
          productCategory: "knockOutProduct",
          sortBy: "leverage",
          sortDirection: "asc",
          type: "derivatives",
          //jurisdiction: "EN",
          underlying: body.isin,
        },
        token,
      );
    },
    {
      body: t.Object({
        direction: t.Enum(DerivativeDirection),
        isin: t.String(),
        leverage: t.Number({ default: 0, minimum: 0 }),
      }),
    },
  )
  .post(
    "/factor",
    async ({ request, body, status }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return status(400);

      return sub(
        {
          factor: body.factor,
          optionType: body.direction,
          productCategory: "factorCertificate",
          sortBy: "factor",
          sortDirection: "asc",
          type: "derivatives",
          underlying: body.isin,
        },
        token,
      );
    },
    {
      body: t.Object({
        direction: t.Enum(DerivativeDirection),
        factor: t.Number({ default: 0, minimum: 0 }),
        isin: t.String(),
      }),
    },
  )
  .post(
    "/warrant",
    async ({ request, body, status }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return status(400);

      return sub(
        {
          optionType: body.direction,
          productCategory: "vanillaWarrant",
          sortBy: "strike",
          sortDirection: "asc",
          strike: body.strike,
          type: "derivatives",
          underlying: body.isin,
        },
        token,
      );
    },
    {
      body: t.Object({
        direction: t.Enum(DerivativeDirection),
        isin: t.String(),
        strike: t.Number({ default: 0, minimum: 0 }),
      }),
    },
  );
