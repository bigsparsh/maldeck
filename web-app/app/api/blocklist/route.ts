import { prisma } from '@/prisma/prisma';
import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
  const body = await request.json();
  const blockList = await prisma.blockList.findMany({
    where: {
      connId: body.connId
    }
  })

  return NextResponse.json({
    blockList
  })
}
