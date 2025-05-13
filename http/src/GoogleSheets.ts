import { google } from "googleapis";
import dotenv from "dotenv"
import { PrismaClient } from "../dist/generated/prisma";

const prisma = new PrismaClient();
dotenv.config()

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY
    },
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ],
})

const sheets = google.sheets({
    version: "v4",
    auth
})
const drive = google.drive({
    version: "v3",
    auth
})


export const createSheet = async ({
    sheet_title, connId, endCallback
}: {
    sheet_title: string;
    connId: string;
    endCallback?: (sheet_id: string) => void;
}) => {


    try {
        const sheet = await sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: sheet_title
                }
            },
            fields: "spreadsheetId",
        });

        await prisma.connection.update({
            where: {
                id: connId,
            },
            data: {
                sheetId: sheet.data.spreadsheetId,
            }
        })

        await sheets.spreadsheets.values.append({
            spreadsheetId: sheet.data.spreadsheetId as string,
            range: "Sheet1",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [
                    ["fingerprintHash", "ip", "location", "route", "time"]
                ]
            }
        })

        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheet.data.spreadsheetId as string,
            requestBody: {
                requests: [
                    {
                        repeatCell: {
                            range: {
                                sheetId: sheet.data.sheets?.[0].properties?.sheetId,
                                startRowIndex: 0,
                                endRowIndex: 1,
                                startColumnIndex: 0,
                                endColumnIndex: 50,
                            },
                            cell: {
                                userEnteredFormat: {
                                    textFormat: {
                                        bold: true,
                                    },
                                },
                            },
                            fields: "userEnteredFormat.textFormat.bold"
                        }
                    }, {
                        updateDimensionProperties: {
                            range: {
                                sheetId: sheet.data.sheets?.[0].properties?.sheetId,
                                dimension: "COLUMNS",
                                startIndex: 0,
                                endIndex: 100,
                            },
                            properties: {
                                pixelSize: 200,
                            },
                            fields: "pixelSize",
                        },
                    }
                ]
            }
        })

        drive.permissions.create({
            fileId: sheet.data.spreadsheetId as string,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });

        if (endCallback) {
            endCallback(sheet.data.spreadsheetId as string)
        }

        return {
            msg: "Google Sheet was created successfully",
            data: {
                sheetId: sheet.data.spreadsheetId
            }
        }

    } catch (e) {
        return {
            msg: "Error occured while google sheets creation.",
            error: e
        }
    }

}

export const appendLogs = async ({
    sheetId, data, connId
}: {
    sheetId: string;
    data: {
        ip: string;
        time: string;
        location: string;
        route: string;
        fingerprintHash: string
    },
    connId: string
}) => {
    console.log("Enterd appendLogs")
    console.log({
        sheetId,
        data,
        connId
    })
    const connection = await prisma.connection.findUnique({
        where: {
            id: connId
        }
    })
    if (!connection) {
        return {
            msg: "Error occured while google sheets log appending",
            error: "The connection was not found, check the connId"
        }
    }
    await sheets.spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: "Sheet1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
            values: [
                [
                    data.fingerprintHash,
                    data.ip,
                    data.location,
                    data.route,
                    data.time
                ],
            ],
        },
    });
    return {
        msg: "Google sheets log successfully appended",
        data: {
            sheetId
        }
    }
}
