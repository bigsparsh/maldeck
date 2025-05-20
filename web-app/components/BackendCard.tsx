import Link from "next/link";
import { Button } from "./ui/button";

const BackendCards = ({ name, url, sheetId }: { name: string, url: string, sheetId: string | null }) => {
    return <div className="rounded-xl w-full bg-stone-900 p-5 flex">
        <div className="grow">
            <h1 className="text-xl font-bold">{name}</h1>
            <p className="text-lg">{url}</p>
        </div>
        <div>
            <Link href={"https://docs.google.com/spreadsheets/d/" + sheetId}><Button>Check Sheets</Button></Link>
        </div>
    </div>
}
export default BackendCards;
