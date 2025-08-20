const fs = require("fs");
const path = require("path");

class AggregateJsonReporter {
  constructor(globalConfig, options) {
    this._globalConfig = globalConfig;
    this._options = options || {};
    this._results = [];
  }

  onTestResult(test, testResult) {
    this._results.push(testResult);
  }

  onRunComplete() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

    // rootDir von Jest holen
    const rootDir = this._globalConfig.rootDir;

    // Ergebnis-Ordner absolut auflösen
    const resultsDir = path.resolve(rootDir, "tests", "results");
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true });
    }

    // Dateiname mit Timestamp
    const outputFile = path.join(resultsDir, `test-results-${timestamp}.json`);

    // JSON schreiben
    fs.writeFileSync(
      outputFile,
      JSON.stringify({ timestamp, results: this._results }, null, 2)
    );

    console.log(`✔ Test results saved to ${outputFile}`);
  }
}

module.exports = AggregateJsonReporter;
