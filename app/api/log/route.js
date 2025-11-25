import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const { rating, username } = await request.json();

    if (!rating) {
      return NextResponse.json({ error: "Rating is required" }, { status: 400 });
    }

    if (!username) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const timestamp = new Date().toISOString();

    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, "workload_log.csv");

    await fs.mkdir(dataDir, { recursive: true });

    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, "timestamp,username,rating\n");
    }
    const formattedTimestamp = new Date(timestamp)
      .toLocaleString("en-GB", {
        hour12: false,
      })
      .replace(",", "")
      .replace(/\//g, "-");
    const line = `${formattedTimestamp},${username},${rating}\n`;
    await fs.appendFile(filePath, line, "utf8");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error logging rating:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
