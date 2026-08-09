import { prisma } from "@/prisma";
import { stripe } from "@/stripe";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const {
  handlers,
  auth: baseAuth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  theme: {
    logo: "/icon.svg",
    colorScheme: "light",
    buttonText: "#64d34b",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: "/auth/signIn",
  },
  events: {
    createUser: async (message) => {
      const userId = message.user.id;
      const userEmail = message.user.email;
      const userImage = message.user.image;
      const userSlug = message.user.name?.split(" ")[0]?.toLowerCase();

      if (!userEmail || !userId) {
        return;
      }
      await prisma.sidefolio.create({
        data: {
          title: "My First boxed.ink",
          slug: userSlug!,
          authorId: userId,
          image: userImage ?? "",
        },
      });
      const stripeCustomer = await stripe.customers.create({
        name: message.user.name ?? "",
        email: userEmail,
      });

      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          stripeCustomerId: stripeCustomer.id,
        },
      });
    },
  },
});
