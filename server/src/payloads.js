
module.exports.NoIdent = () => JSON.stringify({
    error: 'NOIDENT',
    message: 'You must identify yourself'
})

module.exports.Roster = users => JSON.stringify({
    roster: users
})

// @todo Could move errors to their own file

module.exports.UnsupportedChatEvent = event => JSON.stringify({
    error: `Unsupported chat event ${event}`
})

module.exports.MalformedPayload = () => JSON.stringify({
    error: 'Malformed payload - could not parse'
})

module.exports.MalformedMissingEvent = () => JSON.stringify({
    error: 'Malformed payload - must have "event" key'
})

module.exports.UnsupportedEvent = (type, event) => JSON.stringify({
    error: `Unsupported event ${type} ${event}`
})
