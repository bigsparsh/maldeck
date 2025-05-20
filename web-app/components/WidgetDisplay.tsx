"use client"
import { getConnections } from "@/lib/actions/Connection"
import { createConnection } from "@/lib/actions/Connection"
import { useOnboardingStatus } from "@/store/util"
import { Connection } from "@prisma/client"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import BackendCards from "./BackendCard"
import { Button } from "./ui/button"

const WidgetDisplay = () => {
    const onboardingstatus = useOnboardingStatus((state) => state.status);
    const backendURL = useOnboardingStatus((state) => state.backendUrl);
    const backendName = useOnboardingStatus((state) => state.backendName);
    const setOnboardingStatus = useOnboardingStatus(state => state.setOnboardingStatus);
    const [conns, setConns] = useState<Connection[]>()

    useEffect(() => {
        const gets = async () => {
            setConns(await getConnections())
            if (onboardingstatus) return;

            toast(backendURL);

            if (backendURL && backendURL !== "") {
                createConnection({
                    backendUrl: backendURL,
                    name: backendName,
                })
            }

        }
        gets();

    }, [onboardingstatus]);
    return <div className="flex flex-col p-5 gap-5">
        <h1 className="text-2xl font-semibold">Your Backends</h1>
        <div className="flex flex-col gap-4">
            {conns?.map(ele => {
                return <BackendCards name={ele.name} url={ele.backendUrl} sheetId={ele.sheetId} key={ele.id} />
            })}
        </div>
        <Button onClick={() => setOnboardingStatus(true)}>+</Button>

    </div>
}

export default WidgetDisplay;
