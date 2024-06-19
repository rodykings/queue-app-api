import express from "express";
import type { Request, Response } from "express";
import * as TicketControlService from "../services/ticket-control";

export const ticketControlRouter = express.Router();

ticketControlRouter.get("/", async (request: Request, response: Response) => {
  const ticketControl = await TicketControlService.findToday();
  console.log(ticketControl);
  return response.status(200).json({ message: "teste", data: ticketControl });
});
