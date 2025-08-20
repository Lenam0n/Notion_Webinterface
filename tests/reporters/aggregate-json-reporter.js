// tests/reporters/aggregate-json-reporter.js
const fs = require("fs");
const path = require("path");

class AggregateJsonReporter {
  constructor(globalConfig, options) {
    this.options = options || {};
    this.outputFile =
      this.options.outputFile ||
      path.resolve(process.cwd(), "tests/results/test-results.json");
    this.includeConsoleOutput = Boolean(this.options.includeConsoleOutput);
  }

  onRunComplete(_, aggregatedResults) {
    const outPath = this.outputFile;
    const payload = {
      timestamp: new Date().toISOString(),
      success: aggregatedResults.success,
      numTotalTestSuites: aggregatedResults.numTotalTestSuites,
      numPassedTestSuites: aggregatedResults.numPassedTestSuites,
      numFailedTestSuites: aggregatedResults.numFailedTestSuites,
      numTotalTests: aggregatedResults.numTotalTests,
      numPassedTests: aggregatedResults.numPassedTests,
      numFailedTests: aggregatedResults.numFailedTests,
      numPendingTests: aggregatedResults.numPendingTests,
      numTodoTests: aggregatedResults.numTodoTests,
      startTime: aggregatedResults.startTime,
      testResults: aggregatedResults.testResults.map((tr) => ({
        testFilePath: tr.testFilePath,
        status: tr.numFailingTests > 0 ? "failed" : "passed",
        perfStats: tr.perfStats,
        assertionResults: tr.testResults.map((ar) => ({
          fullName: ar.fullName,
          title: ar.title,
          status: ar.status, // passed|failed|pending|todo
          duration: ar.duration,
          ancestorTitles: ar.ancestorTitles,
          failureMessages: ar.failureMessages,
        })),
        console:
          this.includeConsoleOutput && tr.console
            ? tr.console.map((c) => ({
                type: c.type,
                message: c.message,
              }))
            : undefined,
      })),
    };

    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2), "utf8");
    // eslint-disable-next-line no-console
    console.log(`[jest] JSON report written to: ${outPath}`);
  }
}

module.exports = AggregateJsonReporter;
