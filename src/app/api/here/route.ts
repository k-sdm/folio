import { DEFAULT_LAT } from "@/lib/vase-gradient";

// Read the visitor's approximate latitude from Vercel's IP-geo header.
// Runs per request (never prerendered); falls back to DEFAULT_LAT off-Vercel.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const lat =
    parseFloat(request.headers.get("x-vercel-ip-latitude") ?? "") || DEFAULT_LAT;
  return Response.json({ lat });
}
