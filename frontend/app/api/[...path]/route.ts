/**
 * Catch-all proxy ke FastAPI backend.
 *
 * Next.js rewrites tidak mem-forward Cookie header ke upstream,
 * sehingga sesi tidak terkirim dan backend selalu return 401.
 * Route handler ini secara eksplisit meneruskan semua header
 * (termasuk Cookie) dan mengembalikan response asli dari backend,
 * termasuk Set-Cookie agar sesi tersimpan di browser.
 */

import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

async function proxyRequest(req: NextRequest) {
  // Gunakan pathname asli untuk mempertahankan trailing slash (misal /api/documents/)
  const backendUrl = `${BACKEND}${req.nextUrl.pathname}`;

  // Sertakan query string jika ada
  const search = req.nextUrl.search;
  const url = search ? `${backendUrl}${search}` : backendUrl;

  // Forward semua header dari browser (termasuk Cookie)
  const headers = new Headers(req.headers);
  // Hapus header yang tidak perlu diteruskan atau yang menyebabkan error di Node.js fetch
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("expect");

  const init: RequestInit = {
    method: req.method,
    headers,
    // Jangan ikuti redirect — kembalikan apa adanya
    redirect: "manual",
  };

  // Baca body sebagai buffer untuk POST/PUT/PATCH (hindari masalah streaming req.body)
  if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && req.body) {
    init.body = await req.arrayBuffer();
  }

  const backendRes = await fetch(url, init);

  // Salin response headers (termasuk Set-Cookie) ke client
  const resHeaders = new Headers(backendRes.headers);
  // Next.js tidak izinkan kita set header tertentu secara manual; biarkan apa adanya.

  return new NextResponse(backendRes.body, {
    status: backendRes.status,
    statusText: backendRes.statusText,
    headers: resHeaders,
  });
}

export const GET = async (req: NextRequest) => proxyRequest(req);
export const POST = async (req: NextRequest) => proxyRequest(req);
export const PUT = async (req: NextRequest) => proxyRequest(req);
export const PATCH = async (req: NextRequest) => proxyRequest(req);
export const DELETE = async (req: NextRequest) => proxyRequest(req);
