import { NextRequest, NextResponse } from "next/server";
import { OutcomeLevel } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const parseOutcomeLevel = (value?: string) => {
  if (!value) return null;
  const normalized = value.toUpperCase();
  if (!["NONE", "LOW", "MED", "HIGH"].includes(normalized)) return null;
  return normalized as OutcomeLevel;
};

export const PATCH = async (
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) => {
  const { id } = await context.params;
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL not set. Connect a database to update checks." },
      { status: 503 },
    );
  }

  const body = await request.json();
  const { outcomeLevel, metricValue, note } = body ?? {};
  const parsedLevel = parseOutcomeLevel(outcomeLevel);

  if (!parsedLevel) {
    return NextResponse.json({ error: "Invalid outcomeLevel." }, { status: 400 });
  }

  const check = await prisma.outcomeCheck.update({
    where: { id },
    data: {
      outcomeLevel: parsedLevel,
      metricValue: metricValue ?? null,
      note: note ?? null,
    },
  });

  return NextResponse.json({ check });
};
