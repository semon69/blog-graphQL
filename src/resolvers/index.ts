import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient();

interface TUser {
  name: string;
  email: string;
  password: string;
}

export const resolvers = {
  Query: {
    users: async (parent: any, args: any, context: any) => {
      return await prisma.user.findMany();
    },
  },
  Mutation: {
    signup: async (parent: any, args: TUser, context: any) => {
      const hassedPassword = await bcrypt.hash(args.password, 12);

      const newUser = await prisma.user.create({
        data: {
          name: args.name,
          email: args.email,
          password: hassedPassword,
        },
      });
      const token = jwt.sign({userId: newUser.id}, "secret", {expiresIn: '1d'})
      return {token}
    },
  },
};
