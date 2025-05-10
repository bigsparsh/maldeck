"use client"
import { createConnection } from "@/lib/actions/User"
import { User } from "@prisma/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const WidgetDisplay = ({ user }: {
    user: {
        usernew: boolean,
        user: User
    }
}) => {
    const [onboardingstatus, setOnboardingStatus] = useState<string>();
    useEffect(() => {
        setOnboardingStatus(localStorage.getItem("onboarding_status") as string)
    }, [])
    useEffect(() => {
        if (onboardingstatus === "open") return;
        const backendURL = localStorage.getItem("backendURL");
        toast(backendURL);
        if (backendURL && backendURL !== "") {
            createConnection({
                backendUrl: backendURL,
                name: "Sona Movsessian",
                user: user.user
            })
        }
    }, [onboardingstatus]);
    return <div>This is the widget Display</div>
}

export default WidgetDisplay;
