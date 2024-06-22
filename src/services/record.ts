import { Record } from "@prisma/client";
import { db } from "../utils/db.server";
import { z } from "zod";
import { chdir } from "process";
import { io } from "..";
import * as TicketControlService from "../services/ticket-control";
import * as TicketService from "../services/ticket";

export async function findAllRecords() {
  return await db.record.findMany();
}

export async function createRecord({
  children,
  adults,
  nationality,
  assistance = false,
  priority = false,
}: Record) {
  const [newRecord, newTicketControl] = await db.$transaction(async (db) => {
    const newRecord = await db.record.create({
      data: {
        nationality,
        adults,
        children,
        assistance,
        priority,
      },
    });

    const lastRegisterTicket =
      await TicketControlService.getLastRegisterTicket();

    let nextNumber = lastRegisterTicket ?? 0;

    let lastRecordTimestamp: Date = new Date();
    for (let i = 0; i < newRecord.adults + newRecord.children; i++) {
      nextNumber++;

      const newTicket = await db.ticket.create({
        data: {
          number: nextNumber,
          recordId: newRecord.id,
        },
      });
      lastRecordTimestamp = newTicket.createdAt;
    }

    const today = new Date();

    const oldTicketControl = await db.ticketControl.findFirst({
      where: {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate(),
      },
    });

    let newTicketControl;
    if (oldTicketControl) {
      newTicketControl = await db.ticketControl.update({
        data: {
          ...oldTicketControl,
          lastRegisterTicket: nextNumber,
          lastRegisterTicketTimestamp: lastRecordTimestamp,
        },
        where: {
          id: oldTicketControl.id,
        },
      });
    } else {
      newTicketControl = await db.ticketControl.create({
        data: {
          year: today.getFullYear(),
          month: today.getMonth(),
          day: today.getDate(),
          lastRegisterTicket: nextNumber,
          lastRegisterTicketTimestamp: lastRecordTimestamp,
        },
      });
    }

    return [newRecord, newTicketControl];
  });

  io.emit("ticket-control", newTicketControl);

  return newRecord;
}
