import { createServer } from "node:http";
import { createRequestHandler } from "./app.js";

const port = Number(process.env.PORT || 8787);
const host = "0.0.0.0";

createServer(createRequestHandler()).listen(port, host, () => {
  console.log(JSON.stringify({ event: "server_started", port }));
});
