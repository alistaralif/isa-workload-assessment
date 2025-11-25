import fs from "fs";
import path from "path";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    // Password is stored in Fly.io secrets
    const RESET_KEY = process.env.RESET_KEY;

    if (!RESET_KEY) {
      return Response.json(
        { error: "RESET_KEY not set on server" },
        { status: 500 }
      );
    }

    if (key !== RESET_KEY) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const filePath = "/data/workload_log.csv";

    // Delete old file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Create new file with header
    const header = "timestamp,username,rating\n";
    fs.writeFileSync(filePath, header);

    return Response.json({
      status: "reset complete",
      file: filePath,
    });

  } catch (err) {
    return Response.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
