import { io } from "..";
import { db } from "../utils/db.server";
import { HttpError } from "../utils/http-errors";
import moment from "moment";

export async function createTicket(number: number, recordId: string) {
  return await db.ticket.create({
    data: {
      number,
      recordId,
    },
  });
}

export async function getAll() {
  var start = new Date();
  start.setUTCHours(0, 0, 0, 0);

  var end = new Date();
  end.setUTCHours(23, 59, 59, 999);

  return await db.ticket.findMany({
    orderBy: {
      number: "asc",
    },
    where: {
      createdAt: {
        gte: start,
        lte: end,
      },
    },
  });
}

export async function registerEntrance(ticketNumber: number) {
  const ticketControl = await db.$transaction(async () => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const registeredTicket = await db.ticket.findFirst({
      where: {
        number: {
          lte: ticketNumber,
        },
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
        entryAt: null,
      },
      orderBy: {
        number: "asc",
      },
    });

    if (!registeredTicket) {
      throw new HttpError(400, "A entrada já foi registada!");
    }

    const date = new Date();
    await db.ticket.updateMany({
      data: {
        entryAt: date,
      },
      where: {
        entryAt: null,
        number: {
          lte: ticketNumber,
        },
      },
    });

    const oldTicketControl = await db.ticketControl.findFirst({
      where: {
        year: today.getFullYear(),
        month: today.getMonth(),
        day: today.getDate(),
      },
    });

    let newTicketControl;
    const registerDate = moment(registeredTicket.createdAt);
    const entryDate = moment(date);

    const difference = entryDate.diff(registerDate, "minutes");

    if (oldTicketControl) {
      newTicketControl = await db.ticketControl.update({
        data: {
          ...oldTicketControl,
          lastEntryTicket: ticketNumber,
          lastEntryTicketTimestamp: date,
          lastWaitingTimeMinutes: difference,
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
          lastEntryTicket: ticketNumber,
          lastEntryTicketTimestamp: date,
          lastWaitingTimeMinutes: difference,
        },
      });
    }

    return newTicketControl;
  });

  io.emit("ticket-control", ticketControl);
}
