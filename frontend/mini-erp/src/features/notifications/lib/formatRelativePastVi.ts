/** Thời điểm trong quá khứ, hiển thị tiếng Việt ngắn — dùng chuông thông báo. */
export function formatRelativePastVi(isoUtc: string): string {
  const t = Date.parse(isoUtc)
  if (!Number.isFinite(t)) return ""
  let sec = Math.floor((Date.now() - t) / 1000)
  if (sec < 0) sec = 0
  if (sec < 60) return "Vừa xong"
  const mins = Math.floor(sec / 60)
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  if (days < 14) return `${days} ngày trước`
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(t))
}
