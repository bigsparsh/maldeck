import express from "express";
import dotenv from "dotenv";
// import jwt from "jsonwebtoken";
import { createLog } from "./Logs";
import { z } from "zod";
const app = express();

dotenv.config()

app.use(express.json());

const logSchema = z.object({
    time: z.string({ description: "The time at which the request was sent." }),
    connId: z.string({ description: "The connection ID of the client from whose backend this reqest was sent from." }),
    fingerprintHash: z.string({ description: "The unique fingerprint indentifier for the request sender." }),
    location: z.string({ description: "The location of the party who sent the request to client server." }),
    ip: z.string({ description: "The IPv4 of the sender." }),
    route: z.string({ description: "Which route was hit by the sender?" }),
})

app.post("/log/create", async (req, res) => {
    const body = req.body;
    console.log(body)
    try {
        // const decode = jwt.verify(body.jwt, process.env.JWT_SECRET as string);
        const parse = logSchema.safeParse(body);
        console.log(parse);
        if (parse.success) {
            const newLog = await createLog(parse.data);
            res.json({
                msg: "Log has been created successfully",
                data: {
                    log: newLog
                }
            })
        } else {
            res.json({
                msg: "Error occured while creating log",
                error: parse.error
            })
        }
    } catch (e) {
        res.json({
            msg: "Error occured while creating log",
            error: e
        })
    }
})

app.listen(3003, () => {
    console.log("Listening on port 3003");
})
