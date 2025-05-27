"use client"

import { createBlockList, getBlockList, getMetrics, removeBlockList } from "@/lib/actions/Connection";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlockList } from "@prisma/client";


const Page = () => {
  const [totalRequests, setTotalRequests] = useState<{
    time: string,
    totalRequests: number,
  }[]>([]);

  const [reqPerSec, setReqPerSec] = useState<{
    time: string,
    reqPerSecond: number,
  }[]>([]);

  const [blockList, setBlockList] = useState<BlockList[]>();
  const [fingerprint, setFingerprint] = useState<string>();

  const chartConfig = {
    totalRequests: {
      label: "Total Requests ",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  const chartConfig2 = {
    reqPerSecond: {
      label: "Request Per Second ",
      color: "hsl(var(--chart-1))",
    },
  } satisfies ChartConfig

  const { connId } = useParams<{ connId: string }>();


  const gets = async () => {
    const metrics = await getMetrics({
      connectionId: connId
    });
    console.log(metrics);
    setTotalRequests(metrics.graphStuff.map(ele => {
      return {
        time: new Date(ele.time).toLocaleTimeString(),
        totalRequests: ele.totalRequests
      }
    }));

    setReqPerSec(metrics.graphStuff.map(ele => {
      return {
        time: new Date(ele.time).toLocaleTimeString(),
        reqPerSecond: ele.reqPerSecond
      }
    }));

    setBlockList(await getBlockList({ connId }))
  }

  useEffect(() => {
    gets();
  }, [])

  return <div className="p-5 w-full flex flex-col gap-5">
    <div className="flex gap-10 w-full justify-evenly ">
      {
        totalRequests.length > 0 && reqPerSec.length > 0 ?
          <>

            <Card>
              <CardHeader>
                <CardTitle>Request Per Second</CardTitle>
                <CardDescription>Last 5 request data</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <LineChart
                    accessibilityLayer
                    data={totalRequests}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 4)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                      dataKey="totalRequests"
                      type="natural"
                      stroke="var(--color-red-500)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">Get notified for a spike</div>
                <div className="leading-none text-muted-foreground">
                  Showing total visitors for the last 6 months
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Per Second</CardTitle>
                <CardDescription>Last 5 request data</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig2}>
                  <LineChart
                    accessibilityLayer
                    data={reqPerSec}
                    margin={{
                      left: 12,
                      right: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 4)}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent hideLabel />}
                    />
                    <Line
                      dataKey="reqPerSecond"
                      type="natural"
                      stroke="var(--color-red-500)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex gap-2 font-medium leading-none">Get notified for a spike</div>
                <div className="leading-none text-muted-foreground">
                  Showing total visitors for the last 6 months
                </div>
              </CardFooter>
            </Card>
          </> : <div className="p-10 w-full text-center">No Logs right now</div>
      }

    </div>
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-semibold">Your blocklist</h1>
      <div className="flex gap-3 w-full">
        <Input type="text" placeholder="Enter the fingerprint hash to add it to the blocklist" onChange={(e) => {
          setFingerprint(e.target.value);
        }} /><Button onClick={async () => {
          if (!fingerprint || fingerprint.length < 12) return;
          await createBlockList({
            connId,
            fingerprint: fingerprint as string
          })
          setBlockList(r => {
            r?.push({ connId, fingerprintHash: fingerprint, id: crypto.randomUUID() })
            return r;
          })
        }}>Add +</Button>
      </div>
      {
        blockList && blockList.length > 0 ?
          blockList?.map(ele => {
            return <div key={ele.id} className="flex gap-4 justify-between">
              {ele.fingerprintHash}
              <Button onClick={async () => {
                removeBlockList(({
                  connId,
                  fingerprint: ele.fingerprintHash
                }))
              }}>Remove</Button>
            </div>
          }) : <div className="w-full text-center p-10">No Fingerprints in block list found</div>
      }
    </div>
  </div>
}
export default Page;
