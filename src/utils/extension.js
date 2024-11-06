const { startCase, toLower } = require('lodash')
const unzipCrx = require('unzip-crx')
const { join, basename, isAbsolute } = require('path')
const { defaultName, tmpDir } = require('../config')

/**
 * @typedef {Object} Extension
 * @property {string} name
 * @property {string} [source]
 * @property {string} [path]
 */

/**
 * @param {string[]} extSource
 * @return {Promise<Extension[]>}
 */

exports.getExtensions = async extSource => {
  const files = extSource.filter(file => file.endsWith('.zip'))
  if (!files.length) throw new Error('no extensions found')
  const extList = files.map(file => {
    return {
      source: isAbsolute(file) ? file : (process.cwd(), file),
      path: join(tmpDir, basename(file)),
      name: basename(file).replace('.zip', '')
    }
  })
  await unzipExtensions(extList)
  return [exports.getDefaultExt()].concat(extList)
}

/**
 * Get well-formatted `ext` name.
 *
 * @param {Extension} ext
 * @return {string}
 */

exports.getExtName = ext => {
  const match = ext.name.match(/_v/)
  if (!match) return ext.name
  return startCase(ext.name.substr(0, match.index))
}

/**
 * Check if `ext` is default.
 *
 * @param {Extension} ext
 * @return {Boolean}
 */

exports.isDefaultExt = ext => {
  return ext.name === defaultName
}

/**
 * Get default extension.
 *
 * @return {Extension}
 */

exports.getDefaultExt = () => {
  return {
    name: defaultName
  }
}

/**
 *
 * @param {string} fileName
 * @return {string}
 */

exports.normalizeExtName = fileName => {
  let name = basename(fileName).replace('.zip', '')
  // @fixme better regexp to catch name like unlimited-free-vpn---hola.crx
  name = name.replace(/---/, '-')
  name = name.replace(/_v.*/, '')
  name = name.replace(/_/, '')
  name = toLower(name)
  return name
}

/**
 * @param {Extension[]} extList
 * @return {Promise}
 */

function unzipExtensions(extList) {
  return Promise.all(extList.map(ext => unzipCrx(ext.source, ext.path)))
}
