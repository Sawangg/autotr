import { derivatives } from "@controllers/derivatives";
import { orders } from "@controllers/orders";
import { portfolio } from "@controllers/portfolio";
import { cors } from "@elysiajs/cors";
import { login } from "@libs/session";
import { Elysia } from "elysia";
import { helmet } from "elysia-helmet";
import { connect } from "src/tr-ws";

let sessionToken: string = (await login()).sessionToken;

// Connect to TradeRepublic WebSocket
await connect();

// Refresh the session every 4 minutes to not be disconnected
setInterval(async () => {
  sessionToken = (await login()).sessionToken;
}, 240000);

const app = new Elysia({ prefix: "/api" })
  .onRequest(({ request }) => {
    request.headers.set("X-TR-Token", sessionToken);
  })
  .group("/derivatives", (app) => app.use(derivatives))
  .group("/orders", (app) => app.use(orders))
  .group("/portfolio", (app) => app.use(portfolio))
  .use(cors())
  .use(helmet())
  .listen(process.env.PORT ?? 3000);

console.log(`Server started at ${app.server?.hostname}:${app.server?.port}`);
