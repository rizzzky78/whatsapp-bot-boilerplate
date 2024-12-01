export function error(e: Error | any) {
  console.error(e);
  return e instanceof Error ? e.message : "error is undefined";
}
