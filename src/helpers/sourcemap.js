const https = require('https');
const axios = require('axios');
const parseDataURL = require('data-urls');
const yargs = require('yargs')
const {logWarning, logError} = require('./logging')
const mappings = require('../resources/mappings.wasm.js')

function getStartInChunk(fixedPath, sourceText, consumer) {
    const limit = +yargs.argv['search-start-in-lines']

    if (isNaN(limit)) {
        throw 'Wrong value provided for --ssil argument'
    }

    let line = 1
    let start
    do {
        start = consumer.generatedPositionFor({ source: fixedPath, line: line++, column: 0 })
    } while (start.line === null && line < limit)
    if (line === limit) {
        logWarning(`Could not find start in first ${limit} lines for ${fixedPath}`)
    }
    return start
}

async function getSourceMap(coverageItem) {
    const keyword = '//# sourceMappingURL'

    const sourceMapCommentPosition = coverageItem.text.indexOf(keyword)

    if (sourceMapCommentPosition === -1) {
        logWarning(`Can not find the sourceMappingURL for ${coverageItem.url}`)
        return;
    }

    const lastSourceMapCommentPosition = coverageItem.text.lastIndexOf(keyword)

    if (sourceMapCommentPosition !== lastSourceMapCommentPosition) {
        logWarning(`Several sourceMappingURL in ${coverageItem.url}. Using the last one.`)
    }

    const sourcemapUrlContents = coverageItem.text.slice(lastSourceMapCommentPosition + keyword.length + 1)

    if (sourcemapUrlContents.startsWith('data:')) {
        const sourcemap = parseDataURL(sourcemapUrlContents)
        const mimeType = sourcemap.mimeType.toString()
        if (mimeType === 'application/json') {
            logError(`Sourcemap for file ${coverageItem.url} has unsupported mimetype ${mimeType}`)
            return;
        }
        try {
            return JSON.parse(sourcemap.body.toString())
        }
        catch (e) {
            logError(`Can not parse sourcemap for file ${coverageItem.url}`)
            return;
        }
    } else {
        const parts = coverageItem.url.split('/')
        const url = [...parts.slice(0, parts.length - 1), sourcemapUrlContents].join('/')
        return fetchSourceMap(url).then((result) => result.data, (error) => {
            logWarning(`Can not fetch sourcemap for ${coverageItem.url} from ${url}`);
        })
    }
}

async function createConsumer(rawSourceMapJsonData) {
    global.fetch = async () => ({ arrayBuffer: () => mappings.buffer });
    const sourceMap = require('source-map');
    sourceMap.SourceMapConsumer.initialize({ 'lib/mappings.wasm': '' })
    const consumer = await new sourceMap.SourceMapConsumer(rawSourceMapJsonData)
    global.fetch = void 0;
    return consumer;
}

async function fetchSourceMap(fileUrl) {
    return axios.get(fileUrl, {
        httpsAgent: new https.Agent({
            rejectUnauthorized: false
        })
    })
}

module.exports = {getStartInChunk, getSourceMap, createConsumer}
