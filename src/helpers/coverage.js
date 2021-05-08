const fs = require('fs')
const yargs = require('yargs')

function getCoverageReport() {
    const file = fs.readFileSync(yargs.argv.input).toString();
    return JSON.parse(file)
}

module.exports = { getCoverageReport }
