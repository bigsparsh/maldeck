"use server"
import { prisma } from "@/prisma/prisma";
import { currentUser } from "@clerk/nextjs/server"

export const checkUser = async () => {
  const user = await currentUser();
  if (!user) return;

  // Fetch user from DB
  const dbUser = await prisma.user.findUnique({
    where: {
      id: user.id
    }
  })

  // If user not exist in DB then create
  if (!dbUser) {
    const newUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
        name: `${user.fullName}`
      }
    })
    return {
      usernew: true,
      user: newUser
    }
  }

  // If user exists in DB then return
  return {
    usernew: true,
    user: dbUser
  }
}
