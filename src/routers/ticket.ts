import express from "express";
import type { Request, Response } from "express";
import * as TicketService from "../services/ticket";

export const ticketRouter = express.Router();

ticketRouter.get("/", async (request: Request, response: Response) => {
  const tickets = await TicketService.getAll();
  return response.status(200).json(tickets);
});
