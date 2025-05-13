"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appendLogs = exports.createSheet = void 0;
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
const prisma_1 = require("../dist/generated/prisma");
const prisma = new prisma_1.PrismaClient();
dotenv_1.default.config();
const auth = new googleapis_1.google.auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY
    },
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ],
});
const sheets = googleapis_1.google.sheets({
    version: "v4",
    auth
});
const drive = googleapis_1.google.drive({
    version: "v3",
    auth
});
const createSheet = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sheet_title, connId, endCallback }) {
    var _b, _c, _d, _e;
    try {
        const sheet = yield sheets.spreadsheets.create({
            requestBody: {
                properties: {
                    title: sheet_title
                }
            },
            fields: "spreadsheetId",
        });
        yield prisma.connection.update({
            where: {
                id: connId,
            },
            data: {
                sheetId: sheet.data.spreadsheetId,
            }
        });
        yield sheets.spreadsheets.values.append({
            spreadsheetId: sheet.data.spreadsheetId,
            range: "Sheet1",
            valueInputOption: "USER_ENTERED",
            requestBody: {
                values: [
                    ["fingerprintHash", "ip", "location", "route", "time"]
                ]
            }
        });
        yield sheets.spreadsheets.batchUpdate({
            spreadsheetId: sheet.data.spreadsheetId,
            requestBody: {
                requests: [
                    {
                        repeatCell: {
                            range: {
                                sheetId: (_c = (_b = sheet.data.sheets) === null || _b === void 0 ? void 0 : _b[0].properties) === null || _c === void 0 ? void 0 : _c.sheetId,
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
                                sheetId: (_e = (_d = sheet.data.sheets) === null || _d === void 0 ? void 0 : _d[0].properties) === null || _e === void 0 ? void 0 : _e.sheetId,
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
        });
        drive.permissions.create({
            fileId: sheet.data.spreadsheetId,
            requestBody: {
                role: "reader",
                type: "anyone",
            },
        });
        if (endCallback) {
            endCallback(sheet.data.spreadsheetId);
        }
        return {
            msg: "Google Sheet was created successfully",
            data: {
                sheetId: sheet.data.spreadsheetId
            }
        };
    }
    catch (e) {
        return {
            msg: "Error occured while google sheets creation.",
            error: e
        };
    }
});
exports.createSheet = createSheet;
const appendLogs = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sheetId, data, connId }) {
    console.log("Enterd appendLogs");
    console.log({
        sheetId,
        data,
        connId
    });
    const connection = yield prisma.connection.findUnique({
        where: {
            id: connId
        }
    });
    if (!connection) {
        return {
            msg: "Error occured while google sheets log appending",
            error: "The connection was not found, check the connId"
        };
    }
    yield sheets.spreadsheets.values.append({
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
    };
});
exports.appendLogs = appendLogs;
