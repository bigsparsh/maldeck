import express from "express";
import { prisma } from "./db";
import expressMonitor from "./express-monitor";

const app = express();
app.use(express.json());


expressMonitor(app, {
    dashboardUrl: 'http://localhost:3001/dashboard',
    authToken: '69969696',
    metricsInterval: 15000,
    dashboardInterval: 30000
});

app.get("/users", async (_, res) => {
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
