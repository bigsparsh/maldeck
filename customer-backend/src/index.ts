import express from "express";
import { prisma } from "./db";

const app = express();
app.use(express.json());


/// ---------------------------------------------------------

import axios from "axios";
import expressFingerprint from "express-fingerprint"

let totalRequest = 0;
let totalRequestBfr = 0;
let reqPerSec = 0;
let reqCounter = 0;
const blockRequestNum = 10;
const blockTimeMinutes = 0.25;

const graphStuff: {
    reqPerSecond: number,
    time: string,
    totalRequests: number
}[] = [];

const traffic: Map<string, number> = new Map();
let blockList: string[] = [];

const stuff = async () => {
    const res: {
        blockList: {
            id: string;
            connId: string;
            fingerprintHash: string;
        }[]
    } = (await axios.post("http://localhost:3000/api/blocklist", {
        connId: "6832d395ecfd317da90f9f39"
    })).data;
    blockList = res.blockList.map(ele => {
        return ele.fingerprintHash
    });
    console.log(blockList)
}

if (blockList.length === 0) {
    stuff();
}

setInterval(() => {
    reqPerSec = totalRequest - totalRequestBfr;
    totalRequestBfr = totalRequest;
}, 1000)

setInterval(() => {
    if (graphStuff.length > 5) {
        graphStuff.reverse().pop();
        graphStuff.reverse();
    }
    graphStuff.push({
        totalRequests: totalRequest,
        time: new Date().toISOString(),
        reqPerSecond: reqPerSec
    })
    traffic.clear();
}, 1000 * 20)

setInterval(async () => {
    stuff();
}, 1000 * 60 * blockTimeMinutes)

app.use(expressFingerprint())
app.enable('trust proxy')

app.use(async (req, res, next) => {
    if (req.query.admin) {
        next();
        return;
    }
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

    if (geoResponse.data.status === 'success')
        location = geoResponse.data.country;


    if (blockList.includes(fingerprint.hash)) {
        res.json({
            msg: "You have been blocked try again later"
        })
        return;
    }

    if (traffic.get(fingerprint.hash)) {
        traffic.set(fingerprint.hash,
            traffic.get(fingerprint.hash) + 1
        )
        if (traffic.get(fingerprint.hash) > blockRequestNum)
            blockList.push(fingerprint.hash);
    } else {
        traffic.set(fingerprint.hash, 1)
    }
    console.log(traffic)
    axios.post("http://localhost:3000/api/log/create", {
        fingerprintHash: fingerprint.hash,
        ip,
        route,
        time,
        location,
        connId: "6832d395ecfd317da90f9f39"
    })
    next()
});

app.get("/metrics", async (_, res) => {
    res.json({
        totalRequest,
        reqPerSec,
        reqCounter,
        graphStuff,
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
