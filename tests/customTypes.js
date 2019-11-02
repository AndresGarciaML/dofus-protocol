const { dofus } = require('..')
const ProtoDef = require('protodef').ProtoDef
const p = new ProtoDef(false)
p.addTypes(dofus)
// (don"t look at failed params in the dump)
// toClient :  {"name":"ACCOUNT_HOST","params":{"number":"1","servers":[{"serverId":";","sep":"1","state":null,"population":0,"requireSubscription":"1"}]}}
// raw toClient <Buffer 41 48 31 3b 31 3b 31 30 3b 31>

console.log(`ASCII packet ${Buffer.from([0x41, 0x48, 0x31, 0x3b, 0x31, 0x3b, 0x31, 0x30, 0x3b, 0x31]).toString('ascii')}`)

// Parsing serverId
console.log(`parsing serverId ${JSON.stringify(p.types.su8[0](Buffer.from([0x31]), 0))}`)

// Parsing population
console.log(`parsing population ${JSON.stringify(p.types.su16[0](Buffer.from([0x31, 0x30]), 0))}`)

console.log('')

// Parsing the whole packet
console.log(`Parsing the whole packet with split 
${JSON.stringify(p.read(Buffer.from([0x41, 0x48, 0x31, 0x3b, 0x31, 0x3b, 0x31, 0x30, 0x3b, 0x31]),
    2,
    ['split', [
      {
        'name': 'serverId',
        'type': 'su8'
      },
      {
        'name': 'state',
        'type': 'su8'
      },
      {
        'name': 'population',
        'type': 'su16'
      },
      {
        'name': 'requireSubscription',
        'type': 'su8'
      }
    ]], {}))}`)
