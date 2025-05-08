"use client"
import { createConnection } from "@/lib/actions/User"
import { User } from "@prisma/client"
import { useEffect } from "react"
import { toast } from "sonner"

const WidgetDisplay = ({ user }: {
    user: {
        usernew: boolean,
        user: User
    }
}) => {
    const onboardingstatus = localStorage.getItem("onboarding_status");
    useEffect(() => {
        if (onboardingstatus === "open") return;
        const backendURL = localStorage.getItem("backendURL");
        toast(backendURL);
        if (backendURL && backendURL !== "") {
            const conn = createConnection({
                backendUrl: backendURL,
                name: "Sona Movsessian",
                user: user.user
            })
            toast(JSON.stringify(conn));
        }
    }, [onboardingstatus]);
    return <div>This is the widget Display</div>
}

export default WidgetDisplay;
