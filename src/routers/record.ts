import express from "express";
import type { Request, Response } from "express";

export const recordRouter = express.Router();

import * as recordService from "../services/record";
import { z } from "zod";
import { Record } from "@prisma/client";

// GET: Get all records
recordRouter.get("/", async (request: Request, response: Response) => {
  try {
    const records = await recordService.findAllRecords();
    return response.status(200).json({ records });
  } catch (e) {
    return response.status(500).json({ message: "Erro ao obter os registos" });
  }
});

//POST: Create record
recordRouter.post("/", async (request: Request, response: Response) => {
  const recordSchema = z
    .object({
      name: z.string().min(1).optional(),
      nationality: z.string().min(1).optional(),
      adults: z
        .number()
        .min(0, "Deve ser maior que 0")
        .int("Deve ser um número inteiro"),
      children: z
        .number()
        .min(0, "Deve ser maior que 0")
        .int("Deve ser um número inteiro"),
    })
    .passthrough();

  const result = await recordSchema.safeParseAsync(request.body);

  if (result.success) {
    try {
      await recordService.createRecord(result.data as Record);
      return response.status(200).json({ message: "OK" });
    } catch (e) {
      console.log(e);
      return response.status(500).json({ message: "Erro a criar registo!" });
    }
  } else {
    return response
      .status(400)
      .json({ message: "Dados inválidos", errors: result.error.errors });
  }
});
