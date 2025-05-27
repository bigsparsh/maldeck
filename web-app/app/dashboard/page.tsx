"use client";

import BackendCards from "@/components/BackendCard";
import { Button } from "@/components/ui/button";
import { getConnections, createConnection, createLog } from "@/lib/actions/Connection";
import { Connection } from "@prisma/client";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AiOutlineClose, AiOutlineLoading3Quarters } from "react-icons/ai"



const Dashboard = () => {
  const [conns, setConns] = useState<Connection[]>();
  const [pageNum, setPageNum] = useState<number>(1);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [backendUrl, setBackendUrl] = useState<string>();
  const [copied, setCopied] = useState(false)
  const [backendName, setBackendName] = useState<string>();
  const [dialogLoading, setDialogLoading] = useState<boolean>();
  const [connId, setConnId] = useState<string>();


  const handleCopy = async () => {
    await navigator.clipboard.writeText(codeExample)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const codeExample = `
/// ---------------------------------------------------------

import axios from "axios";
import expressFingerprint from "express-fingerprint"

let totalRequest = 0;
let totalRequestBfr = 0;
let reqPerSec = 0;
let reqCounter = 0;
const blockRequestNum = 10;
const blockTimeMinutes = 1;

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
        connId: "${connId}"
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
        connId: "${connId}"
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
  `

  useEffect(() => {
    const gets = async () => {
      const cns = await getConnections();
      console.log(cns);
      setConns(cns)
    }
    gets();
  }, [])

  return <div className="h-full w-full flex flex-col p-5 gap-10">
    {
      dialogOpen &&
      <dialog className="m-auto top-1/3 p-5 bg-stone-900 outline-none flex flex-col gap-5 rounded-xl min-w-3/6 border border-white" >
        {
          pageNum === 1 ?

            <>
              <div className="flex justify-between w-full">
                <h1 className="text-2xl font-bold">Give Backend Credentials</h1>
                {
                  dialogLoading ?
                    <Button variant="ghost" disabled >
                      <AiOutlineClose className="" />
                    </Button>
                    :
                    <Button variant="ghost" onClick={() => {
                      setDialogOpen(false);
                      setPageNum(1);
                    }}>
                      <AiOutlineClose className="" />
                    </Button>
                }
              </div>
              <input type="text" className="px-4 py-2 rounded-xl bg-stone-950" placeholder="Enter Backend Name" onChange={(e) => setBackendName(e.target.value)} />
              <input type="text" className="px-4 py-2 rounded-xl bg-stone-950" placeholder="Enter Backend Url" onChange={(e) => setBackendUrl(e.target.value)} />
            </>
            : pageNum === 2 ?

              <>
                <h1 className="text-2xl font-bold">Code copy</h1>
                <p>Copy the following code to your backend in order to let us work.</p>
                <div className="relative border rounded-md">
                  <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[300px] whitespace-pre-wrap">
                    <code className="text-sm">{codeExample}</code>
                  </pre>
                  <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-8 w-8" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </>
              : pageNum === 3 ?
                <>
                  <h1 className="text-2xl font-bold">Give Backend Credentials</h1>
                  <input type="text" className="px-4 py-2 rounded-xl bg-stone-950" placeholder="Enter Backend Name" />
                  <input type="text" className="px-4 py-2 rounded-xl bg-stone-950" placeholder="Enter Backend Url" />
                </> : null
        }
        <div className="flex justify-between w-full">
          {
            pageNum === 1 ?
              <Button disabled>Back</Button> :
              <Button onClick={() => setPageNum(r => r - 1)}>Back</Button>
          }
          {

            pageNum === 1 ?
              <Button onClick={async () => {
                if (!backendUrl || backendUrl.length < 10) {
                  toast("Please enter a valid backendUrl")
                  return;
                }

                if (!backendName || backendName.length < 2) {
                  toast("Please enter a valid backendName")
                  return;
                }

                setDialogLoading(true);
                const newConn = await createConnection({
                  backendUrl: backendUrl as string,
                  name: backendName as string
                })
                setConnId(newConn.id);
                setDialogLoading(false);
                setPageNum(r => r + 1);
              }}
                className="flex gap-3"
              >{
                  dialogLoading ? < AiOutlineLoading3Quarters className="animate-spin" size={50} /> : null
                } Next</Button> :
              pageNum === 2 ?

                <Button
                  className="flex gap-3"
                  onClick={async () => {
                    await createLog({ connId: connId as string })
                    setDialogOpen(false)
                    setPageNum(1);
                  }}>{
                    dialogLoading ? < AiOutlineLoading3Quarters className="animate-spin" size={50} /> : null
                  } Next</Button> :
                null
          }
        </div>
      </dialog>
    }
    <div className="flex justify-between w-full">
      <h1 className="text-xl font-semibold">Backends</h1>
      <div><Button onClick={() => {
        setDialogOpen(true);
      }}>Add Backend + </Button></div>
    </div>
    <div className="flex flex-col w-full h-full gap-3">
      {
        conns?.length === 0 ? <div className="grow grid place-items-center">You have no backends currently</div> : conns?.map(ele => {
          return <BackendCards key={ele.id} id={ele.id} name={ele.name} url={ele.backendUrl} sheetId={ele.sheetId}></BackendCards>
        })
      }
    </div>
  </div>
}
export default Dashboard;
