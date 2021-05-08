const fs = require('fs')
const path = require('path')
const yargs = require('yargs')
const template = require('../resources/report-template.html.js')

function generateReport(data) {
    const timestamp = new Date().toISOString().replace(/[.:]/g, '-')
    const filePath = path.join(yargs.argv['output-dir'], yargs.argv.filename || `coverage-report_${timestamp}.html`)
    fs.writeFileSync(filePath, template.toString().replace('%TREE_DATA%', JSON.stringify(data)))
    return (fs.statSync(filePath).size / 1048576).toFixed(2)
}

module.exports = { generateReport }
