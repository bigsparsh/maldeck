import { PrismaClient } from '../dist/generated/prisma/'
import { withAccelerate } from '@prisma/extension-accelerate'

export const prisma = new PrismaClient().$extends(withAccelerate())
