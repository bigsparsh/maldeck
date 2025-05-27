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
  axios.post("http://localhost:3000/log/create", {
    ip: "127.0.0.1",
    time: new Date().toISOString(),
    fingerprintHash: "This is a mock request",
    location: "MalDeck Servers",
    route: "/",
    connId
  })
}

export const getMetrics = async ({ connectionId }: { connectionId: string }) => {
  const conn = await prisma.connection.findUnique({
    where: {
      id: connectionId
    }
  })

  if (!conn?.backendUrl) throw new Error("conn backendUrl is invalid or something")
  console.log(conn?.backendUrl);
  const res: {
    data: {
      graphStuff: {
        reqPerSecond: number;
        time: string;
        totalRequests: number;
      }[]
    }
  } = await axios.get(conn?.backendUrl + "/metrics", {
    params: {
      admin: true
    }
  });
  return {
    ...res.data
  }
}
export const createBlockList = async ({
  connId,
  fingerprint
}: {
  connId: string;
  fingerprint: string;
}) => {
  const blockEntry = await prisma.blockList.create({
    data: {
      connId,
      fingerprintHash: fingerprint
    }
  })

  return blockEntry;
}

export const getBlockList = async ({ connId }: { connId: string }) => {
  const blockEntries = await prisma.blockList.findMany({
    where: {
      connId
    }
  })

  return blockEntries;
}

export const removeBlockList = async ({ connId, fingerprint }: { connId: string, fingerprint: string }) => {
  const blockEntries = await prisma.blockList.deleteMany({
    where: {
      connId,
      fingerprintHash: fingerprint
    }
  })

  return blockEntries;
}
