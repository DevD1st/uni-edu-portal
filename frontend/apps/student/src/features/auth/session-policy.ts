export function studentReturnTo(value: unknown) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    /[\\\r\n]/.test(value)
  )
    return "/overview";
  const url = new URL(value, "https://portal.invalid");
  // A client navigation's internal flight key is not part of the student's destination.
  url.searchParams.delete("_rsc");
  return /^\/(overview|account|registration|results)(\/|$)/.test(url.pathname)
    ? url.pathname + url.search
    : "/overview";
}
