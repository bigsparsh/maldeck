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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLog = void 0;
const prisma_1 = require("../dist/generated/prisma/");
const GoogleSheets_1 = require("./GoogleSheets");
const prisma = new prisma_1.PrismaClient();
const createLog = (_a) => __awaiter(void 0, [_a], void 0, function* ({ location, ip, fingerprintHash, route, connId, time }) {
    try {
        const newLog = yield prisma.log.create({
            data: {
                location,
                ip,
                fingerprintHash,
                route,
                connId,
                time,
            },
        });
        const conn = yield prisma.connection.findUnique({
            where: {
                id: connId
            },
            include: {
                logs: true
            }
        });
        if (!conn)
            return {
                msg: "Error Occured while log creation",
                error: "No connection found with the connId"
            };
        if ((conn === null || conn === void 0 ? void 0 : conn.logs.length) == 1) {
            yield (0, GoogleSheets_1.createSheet)({
                sheet_title: conn.backendUrl,
                connId: connId,
                endCallback: (sheet_id) => __awaiter(void 0, void 0, void 0, function* () {
                    yield (0, GoogleSheets_1.appendLogs)({
                        sheetId: sheet_id,
                        connId,
                        data: {
                            route,
                            time,
                            location,
                            fingerprintHash,
                            ip
                        }
                    });
                })
            });
        }
        else {
            yield (0, GoogleSheets_1.appendLogs)({
                sheetId: conn === null || conn === void 0 ? void 0 : conn.sheetId,
                connId,
                data: {
                    route,
                    time,
                    location,
                    fingerprintHash,
                    ip
                }
            });
        }
        return newLog;
    }
    catch (e) {
        throw new Error("Error Occured while log creation: " + e);
    }
});
exports.createLog = createLog;
