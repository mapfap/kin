const express = require('express')
const http = require('http')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const crypto = require('crypto');

const logger = require('./logger')
const executor = require('./executor')

const app = express()

const PORT = process.env.PORT || 9999;
const PIPELINE_SECRET = process.env.PIPELINE_SECRET || '1234';

app.use(morgan('dev', { stream: logger.morganStream }))

app.disable('etag')
app.use(helmet())
app.use(express.json())

app.get('/', (req, res) => res.json({ up: true, version: 0 }))

app.post('/github', (req, res, next) => {
  const signature = req.header('X-Hub-Signature')
  if (!signature) {
    return res.status(401).json('Who are you?!')
  }

  const hmac = crypto.createHmac('sha1', PIPELINE_SECRET);
  hmac.update(Buffer.from(JSON.stringify(req.body), 'utf8'), 'utf-8');
  expectedSignature = 'sha1=' + hmac.digest('hex');
  if (signature !== expectedSignature) {
    return res.status(403).json('You shall not pass!')
  }

  const event = {
    repo: req.body.repository.full_name,
    branch: req.body.ref.split('/').pop(),
    ssh: req.body.repository.ssh_url,
    by: req.body.sender.login,
    commit: req.body.head_commit.id.substring(0, 7),
    message: req.body.head_commit.message.split('\n')[0]
  }

  logger.info(`[github] ${event.by} pushed ${event.repo}@${event.branch} [${event.commit}] ${event.message}`)
  if (event.branch == 'master') {
    logger.info(`[github] syncing master branch from ${event.repo}`)
    
    // TODO: validate input before executing it
    executor.deploy(event.repo, event.ssh)
  }
  
  res.json({ up: true, version: 0 })
})

app.use((req, res, next) => {
  res.status(404).json('Not found!')
})

app.use(function (err, req, res, next) {
  logger.error(err)
  res.status(500).json('Something broke!')
})

const server = http.createServer(app)

server.listen(PORT, () => {
  const address = server.address()
  logger.info(`Listening on ${address.address}${address.port}`)
})