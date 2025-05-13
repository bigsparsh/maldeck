"use client"
import { createConnection } from "@/lib/actions/User"
import { useOnboardingStatus } from "@/store/util"
import { User } from "@prisma/client"
import { useEffect } from "react"
import { toast } from "sonner"

const WidgetDisplay = ({ user }: {
    user: {
        usernew: boolean,
        user: User
    }
}) => {
    const onboardingstatus = useOnboardingStatus((state) => state.status);
    const backendURL = useOnboardingStatus((state) => state.backendUrl);
    const backendName = useOnboardingStatus((state) => state.backendName);

    useEffect(() => {
        if (onboardingstatus) return;

        toast(backendURL);

        if (backendURL && backendURL !== "") {
            createConnection({
                backendUrl: backendURL,
                name: backendName,
                user: user.user
            })
        }

    }, [onboardingstatus]);
    return <div>This is the widget Display</div>
}

export default WidgetDisplay;
