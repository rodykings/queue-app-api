import { io } from "..";
import { db } from "../utils/db.server";

export async function findToday() {
  const today = new Date();

  return await db.ticketControl.findFirst({
    where: {
      year: today.getFullYear(),
      month: today.getMonth(),
      day: today.getDate(),
    },
  });
}

export async function getLastRegisterTicket() {
  const today = new Date();

  const data = await db.ticketControl.findFirst({
    select: {
      lastRegisterTicket: true,
    },
    where: {
      year: today.getFullYear(),
      month: today.getMonth(),
      day: today.getDate(),
    },
  });

  return data?.lastRegisterTicket;
}

export async function createOrUpdate(
  registerTicketNumber: number,
  lastRegisterTicketTimestamp: Date
) {
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
        lastRegisterTicket: registerTicketNumber,
        lastRegisterTicketTimestamp: lastRegisterTicketTimestamp,
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
        lastRegisterTicket: registerTicketNumber,
        lastRegisterTicketTimestamp: lastRegisterTicketTimestamp,
      },
    });
  }

  return newTicketControl;
}
