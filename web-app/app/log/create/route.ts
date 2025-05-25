import { createLog } from './Logs';
import { NextResponse } from 'next/server';
import { z } from "zod"

const logSchema = z.object({
  time: z.string({ description: "The time at which the request was sent." }),
  connId: z.string({ description: "The connection ID of the client from whose backend this reqest was sent from." }),
  fingerprintHash: z.string({ description: "The unique fingerprint indentifier for the request sender." }),
  location: z.string({ description: "The location of the party who sent the request to client server." }),
  ip: z.string({ description: "The IPv4 of the sender." }),
  route: z.string({ description: "Which route was hit by the sender?" }),
})


export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log(body);
    // If you need JWT verification later:
    // const decode = jwt.verify(body.jwt, process.env.JWT_SECRET as string);

    const parse = logSchema.safeParse(body);
    console.log(parse);

    if (parse.success) {
      const newLog = await createLog(parse.data);

      return NextResponse.json({
        msg: "Log has been created successfully",
        data: {
          log: newLog
        }
      });
    } else {
      return NextResponse.json({
        msg: "Error occurred while creating log",
        error: parse.error
      }, { status: 400 });
    }
  } catch (e) {
    console.error(e);
    return NextResponse.json({
      msg: "Error occurred while creating log",
      error: e instanceof Error ? e.message : 'Unknown error'
    }, { status: 500 });
  }
}
