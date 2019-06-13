declare module 'lighthouse'
declare module 'lighthouse/lighthouse-core/report/report-generator'
declare module 'lighthouse/lighthouse-core/lib/file-namer'
declare module 'unzip-crx'

declare module 'simple-format-number' {
  function simplerFormatNumber(value: number, opts: { fractionDigits?: number }): string
  export = simplerFormatNumber
}
