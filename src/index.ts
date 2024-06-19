import * as dotenv from "dotenv";
import express from "express";
import cors from "cors";
import http from "http";
import { recordRouter } from "./routers/record";
import { ticketControlRouter } from "./routers/ticket-control";
import { Server } from "socket.io";
import { ticketRouter } from "./routers/ticket";

dotenv.config();

if (!process.env.PORT) {
  process.exit(1);
}

const PORT: number = parseInt(process.env.PORT as string, 10);

const app = express();
const server = http.createServer(app);
export const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use("/api/records", recordRouter);
app.use("/api/ticket-control", ticketControlRouter);
app.use("/api/tickets", ticketRouter);

server.listen(PORT, () => {
  console.log(`Queue App is listening on port ${PORT}`);
});
