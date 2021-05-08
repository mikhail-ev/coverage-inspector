const yargs = require('yargs')

const VERBOSITY_LEVELS = {
    debug: 'debug',
    warnings: 'warnings',
    errors: 'errors',
}

const VERBOSITY_LEVELS_ORDER = {
    [VERBOSITY_LEVELS.debug]: 3,
    [VERBOSITY_LEVELS.warnings]: 2,
    [VERBOSITY_LEVELS.errors]: 1,
}

const VERBOSITY = yargs.argv.verbosity
const VERBOSITY_LEVEL = VERBOSITY_LEVELS_ORDER[VERBOSITY]

function logInfo(...args) {
    console.log('[INFO]', ...args)
}

function logDebug(...args) {
    if (VERBOSITY_LEVEL < VERBOSITY_LEVELS_ORDER[VERBOSITY_LEVELS.debug]) {
        return;
    }
    console.log('[DEBUG]', ...args)
}

function logWarning(...args) {
    if (VERBOSITY_LEVEL < VERBOSITY_LEVELS_ORDER[VERBOSITY_LEVELS.warnings]) {
        return;
    }
    console.warn('[WARNING]', ...args)
}

function logError(...args) {
    console.error('[ERROR]', ...args)
}

module.exports = {
    logDebug,
    logWarning,
    logError,
    logInfo
};
