const winston = require('winston')
const colorizer = winston.format.colorize()

const errorFormatter = winston.format(info => {
    if (info instanceof Error) {
      const ref = info.ref ? `\tRef: ${info.ref} \n\t` : ''
      info.message = `${ref}${info.stack.replace(/\n/g, '\n\t')}`
      delete info.ref
    }
    return info
  })

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
    // winston.format.colorize()
    errorFormatter(),
    // winston.format.simple(),
    winston.format.printf(msg => 
      colorizer.colorize(msg.level, `${msg.level}: ${msg.message}`)
    )
    ) , // can be json
    transports: [
        new winston.transports.File({
            level: 'error',
            filename: 'error.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
  });
  
module.exports = logger;
module.exports.morganStream = {
    write: function(message, encoding){
        logger.info(`[express] ${message.trim()}`)
    }
};