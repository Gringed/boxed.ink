import { prisma } from "@/prisma";
import { stripe } from "@/stripe";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { generateUniqueSlug } from "@/lib/slug";
import type { Adapter } from "next-auth/adapters";

const adapter: Adapter = PrismaAdapter(prisma);

export const {
  handlers,
  auth: baseAuth,
  signIn,
  signOut,
} = NextAuth({
  adapter,
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
    error: "/auth/signIn",
  },
  events: {
    createUser: async (message) => {
      const userId = message.user.id;
      const userEmail = message.user.email;
      const userImage = message.user.image;
      const userName = message.user.name;

      if (!userEmail || !userId) {
        return;
      }
      const userSlug = await generateUniqueSlug(userName || userEmail);
      await prisma.sidefolio.create({
        data: {
          title: userName || "My boxed.ink",
          slug: userSlug,
          authorId: userId,
          image: userImage ?? "",
          slugClaimed: false,
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
