import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/db/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        walletTxns: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      walletBalance: user.walletBalance,
      transactions: user.walletTxns,
    });
  } catch (err) {
    console.error("Wallet error:", err);
    return NextResponse.json({ error: "Failed to fetch wallet" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { amount } = await req.json();
    const topupAmount = parseFloat(amount);

    if (isNaN(topupAmount) || topupAmount <= 0) {
      return NextResponse.json({ error: "Invalid top-up amount" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        walletBalance: { increment: topupAmount },
      },
    });

    const txn = await prisma.walletTransaction.create({
      data: {
        userId: session.user.id,
        type: "CREDIT",
        amount: topupAmount,
        ref: "Online Top-up (Demo Simulation)",
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: "WALLET",
        title: "Wallet Top-up Successful",
        body: `₹${topupAmount.toLocaleString("en-IN")} added to your Wayfare Wallet. Current balance: ₹${updatedUser.walletBalance.toLocaleString("en-IN")}.`,
      },
    });

    return NextResponse.json({
      success: true,
      newBalance: updatedUser.walletBalance,
      transaction: txn,
    });
  } catch (err) {
    console.error("Wallet topup error:", err);
    return NextResponse.json({ error: "Failed to top up wallet" }, { status: 500 });
  }
}
