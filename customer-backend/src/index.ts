import express from "express";
import { prisma } from "./db";

const app = express();
app.use(express.json());





/// ---------------------------------------------------------

import os from "os";
import axios from "axios";
import expressFingerprint from "express-fingerprint"

let totalRequest = 0;
let reqPerSec = 0;
let reqCounter = 0;

setInterval(() => {
    reqPerSec = totalRequest / reqCounter;
    reqCounter++;
}, 1000)

let osStuff = {
    platform: os.platform(),
    architecture: os.arch(),
    release: os.release(),
    type: os.type(),
    uptime: os.uptime(),
    network: os.networkInterfaces(),
    totalmem: os.totalmem(),
    cpus: os.cpus()
}

app.use(expressFingerprint())
app.enable('trust proxy')

app.use(async (req, _, next) => {
    totalRequest++;
    let fingerprint = req.fingerprint;
    const ip =
        req.headers['cf-connecting-ip'] ||
        req.headers['x-real-ip'] ||
        req.headers['x-forwarded-for'] ||
        req.socket.remoteAddress || '';
    let route = req.originalUrl;
    let time = new Date().toISOString();
    let location = "";
    const geoResponse = await axios.get("http://ip-api.com/json/" + ip);

    if (geoResponse.data.status === 'success') {
        location = geoResponse.data.country;
    }
    console.log(
        {
            fingerprintHash: fingerprint.hash,
            ip,
            route,
            time,
            location,
        }
    )
    // axios.post("http://localhost:3003/log/create", {
    //     fingerprintHash: fingerprint.hash,
    //     ip,
    //     route,
    //     time,
    //     location,
    //     connId: "682c0ebdd2b8ebd0ff04603d"
    // })
    next()
});

app.get("/metrics", async (_, res) => {
    console.log(
        // osStuff,
        totalRequest,
        reqPerSec,
        reqCounter
    )
    res.json({
        msg: "Done :thmbsup:",
        data: {
            // osStuff,
            totalRequest,
            reqPerSec,
            reqCounter
        }
    })
})

/// ---------------------------------------------------------








app.get("/users", async (_, res) => {
    totalRequest++;
    const users = await prisma.user.findMany({});
    if (users.length === 0)
        res.json({
            msg: "No Users",
        }).status(404)

    res.json({
        msg: "Users Found",
        users,
    }).status(200)
})

app.get("/user/:id", async (req, res) => {
    totalRequest++;
    const user_id = req.params.id;
    if (!user_id)
        res.json({
            msg: "Id not provided",
        }).status(500)
    const user = await prisma.user.findUnique({
        where: {
            id: user_id
        }
    })
    if (!user)
        res.json({
            msg: "User not found with ID: " + user_id,
        }).status(404)

    res.json({
        msg: "User Found",
        user
    }).status(200)
})

app.post("/user/create", async (req, res) => {
    totalRequest++;
    const body = req.body;
    const user = {
        name: body.name,
        email: body.email,
        address: body.address,
        phone: body.phone,
    }

    const newUser = await prisma.user.create({
        data: {
            ...user
        }
    })

    res.json({
        msg: "User create with ID: " + newUser.id,
        user: newUser
    })
})



app.listen(3100, () => {
    console.log("Running express server on port 3100");
});
