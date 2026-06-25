import { startServer } from "./src/server/app.mjs";

startServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
