
const fs = require('fs')
const path = require('path')
const bufferedSpawn = require('buffered-spawn')
const logger = require('./logger')

const prepareWorkspace = async (projectName, ssh) => {
	const workspacePath = path.resolve('workspace')
	if (!fs.existsSync(workspacePath)){
    fs.mkdirSync(workspacePath, { mode: '770' })
	}

	const projectFolderName = projectName.replace(/\//g, '_')
	const sourcePath = path.resolve(workspacePath, projectFolderName)
	logger.info(`[executor] sourcePath: ${sourcePath}`)
	if (fs.existsSync(sourcePath)) {
		return await exec(sourcePath, 'git pull') ? sourcePath : false
	} else {
		return await exec(workspacePath, `git clone ${ssh} ${projectFolderName}`) ? sourcePath : false
	}
}

const exec = async (path, command) => {
	const args = command.split(' ')
	try {
		const output = await bufferedSpawn(args[0], args.slice(1), { cwd: path })
	  logSpawnOutput(command, output)
	  return output.stderr.length == 0
	} catch (output) {
		logSpawnOutput(command, output)
		return false
	}
}

const deploy = async (projectName, ssh) => {
	// TODO: Design better code flow
	const path = await prepareWorkspace(projectName, ssh)
	if (path) {
		if (await exec(path, 'chmod +x deploy.sh')) {
			if (await exec(path, './deploy.sh')) {
				logger.info('[executor] deployment succeeded')
			}
		}
	}
}

const logSpawnOutput = (command, output) => {
	logger.info(`[executor] [[ $ ${command} ]]`)
	if (output.stdout) logger.info('\n>> ' + output.stdout.replace(/\n$/g, '').replace(/\n/g, '\n>> '))
  if (output.stderr) logger.error('\n** ' + output.stderr.replace(/\n$/g, '').replace(/\n/g, '\n**'))
}

// deploy("mapfap/hook", "git")
// exec('/Users/mapfap/dev/kin/workspace/mapfap_hook', './deploy.sh')

module.exports = { deploy }
