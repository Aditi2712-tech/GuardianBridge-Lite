import app from "./app";
import { logger } from "./lib/logger";
import { WebSocketServer } from "ws";
import { createServer } from "node:http";
import {
  initializeTelemetry,
  registerClient,
  startSimulator,
} from "./services/telemetry";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = createServer(app);
const webSocketServer = new WebSocketServer({ noServer: true });

webSocketServer.on("connection", (socket) => {
  const unregister = registerClient(socket);
  socket.on("close", unregister);
  socket.on("error", unregister);
});

server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  if (pathname !== "/ws/hardware") {
    socket.destroy();
    return;
  }
  webSocketServer.handleUpgrade(request, socket, head, (client) => {
    webSocketServer.emit("connection", client, request);
  });
});

server.on("error", (error) => {
  logger.error({ error }, "Error listening on port");
  process.exit(1);
});

server.listen(port, () => {
  logger.info({ port }, "Server listening");
  void initializeTelemetry()
    .then(() => {
      startSimulator();
      logger.info("Telemetry service initialized");
    })
    .catch((error) => logger.error({ error }, "Telemetry service failed to initialize"));
});
