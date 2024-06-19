import { db } from "../utils/db.server";

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
