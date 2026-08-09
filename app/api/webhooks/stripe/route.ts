import { prisma } from "@/prisma";
import { stripe } from "@/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const POST = async (req: NextRequest) => {
  const signature = req.headers.get("Stripe-Signature") as string;
  let event: Stripe.Event;
  const body = await req.text();
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    return new NextResponse("Webhook error", { status: 400 });
  }

  const getOneYearLaterDate = (): Date => {
    const currentDate = new Date();
    const nextYearDate = new Date();
    nextYearDate.setFullYear(currentDate.getFullYear() + 1);
    return nextYearDate;
  };

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const stripeCustomerId = session.customer as string;

      if (session.mode === "subscription") {
        await prisma.user.updateMany({
          where: { stripeCustomerId },
          data: {
            plan: "PRO",
            expiresAt: undefined,
          },
        });
        break;
      }

      await prisma.user.updateMany({
        where: { stripeCustomerId },
        data: {
          plan:
            session.amount_subtotal === 2000 ? "PREMIUM_ONE" : "PREMIUM_LIFE",
          expiresAt:
            session.amount_subtotal === 2000
              ? getOneYearLaterDate()
              : undefined,
        },
      });
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeCustomerId = invoice.customer as string;
      const user = await prisma.user.findFirst({
        where: { stripeCustomerId },
      });
      if (user?.plan === "PRO") {
        break;
      }
      await prisma.user.updateMany({
        where: { stripeCustomerId },
        data: {
          plan: "PREMIUM_ONE",
          expiresAt: getOneYearLaterDate(),
        },
      });
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const stripeCustomerId = invoice.customer as string;
      await prisma.user.updateMany({
        where: { stripeCustomerId },
        data: {
          plan: "FREEMIUM",
          expiresAt: undefined,
        },
      });
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const stripeCustomerId = subscription.customer as string;
      await prisma.user.updateMany({
        where: { stripeCustomerId, plan: "PRO" },
        data: {
          plan: "FREEMIUM",
        },
      });
      break;
    }
    default:
    // Unhandled event type
  }
  return NextResponse.json({ ok: true });
};
