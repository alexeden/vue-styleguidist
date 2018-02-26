#!/usr/bin/env node
'use strict';
/* eslint-disable no-console */

// const minimist = require('minimist');
const chalk = require('chalk');
const stringify = require('q-i').stringify;
const logger = require('glogg')('rsg');
const consts = require('../scripts/consts');
const minimist = require('minimist');

const argv = minimist(process.argv.slice(2));

// const argv = minimist(process.argv.slice(2));

module.exports = {
	printAllErrors,
	printAllErrorsAndWarnings,
	printAllWarnings,
	printErrors,
	printErrorWithLink,
	printHelp,
	printInstructions,
	printNoLoaderError,
	printStatus,
	printStyleguidistError,
	verbose,
};

function printHelp() {
	console.log(
		[
			chalk.underline('Usage'),
			'',
			'    ' +
				chalk.bold('styleguidist') +
				' ' +
				chalk.cyan('<command>') +
				' ' +
				chalk.yellow('[<options>]'),
			'',
			chalk.underline('Commands'),
			'',
			'    ' + chalk.cyan('build') + '           Build style guide',
			'    ' + chalk.cyan('server') + '          Run development server',
			'    ' + chalk.cyan('help') + '            Display React Styleguidist help',
			'',
			chalk.underline('Options'),
			'',
			'    ' + chalk.yellow('--config') + '        Config file path',
			'    ' + chalk.yellow('--verbose') + '       Print debug information',
		].join('\n')
	);
}

/**
 * @param {string} localUrlForTerminal
 * @param {string} lanUrlForTerminal
 */
function printInstructions(localUrlForTerminal, lanUrlForTerminal) {
	console.log(`You can now view your style guide in the browser:`);
	console.log();
	console.log(`  ${chalk.bold('Local:')}            ${localUrlForTerminal}`);
	console.log(`  ${chalk.bold('On your network:')}  ${lanUrlForTerminal}`);
	console.log();
}

/**
 * @param {string} message
 * @param {string} linkTitle
 * @param {string} linkUrl
 */
function printErrorWithLink(message, linkTitle, linkUrl) {
	console.error(`${chalk.bold.red(message)}\n\n${linkTitle}\n${chalk.underline(linkUrl)}\n`);
}

/**
 * @param {string} header
 * @param {object} errors
 * @param {object} originalErrors
 * @param {'success'|'error'|'warning'} type
 */
function printErrors(header, errors, originalErrors, type) {
	printStatus(header, type);
	console.error();
	const messages = argv.verbose ? originalErrors : errors;
	messages.forEach(message => {
		console.error(message.message || message);
	});
}

/**
 * @param {string} text
 * @param {'success'|'error'|'warning'} type
 */
function printStatus(text, type) {
	if (type === 'success') {
		console.log(chalk.inverse.bold.green(' DONE ') + ' ' + text);
	} else if (type === 'error') {
		console.error(chalk.reset.inverse.bold.red(' FAIL ') + ' ' + chalk.reset.red(text));
	} else {
		console.error(chalk.reset.inverse.bold.yellow(' WARN ') + ' ' + chalk.reset.yellow(text));
	}
}

/**
 * @param {object} messages
 * @param {object} compilation
 * @return {boolean}
 */
function printAllErrorsAndWarnings(messages, compilation) {
	// If errors exist, only show errors
	if (messages.errors.length) {
		printAllErrors(messages.errors, compilation.errors);
		return true;
	}

	// Show warnings if no errors were found
	if (messages.warnings.length) {
		printAllWarnings(messages.warnings, compilation.warnings);
	}

	return false;
}

/**
 * @param {object} errors
 * @param {object} originalErrors
 */
function printAllErrors(errors, originalErrors) {
	printStyleguidistError(errors);
	printNoLoaderError(errors);
	printErrors('Failed to compile', errors, originalErrors, 'error');
}

/**
 * @param {object} warnings
 * @param {object} originalWarnings
 */
function printAllWarnings(warnings, originalWarnings) {
	printErrors('Compiled with warnings', warnings, originalWarnings, 'warning');
}

/**
 * @param {object} errors
 */
function printStyleguidistError(errors) {
	const styleguidistError = errors.find(message =>
		message.includes('Module build failed: Error: Styleguidist:')
	);
	if (!styleguidistError) {
		return;
	}

	const m = styleguidistError.match(/Styleguidist: (.*?)\n/);
	printErrorWithLink(m[1], 'Learn how to configure your style guide:', consts.DOCS_CONFIG);
	process.exit(1);
}

/**
 * @param {object} errors
 */
function printNoLoaderError(errors) {
	if (argv.verbose) {
		return;
	}

	const noLoaderError = errors.find(message =>
		message.includes('You may need an appropriate loader')
	);
	if (!noLoaderError) {
		return;
	}

	printErrorWithLink(
		noLoaderError,
		'Learn how to add webpack loaders to your style guide:',
		consts.DOCS_WEBPACK
	);
	process.exit(1);
}

/**
 * @param {string} header
 * @param {object} object
 */
function verbose(header, object) {
	logger.debug(chalk.bold(header) + '\n\n' + stringify(object));
}
