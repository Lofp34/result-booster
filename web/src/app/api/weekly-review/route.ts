import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard-data";

export const GET = async () => {
  const data = await getDashboardData();
  return NextResponse.json({ weekly: data.weekly });
};
