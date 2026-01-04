import { NextResponse } from "next/server";
import { OutcomeLevel } from "@prisma/client";
import { buildOutcomeChecks } from "@/lib/checks";
import { prisma } from "@/lib/prisma";

export const GET = async () => {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL not set. Connect a database to use the API." },
      { status: 503 },
    );
  }

  const sessions = await prisma.activitySession.findMany({
    orderBy: { createdAt: "desc" },
    include: { outcomeChecks: { orderBy: { dueAt: "asc" } } },
  });

  return NextResponse.json({ sessions });
};

export const POST = async (request: Request) => {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL not set. Connect a database to create sessions." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const {
    title,
    notes,
    durationMinutes,
    expectedPrimaryMetricKey,
    expectedSecondaryMetricKeys = [],
  } = body ?? {};

  if (!title || !durationMinutes || !expectedPrimaryMetricKey) {
    return NextResponse.json(
      { error: "Missing title, durationMinutes, or expectedPrimaryMetricKey." },
      { status: 400 },
    );
  }

  const checks = buildOutcomeChecks(expectedPrimaryMetricKey).map((check) => ({
    ...check,
    outcomeLevel: OutcomeLevel.NONE,
  }));

  const secondaryKeys = Array.isArray(expectedSecondaryMetricKeys)
    ? expectedSecondaryMetricKeys
    : [];

  const session = await prisma.activitySession.create({
    data: {
      title,
      notes,
      durationMinutes,
      expectedPrimaryMetricKey,
      expectedSecondaryMetricKeys: secondaryKeys,
      outcomeChecks: {
        create: checks,
      },
    },
    include: { outcomeChecks: true },
  });

  return NextResponse.json({ session });
};
