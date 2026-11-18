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
    const alerts = await prisma.priceAlert.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    // Evaluate triggered alerts based on current fares
    const evaluated = await Promise.all(
      alerts.map(async (alert) => {
        let route: any = {};
        try {
          route = JSON.parse(alert.routeJson);
        } catch {
          // fallback
        }

        // Check if condition triggered
        if (alert.status === "ACTIVE") {
          let currentPrice = 3500;
          if (alert.mode === "FLIGHT" && route.from && route.to) {
            const flight = await prisma.flight.findFirst({
              where: { fromCode: route.from, toCode: route.to },
              orderBy: { baseFare: "asc" },
            });
            if (flight) currentPrice = flight.baseFare;
          }

          if (currentPrice <= alert.targetPrice) {
            const updated = await prisma.priceAlert.update({
              where: { id: alert.id },
              data: {
                status: "TRIGGERED",
                triggeredAt: new Date(),
              },
            });

            await prisma.notification.create({
              data: {
                userId: session.user.id,
                type: "ALERT",
                title: `Price Alert Hit: ${route.from} → ${route.to}`,
                body: `Fare dropped to ₹${currentPrice.toLocaleString("en-IN")}, below your target of ₹${alert.targetPrice.toLocaleString("en-IN")}!`,
              },
            });

            return { ...updated, currentPrice, route };
          }
        }

        return { ...alert, route };
      })
    );

    return NextResponse.json(evaluated);
  } catch (err) {
    console.error("Alerts error:", err);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { mode = "FLIGHT", from, to, date, targetPrice } = await req.json();

    const price = parseFloat(targetPrice);
    if (!from || !to || isNaN(price) || price <= 0) {
      return NextResponse.json({ error: "Invalid alert parameters" }, { status: 400 });
    }

    const routeJson = JSON.stringify({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      date,
    });

    const alert = await prisma.priceAlert.create({
      data: {
        userId: session.user.id,
        mode,
        routeJson,
        targetPrice: price,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, alert });
  } catch (err) {
    console.error("Create alert error:", err);
    return NextResponse.json({ error: "Failed to create price alert" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing alert ID" }, { status: 400 });

    await prisma.priceAlert.delete({
      where: { id, userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete alert error:", err);
    return NextResponse.json({ error: "Failed to delete alert" }, { status: 500 });
  }
}
