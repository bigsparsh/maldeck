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
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Logs_1 = require("./Logs");
const zod_1 = require("zod");
const app = (0, express_1.default)();
dotenv_1.default.config();
app.use(express_1.default.json());
const logSchema = zod_1.z.object({
    time: zod_1.z.string({ description: "The time at which the request was sent." }),
    connId: zod_1.z.string({ description: "The connection ID of the client from whose backend this reqest was sent from." }),
    fingerprintHash: zod_1.z.string({ description: "The unique fingerprint indentifier for the request sender." }),
    location: zod_1.z.string({ description: "The location of the party who sent the request to client server." }),
    ip: zod_1.z.string({ description: "The IPv4 of the sender." }).ip({ version: "v4" }),
    route: zod_1.z.string({ description: "Which route was hit by the sender?" }),
});
app.post("/log/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    try {
        const decode = jsonwebtoken_1.default.verify(body.jwt, process.env.JWT_SECRET);
        const parse = logSchema.safeParse(decode);
        if (parse.success) {
            const newLog = yield (0, Logs_1.createLog)(parse.data);
            res.json({
                msg: "Log has been created successfully",
                data: {
                    log: newLog
                }
            });
        }
        else {
            res.json({
                msg: "Error occured while creating log",
                error: parse.error
            });
        }
    }
    catch (e) {
        res.json({
            msg: "Error occured while creating log",
            error: e
        });
    }
}));
app.listen(3003, () => {
    console.log("Listening on port 3003");
});
