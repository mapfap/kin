const winston = require('winston');

const errorFormatter = winston.format(info => {
    if (info instanceof Error) {
      info.message = '\tRef:' + info.ref + '\n\t' + info.stack.replace(/\n/g, '\n\t')
      delete info.ref
    }
    return info
  })

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(errorFormatter(), winston.format.simple()) , // can be json
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
        logger.info(`[express] ${message.trim()}`);
    }
};