<p align="center">
  <h1 align="center">
    Exthouse
  </h1>
</p>

<p align="center">
  Analyze the impact of a browser extension on web performance.
</p>

<p align="center">
  <img src="https://user-images.githubusercontent.com/158189/59514028-5904e680-8ebc-11e9-9e3f-bb6c9f8b464e.png" width="1202" alt="Screenshot of Grammarly extension performance report generated by Exthouse">
</p>

## Motivation

When measuring real user performance engineers take to the account factors like device and network conditions.
But there is one more factor, that is not in direct control - web extensions. They add additional scripts, DOM manipulations, and impact the user experience.

Exthouse is a tool powered by [Lighthouse](https://github.com/GoogleChrome/lighthouse) that provides a report about web extension impact on web performance.
It measures an extension performance score that helps developers to improve the performance of their extensions and web in general.

**Goals:**

1. Highlight one more performance factor affecting web performance.
2. Identify web extensions that harm web performance.
3. Provide developers with reports they can use to improve performance.
4. Show that desktop users may experience unexpected performance issues related to web extensions.

## Methodology

Exthouse performs several steps to do analysis:

1. Launches a browser without extension to evaluate the default performance and store results `./exthouse/result-default-1.json`
1. Launch a browser with installed extension using Puppeteer and stores results to `./exthouse/MY_EXTENTION-1.json`
1. Extends Lighthouse performance categories with additional audits to estimate the impact of the extension:

   - `exthouse-new-long-tasks` - The value represents a sum of Long Tasks. [Long Tasks](https://developer.mozilla.org/en-US/docs/Web/API/Long_Tasks_API) (weight: 1).
   - `exthouse-max-potential-fid-change` - The change for the longest task duration highlights the impact on potential First Input Delay (weight: 1).
   - `exthouse-extension-files` - Extension files add extra CPU consumption for every URL visit. Bundle resources into one and leverage hot chaching. [Learn more](https://v8.dev/blog/code-caching-for-devs) (weight: 1).
   - `exthouse-default-metrics` - All metrics collected from the default run (without extension) (weight: 0).

1. Generates Lighthouse style report using the [Lighthouse scoring algorithm](https://github.com/GoogleChrome/lighthouse/blob/master/docs/scoring.md#how-are-the-scores-weighted).

Environment conditions:

- Browser: `Chromium`
- Emulated form factor: `desktop`
- CPU slowdown multiplier: `2`
- More settings in [Lighthouse config](/src/utils/measure-chromium.js#L7).

Most of the extensions add tasks to the main thread and affect interactivity metrics:

- Time to Interactive (TTI) - Time to interactive is the amount of time it takes for the page to become fully interactive. [Learn more](https://developers.google.com/web/tools/lighthouse/audits/time-to-interactive).
- First Input Ddelay (FID) - The change for the longest task duration highlights the impact on potential First Input Delay. [Learn more](https://developers.google.com/web/updates/2018/05/first-input-delay).

## Analysis of top 10 extensions from Chrome Web Store

This analysis evaluates the top 10 extensions from [Chrome Web Store]() by users count. Extensions are manually filtered to exclude login requirement, not relevant extensions in categories like PLATFORM_APP, or related to specific URLs like `*://*.google.com/*`.

<img src="https://user-images.githubusercontent.com/6231516/59853553-c6f85480-9379-11e9-9535-227166ceeaed.png" width="60%" alt="Performance impact of top 10 extensions from Chrome Web Store ">

| Name                  | Score | Users Count | FID Δ ( ms ) |
| --------------------- | ----- | ----------- | ------------ |
| Grammarly for Chrome  | 50    | 10M         | 114          |
| Adblock Plus          | 59    | 10M         | 118          |
| Skype                 | 82    | 10M         | 150          |
| Avira Browser Safety  | 94    | 10M         | 60           |
| Avast SafePrice       | 99    | 10M         | 62           |
| AdBlock               | 100   | 10M         | 0            |
| Google Translate      | 100   | 10M         | 0            |
| Pinterest Save Button | 100   | 10M         | 0            |
| Tampermonkey          | 100   | 10M         | 0            |
| uBlock Origin         | 100   | 10M         | 0            |

## Usage

Install CLI using `npm`:

```bash
npm install --global exthouse
```

**`exthouse --help`**

```
Usage: exthouse [path/to/extension.crx] [options]

Options:
  --runs <number>    amount of runs to evaluate median performance value (default: "1")
  --url <url>        url to evaluate extension performance (default: "https://example.com/")
  --format <format>  output format options: [json,html] (default: "html")
  --disableGather    disable gathering and use /exthouse to produce results
  -V, --version      output the version number
  -h, --help         output usage information
```

**CLI usage examples**

```bash
# Evaluate extensions with several runs.
# It performs do 3 runs, get median value and generate a report.
exthouse Grammarly-for-Chrome.crx --runs=3`

# Generate a report based on existing data:
# It reads results from `/exthouse` folder and generate report.
exthouse Grammarly-for-Chrome.crx --disableGather

# Output report in json format
exthouse Grammarly-for-Chrome.crx --format=json`
```

**Evaluate any extension**

1. Download extension using https://chrome-extension-downloader.com/
2. Copy path to the `MY_EXTENTION.crx` and pass to cli `exthouse MY_EXTENTION.crx --runs=3`
3. The process takes a few minutes and results are stored in the [Lighthouse](https://github.com/GoogleChrome/lighthouse) report.
4. All debug data is stored in `exthouse` folder.

Find downloaded examples [extensions](/extensions) folder.

## Future Work

- [ ] add support for login script to test extensions required authentication ([#22](https://github.com/treosh/exthouse/issues/22))
- [ ] perform extensions analysis required authentication and compare score w/o authentication. [#25](https://github.com/treosh/exthouse/issues/25)
- [ ] experiment with cache (try: warm, hot) to see how scripts are effected by v8 caching. [More about cache](https://v8.dev/blog/code-caching-for-devs).
- [ ] experiment with results, running in Chrome and Edge. Add flag `browserBinaryPath`
- [ ] expose node.js API ([#24](https://github.com/treosh/exthouse/issues/24))
- [ ] experiment with Firefox add-ons (all related work is in the branch [firefox-experimental](https://github.com/treosh/exthouse/tree/firefox-experimental)).
- [ ] make repo smaller using [bfg-repo-cleaner](https://github.com/rtyley/bfg-repo-cleaner).

## Credits

[This tweet](https://twitter.com/denar90_/status/1065712688037277696) has kick-started the initial research and this project.

Development is sponsored by [Treo.sh - Page speed monitoring made easy](https://treo.sh).

[![](https://travis-ci.org/treosh/exthouse.png)](https://travis-ci.org/treosh/exthouse)
[![](https://img.shields.io/npm/v/exthouse.svg)](https://npmjs.org/package/exthouse)
[![](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
