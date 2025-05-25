import Link from "next/link";
import { Button } from "./ui/button";

const BackendCards = ({ name, url, sheetId, id }: { name: string, url: string, sheetId: string | null, id: string }) => {
    return <div className="rounded-xl w-full bg-stone-900 p-5 flex">
        <div className="grow">
            <Link href={"/dashboard/backend/" + id} className="text-xl font-bold">{name}</Link>
            <p className="text-lg">{url}</p>
        </div>
        <div>
            <Link href={"https://docs.google.com/spreadsheets/d/" + sheetId}><Button>Check Sheets</Button></Link>
        </div>
    </div>
}
export default BackendCards;
