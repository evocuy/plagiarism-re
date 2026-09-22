/**
 * Formatting and badge helper utilities strictly following design.md
 */

export function getSimilarityColorClass(percentage: number): string {
  if (percentage <= 20) {
    return "text-green-600 font-bold";
  } else if (percentage <= 30) {
    return "text-yellow-600 font-bold";
  } else {
    return "text-red-600 font-bold";
  }
}

export function getStatusBadgeClass(
  status: "selesai" | "lolos" | "proses" | "warning" | "gagal" | "bahaya" | string
): string {
  const normalized = status.toLowerCase();
  if (normalized === "selesai" || normalized === "lolos" || normalized === "disetujui") {
    return "bg-green-100 text-green-800 border border-green-200";
  }
  if (
    normalized === "proses" ||
    normalized === "warning" ||
    normalized === "menunggu review" ||
    normalized === "perlu revisi" ||
    normalized === "revisi"
  ) {
    return "bg-yellow-100 text-yellow-800 border border-yellow-200";
  }
  return "bg-red-100 text-red-800 border border-red-200";
}
