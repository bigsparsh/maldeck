"use server";

import { prisma } from "@/prisma/prisma";
import { currentUser } from "@clerk/nextjs/server";
import axios from "axios";

export const getConnections = async () => {
  const user = await currentUser();
  const conns = await prisma.connection.findMany({
    where: {
      user: {
        clerkId: user?.id
      }
    }
  })
  return conns;
}

export const checkConnections = async () => {
  const user = await currentUser();
  const cnt = await prisma.connection.count({
    where: {
      user: {
        clerkId: user?.id,
      }
    }
  })
  if (cnt === 0) return false;
  else return true;
}

export const createConnection = async ({ backendUrl, name }: {
  backendUrl: string,
  name: string
}) => {
  const user = await currentUser();
  const newConnection = await prisma.connection.create({
    data: {
      backendUrl,
      user: {
        connect: {
          clerkId: user?.id
        }
      },
      name,
    }
  })
  return newConnection;
}

export const createLog = async ({ connId }: { connId: string }) => {
  axios.post(process.env.MALDECK_BACKEND_URL + "/log/create", {
    ip: "127.0.0.1",
    time: new Date().toISOString(),
    fingerprintHash: "This is a mock request",
    location: "MalDeck Servers",
    route: "/",
    connId
  })
}
