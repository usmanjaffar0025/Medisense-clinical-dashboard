/** Runs once when the server starts, so the AI key status is in the logs before the demo. */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { checkAiKey } = await import("./lib/ai/engine");
  await checkAiKey();
}
