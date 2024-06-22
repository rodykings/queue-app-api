import express from "express";
import type { Request, Response } from "express";
import * as TicketService from "../services/ticket";
import { z } from "zod";
import { HttpError } from "../utils/http-errors";

export const ticketRouter = express.Router();

ticketRouter.get("/", async (request: Request, response: Response) => {
  const tickets = await TicketService.getAll();
  return response.status(200).json(tickets);
});

ticketRouter.post(
  "/:ticketNumber/entrance",
  async (request: Request, response: Response) => {
    const ticketNumberSchema = z.number().min(0);

    console.log(request.params.ticketNumber);

    const parseResult = await ticketNumberSchema.safeParseAsync(
      Number(request.params.ticketNumber)
    );

    if (!parseResult.success) {
      return response.status(400).json({ message: "Argumentos inválidos!" });
    }
    try {
      await TicketService.registerEntrance(parseResult.data);
    } catch (error: any) {
      return response
        .status(error.status ?? 500)
        .json({ message: error?.message ?? "Internal Server Error" });
    }

    return response
      .status(200)
      .json({ message: "Entradas registadas com sucesso!" });
  }
);
