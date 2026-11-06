/**
 * Server-side log lines for the AI features, prefixed so they are easy to find in the
 * dev server output or the Vercel function logs. Never log note content or the full key.
 */
const PREFIX = "[medisense-ai]";

/* eslint-disable no-console -- this module is the one sanctioned place for server logs */
export const aiLog = {
  info: (message: string) => console.info(`${PREFIX} ${message}`),
  warn: (message: string) => console.warn(`${PREFIX} ${message}`),
  error: (message: string) => console.error(`${PREFIX} ${message}`),
};
/* eslint-enable no-console */
