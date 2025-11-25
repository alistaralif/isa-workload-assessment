import fs from "fs";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const key = url.searchParams.get("key");

    // Require key only if set (optional)
    const DOWNLOAD_KEY = process.env.DOWNLOAD_KEY;

    if (DOWNLOAD_KEY && key !== DOWNLOAD_KEY) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const filePath = "/data/workload_log.csv";

    if (!fs.existsSync(filePath)) {
      return Response.json(
        { error: "Log file not found" },
        { status: 404 }
      );
    }

    const fileContents = fs.readFileSync(filePath);

    return new Response(fileContents, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=workload_log.csv",
      },
    });

  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
