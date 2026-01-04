import { NextResponse } from "next/server";
import { getObjectiveConfig } from "@/lib/dashboard-data";

export const GET = async () => {
  return NextResponse.json(getObjectiveConfig());
};
