"use client";
import { useGraphState } from '@/store/util';
import { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


const Chart = () => {
    const data = useGraphState(state => state.state);
    useEffect(() => { }, [data])
    return (
        <ResponsiveContainer width="100%" height="50%" >
            <LineChart
                width={500}
                height={300}
                data={data}
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
    );
}

export default Chart;
