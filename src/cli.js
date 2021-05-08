require('yargs')
    .command(
        ['parse'],
        'Parse a coverage file and generate a report',
        (yargs) => yargs
            .options({
                input: {
                    type: 'string',
                    alias: 'i',
                    required: true,
                    describe: 'Path to a Chrome coverage report'
                },
                verbosity: {
                    type: 'string',
                    alias: 'v',
                    default: 'warnings',
                    choices: ['debug', 'warnings', 'errors'],
                    describe: 'Set level of verbosity'
                },
                filename: {
                    type: 'string',
                    alias: 'n',
                    describe: 'Filename to replace automatically generated "coverage-report_${timestamp}.html"'
                },
                ['output-dir']: {
                    type: 'string',
                    alias: 'o',
                    default: '.',
                    describe: 'Set output directory'
                },
                ['search-start-in-lines']: {
                    type: 'number',
                    alias: 'ssil',
                    default: 200,
                    number: true,
                    describe: 'In how many lines to search for the start if the sourcemap doesn\'t start with the first line of the source'
                }
            }),
        () => require('./app').parse()
    )
    .demandCommand()
    .help()
    .argv
