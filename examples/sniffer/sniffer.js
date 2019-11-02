const { defaultVersion, protocol, dofus, split } = require('../..')

if (process.argv.length !== 3) {
  console.log('Usage : node sniffer.js <networkInterface>')
  process.exit(1)
}
// If the version correspond to a supported version else use default
const version = defaultVersion

const networkInterface = process.argv[2]

const pcap = require('pcap')

const tcpTracker = new pcap.TCPTracker()

const pcapSession = pcap.createSession(networkInterface, 'ip proto \\tcp')
const ProtoDef = require('protodef').ProtoDef
const FullPacketParser = require('protodef').Parser

const toServer = new ProtoDef(false)
toServer.addProtocol(protocol[version].data, ['toServer'])
toServer.addTypes(dofus)

const toClient = new ProtoDef(false)
toClient.addProtocol(protocol[version].data, ['toClient'])
toClient.addTypes(dofus)
const toClientParser = new FullPacketParser(toClient, 'packet')

split.on('data', data => {
  toClientParser.write(data)
})

toClientParser.on('data', ({ data, buffer }) => {
  try {
    console.info('toClient : ', JSON.stringify(data))
    console.log('raw', 'toClient', buffer)
  } catch (err) {
    console.log(err)
    console.log('raw', 'toClient', buffer)
  }
})

// const IP = '34.251.172.139' // Official dofus retro
const IP = '190.115.26.126' // Amakna server

const PORT = 443
pcapSession.on('packet', function (rawPacket) {
  const packet = pcap.decode.packet(rawPacket)
  if (packet.payload.payload.saddr.addr.join('.') === IP) { // To client
    let data = packet.payload.payload.payload.data
    if (data === null) return
    if ((data[0] === 0x3c && data[1] === 0x3f) || data[0] === 0xc3 || data[0] === 0xd1) { // 3c && 3f is trash ad begin login, c3 trash media priv server?
      console.log('Ignore trash')
      return
    }
    split.write(data)
    tcpTracker.track_packet(packet)
  } else if (packet.payload.payload.daddr.addr.join('.') === IP) { // To server
    let data = packet.payload.payload.payload.data
    try {
      const parsed = toServer.parsePacketBuffer('packet', data).data
      console.info('toServer : ', JSON.stringify(parsed))
    } catch (error) {
      if (data !== null) console.log('raw', data.toString('hex'))
      console.log(error.message)
    }
    tcpTracker.track_packet(packet)
  }
})
tcpTracker.on('session', function (session) {
  console.log('Start of session between ' + session.src_name + ' and ' + session.dst_name)

  session.on('end', function (session) {
    console.log('End of TCP session between ' + session.src_name + ' and ' + session.dst_name)
  })
})
