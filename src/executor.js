
const fs = require('fs')
const path = require('path')
const logger = require('./logger')
const child_process = require('child_process')


const execSync = (dir, command) => {
 return new Promise((resolve, reject) => {
 	executorName = `[executor] ${dir} [[ $ ${command} ]]`
 	logger.info(executorName)
  child_process.exec(command, { cwd: dir }, (error, stdout, stderr) => {
  	logger.debug(`${executorName}\n>> ${stdout.replace(/\n$/g, '').replace(/\n/g, '\n>> ')}`)
		if (error || stderr) {
			logger.warn(`${executorName}\n** ${stderr.replace(/\n$/g, '').replace(/\n/g, '\n**')}`)
			reject(error)
		}
		resolve(stdout)
  })
 })
}

const prepareWorkspace = async (projectName, ssh) => {
	const dir = path.resolve('workspace')
	if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { mode: '770' })
	}

	const projectFolderName = projectName.replace(/\//g, '_')
	const sourceDir = path.resolve(dir, projectFolderName)
	if (fs.existsSync(sourceDir)) {
		await execSync(sourceDir, 'git pull')
	} else {
		await execSync(dir, `git clone ${ssh} ${projectFolderName}`)
	}

	await execSync(sourceDir, 'chmod +x deploy.sh && ls -l deploy.sh')

	return sourceDir
}

// TODO: Test if this IO-bounded?
// TODO: Properly arrange the log
// TODO: Ensure git pull errors are handled
// TODO: (Feature) accept branching
const deploy = async (projectName, ssh) => {
	try {
		const dir = await prepareWorkspace(projectName, ssh)
		await execSync(dir, './deploy.sh')
		logger.info('[executor] deployment succeeded')
	} catch (err) {
		logger.error(err)
	}
}

deploy('mapfap/hook', 'git')
.then()
.catch(err => {
	throw err
})

module.exports = { deploy }
