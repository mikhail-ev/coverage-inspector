function generateUnusedRanges(file) {
    const ranges = []
    let lastRangeEnd = 0;
    file.ranges.forEach((range) => {
        if (lastRangeEnd < range.start) {
            ranges.push({ start: lastRangeEnd, end: range.start, used: false })
        }
        ranges.push({
            start: range.start,
            end: range.end,
            used: true
        })
        lastRangeEnd = range.end
    })
    if (file.text.length > lastRangeEnd) {
        ranges.push({
            start: lastRangeEnd,
            end: file.text.length,
            used: false
        })
    }
    return ranges;
}

function textLastLineAndColumn(text) {
    const split = text.split('\n')
    const line = text.split('\n').length
    const column = split[split.length - 1].length
    return { line, column }
}

function lineColumnToPosition(text, line, column) {
    const lines = text.split('\n')
    const linesBefore = lines.slice(0, line - 1);
    return linesBefore.join('\n').length + column
}

module.exports = {
    lineColumnToPosition,
    textLastLineAndColumn,
    generateUnusedRanges
}
