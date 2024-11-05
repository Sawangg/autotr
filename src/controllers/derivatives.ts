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
    async ({ request, body, error }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return error("Bad Request");

      return sub(
        {
          type: "derivatives",
          //jurisdiction: "EN",
          underlying: body.isin,
          productCategory: "knockOutProduct",
          leverage: body.leverage,
          sortBy: "leverage",
          sortDirection: "asc",
          optionType: body.direction,
        },
        token,
      );
    },
    {
      body: t.Object({
        isin: t.String(),
        leverage: t.Number({ default: 0, minimum: 0 }),
        direction: t.Enum(DerivativeDirection),
      }),
    },
  )
  .post(
    "/factor",
    async ({ request, body, error }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return error("Bad Request");

      return sub(
        {
          type: "derivatives",
          underlying: body.isin,
          productCategory: "factorCertificate",
          factor: body.factor,
          sortBy: "factor",
          sortDirection: "asc",
          optionType: body.direction,
        },
        token,
      );
    },
    {
      body: t.Object({
        isin: t.String(),
        factor: t.Number({ default: 0, minimum: 0 }),
        direction: t.Enum(DerivativeDirection),
      }),
    },
  )
  .post(
    "/warrant",
    async ({ request, body, error }) => {
      const token = request.headers.get("X-TR-Token");
      if (!token) return error("Bad Request");

      return sub(
        {
          type: "derivatives",
          underlying: body.isin,
          productCategory: "vanillaWarrant",
          strike: body.strike,
          sortBy: "strike",
          sortDirection: "asc",
          optionType: body.direction,
        },
        token,
      );
    },
    {
      body: t.Object({
        isin: t.String(),
        strike: t.Number({ default: 0, minimum: 0 }),
        direction: t.Enum(DerivativeDirection),
      }),
    },
  );
