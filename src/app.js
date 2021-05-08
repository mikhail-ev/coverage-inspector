const {generateReport} = require('./template/generator');
const {Tree} = require('./models/tree')
const {getStartInChunk, getSourceMap, createConsumer} = require('./helpers/sourcemap')
const {generateUnusedRanges, textLastLineAndColumn, lineColumnToPosition} = require('./helpers/position')
const {getCoverageReport} = require('./helpers/coverage')
const {logWarning, logInfo, logDebug} = require('./helpers/logging')

const examUrl = 'https://app.futuresimple.com/dashboards/main';
const appUrl = 'https://static.futuresimple.com';

async function parseSourceMap(tree, rawSourceMapJsonData, coverageItem) {
    const consumer = await createConsumer(rawSourceMapJsonData)

    rawSourceMapJsonData.sources.forEach((sourcePath) => {
        const fixedPath = sourcePath.replace('webpack://sell-frontend/./', 'webpack://sell-frontend/')
        const projectPath = sourcePath.replace('webpack://sell-frontend/./', '')

        let text = ''
        try {
            text = consumer.sourceContentFor(fixedPath)
        } catch (e) {
            logDebug(`Can not find source for ${fixedPath} in sourcemap for ${coverageItem.url}`)
            return;
        }

        const start = getStartInChunk(fixedPath, text, consumer)
        const end = consumer.generatedPositionFor({ source: fixedPath, ...textLastLineAndColumn(text) })

        if (end.line === null) {
            logWarning(`Can not find end of file for ${sourcePath}`)
        }

        const node = tree.getNode(projectPath)
            .setText(encodeURIComponent(text))
            .setPath(encodeURIComponent(projectPath))
            .assignChunk(
                encodeURIComponent(rawSourceMapJsonData.file),
                { ...start, position: lineColumnToPosition(coverageItem.text, start.line, start.column) },
                { ...end, position: lineColumnToPosition(coverageItem.text, end.line, end.column) })

        if (node.info.chunks.length > 1) {
            tree.markDuplicates(projectPath)
        }
    })

    tree.chunks[rawSourceMapJsonData.file] = {
        text: encodeURIComponent(coverageItem.text),
        ranges: generateUnusedRanges(coverageItem)
    }
}

async function parse() {
    const tree = new Tree(appUrl, examUrl);
    const coverage = getCoverageReport();

    for(let i = 0; i < coverage.length; ++i) {
        const sourcemap = await getSourceMap(coverage[i])
        if (sourcemap) {
            await parseSourceMap(tree, sourcemap, coverage[i])
        }
    }

    const fileSize = generateReport(tree)

    logInfo(`Report for ${coverage.length} files ready! Report size: ${fileSize}MB`);
}

module.exports = { parse }
