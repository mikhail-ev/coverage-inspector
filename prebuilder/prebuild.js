const fs = require('fs')
const path = require('path')
const glob = require('glob')

const exporter = fs.readFileSync(path.join(__dirname, 'exporter.js')).toString()

glob('src/resources/**.*', (err, results) => {
    results.filter((filePath) => !filePath.endsWith('.js')).forEach((filePath) => {
        const file = fs.readFileSync(filePath)
        fs.writeFileSync(filePath + '.js', exporter.replace('%data%', file.toString('base64')))
    })
})
