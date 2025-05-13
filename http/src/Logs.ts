import { PrismaClient } from "../dist/generated/prisma/";
import { appendLogs, createSheet } from "./GoogleSheets";
const prisma = new PrismaClient();

export const createLog = async ({
    location, ip, fingerprintHash, route, connId, time
}: {
    location: string;
    ip: string;
    fingerprintHash: string;
    route: string;
    connId: string;
    time: string;
}) => {
    try {
        const newLog = await prisma.log.create({
            data: {
                location,
                ip,
                fingerprintHash,
                route,
                connId,
                time,
            },
        })
        const conn = await prisma.connection.findUnique({
            where: {
                id: connId
            },
            include: {
                logs: true
            }
        })
        if (!conn)
            return {
                msg: "Error Occured while log creation",
                error: "No connection found with the connId"
            }
        if (conn?.logs.length == 1) {
            await createSheet({
                sheet_title: conn.backendUrl,
                connId: connId,
                endCallback: async (sheet_id: string) => {
                    await appendLogs({
                        sheetId: sheet_id,
                        connId,
                        data: {
                            route,
                            time,
                            location,
                            fingerprintHash,
                            ip
                        }
                    })
                }
            })
        }
        else {
            await appendLogs({
                sheetId: conn?.sheetId as string,
                connId,
                data: {
                    route,
                    time,
                    location,
                    fingerprintHash,
                    ip
                }
            })
        }

        return newLog
    } catch (e: any) {
        throw new Error("Error Occured while log creation: " + e);
    }
}
