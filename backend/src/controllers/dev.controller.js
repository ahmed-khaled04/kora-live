import { matchPoller } from "../jobs/match-poller.job.js";

export const pollMatches = async (req, res) => {
  await matchPoller();
  res.json({ message: "Poll complete" });
};
