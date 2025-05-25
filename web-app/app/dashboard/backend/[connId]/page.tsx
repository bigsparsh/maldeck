"use client";
import { Tooltip } from "@/components/ui/tooltip";
import { pollBackend } from "@/lib/actions/Connection";
import { useGraphState } from "@/store/util";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const Page = () => {
  const { connId } = useParams();
  const setGraphState = useGraphState(state => state.setState);
  const setCompleteGraphState = useGraphState(state => state.setCompleteGraphState);
  const graphState = useGraphState(state => state.state);
  // const [data, setData] = useState<any>();

  useEffect(() => {
    let interval = setInterval(async () => {
      const res = await pollBackend({ connectionId: connId as string });
      if (graphState.length > 5) {
        graphState.reverse().pop();
        graphState.reverse();
        setCompleteGraphState(graphState);
      }
      // setData({
      //   time: (new Date()).toTimeString(),
      //   requestPerSec: res.reqPerSec as number,
      //   totalRequests: res.totalRequest as number
      //
      // })
      setGraphState(
        {
          time: (new Date()).toTimeString(),
          requestPerSec: res.reqPerSec as number,
          totalRequests: res.totalRequest as number
        }
      )
    }, 2500)
    return () => {
      clearInterval(interval);
    }
  }, [])

  return <div className="w-full h-screen p-5 flex flex-col">
    <div className="basis-1/2">
      {JSON.stringify(graphState, null, 2)}
      <ResponsiveContainer width="100%" height="50%" >
        <LineChart
          width={500}
          height={300}
          data={graphState}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="requestPerSec" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="totalRequests" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="basis-1/2">lksajdlks</div>
  </div >
}
export default Page;
