import { CONNECT_ID, LANG, MAX_RETRIES } from "@libs/constant";

let ws: WebSocket;
let connectResolve: () => void;

// biome-ignore lint/suspicious/noExplicitAny: Cannot use unknown because of generic type T
const subs = new Map<number, { resolve: (value: any) => void; reject: (value: string) => void; unsub: boolean }>();

const handleMessage = (e: MessageEvent) => {
  if (e.data.startsWith("echo")) return;
  if (e.data === "connected") {
    connectResolve();

    // Prevent the ws from disconnecting
    setInterval(() => {
      ws.send(`echo ${Date.now()}`);
    }, 50000);
    return;
  }

  const [id, status, ...data] = e.data.split(" ");
  const sub = subs.get(Number(id));
  if (!sub) return console.error(`Unknown message ${id}`);

  if (status === "E") sub.reject(`Received an error :\n${e.data}`);
  else sub.resolve(JSON.parse(data.join(" ").trim()));

  if (sub.unsub) unsub(Number(id));
};

export const connect = async (attempts = 1): Promise<void> => {
  return new Promise((resolve, reject) => {
    connectResolve = resolve;

    ws = new WebSocket("wss://api.traderepublic.com/");

    // The connect id can change when Trade Republic update its API.
    ws.onopen = () => {
      ws.send(`connect ${CONNECT_ID} { "locale": "${LANG}" }`);
    };

    // Incremental timeout for each attempt
    setTimeout(() => {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        reject("Timeout");
        ws.close();
      }
    }, attempts * 15000);

    ws.onmessage = handleMessage;
    ws.onerror = (error: Event) => console.error("Trade Republic's socket error: ", error);
    ws.onclose = () => {
      if (attempts === MAX_RETRIES) {
        throw new Error(`Failed to reconnect to Trade Republic's socket after ${MAX_RETRIES} retries, exiting`);
      }
      void connect(attempts + 1);
    };
  });
};

export const sub = async <T = unknown>(
  payload: Record<string, unknown>,
  token: string,
  unsub = true,
  timeout = 10000,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) reject("Socket not ready");

    const id = Math.floor(Math.random() * 10000);
    subs.set(id, { resolve, reject, unsub });
    ws.send(`sub ${id} ${JSON.stringify({ ...payload, token })}`);

    setTimeout(() => reject(`Timeout for id ${id}`), timeout);
  });
};

const unsub = (id: number) => {
  if (!subs.has(id)) return console.error(`Couldn't delete sub ${id}`);
  subs.delete(id);
  ws.send(`unsub ${id}`);
};
