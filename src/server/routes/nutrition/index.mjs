import catalogRoute from "./catalog.mjs";
import logRoute from "./log.mjs";
import journalRoute from "./journal.mjs";
import composeRoute from "./compose.mjs";
import dailyRoute from "./daily.mjs";
import weeklyRoute from "./weekly.mjs";
import estimateRoute from "./estimate.mjs";
import aiLogRoute from "./ai-log.mjs";

export default async function nutritionRoute(app) {
  app.register(catalogRoute);
  app.register(logRoute);
  app.register(journalRoute);
  app.register(composeRoute);
  app.register(dailyRoute);
  app.register(weeklyRoute);
  app.register(estimateRoute);
  app.register(aiLogRoute);
}
