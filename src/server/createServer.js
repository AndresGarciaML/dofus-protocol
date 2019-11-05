const Server = require('./server')

// Connect to battlenet
async function createServer (host, port, externalHost, version) {
  return new Promise((resolve, reject) => {
    const server = new Server(version)
    server.listen(host, port, version).then(() => resolve(server))
  })
}

module.exports = createServer
