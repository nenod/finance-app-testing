import YahooFinance from "yahoo-finance2";

// yahoo-finance2 v3 requires instantiation. Suppress the survey notice it
// otherwise logs on first use. Reused across requests via the module cache.
const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

export default yahooFinance;
