import { TUser } from "../../types/types";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const Mutation = {
  signup: async (parent: any, args: TUser, { prisma }: any) => {
    const user = await prisma.user.findFirst({
      where: {
        email: args.email,
      },
    });

    if (user) {
      return {
        errorMessage: "This email already used",
        token: null,
      };
    }
    const hassedPassword = await bcrypt.hash(args.password, 12);

    const newUser = await prisma.user.create({
      data: {
        name: args.name,
        email: args.email,
        password: hassedPassword,
      },
    });

    if (args.bio) {
      await prisma.profile.create({
        data: {
          bio: args.bio,
          userId: newUser.id,
        },
      });
    }
    const token = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );
    return { token };
  },
  signin: async (
    parent: any,
    args: { email: string; password: string },
    { prisma }: any
  ) => {
    const user = await prisma.user.findFirst({
      where: {
        email: args.email,
      },
    });

    if (!user) {
      return {
        errorMessage: "User not found",
        token: null,
      };
    }

    const isPasswordMatch = await bcrypt.compare(args.password, user.password);

    if (!isPasswordMatch) {
      return {
        errorMessage: "Incorrect Password",
        token: null,
      };
    }

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    return {
      errorMessage: null,
      token,
    };
  },
};
