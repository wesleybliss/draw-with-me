
export const NewMessage = (nickname, message) => JSON.stringify({
    event: 'chat.messages.new',
    data: {
        nickname,
        message
    }
})

export const Ident = nickname => JSON.stringify({
    event: 'chat.user.ident',
    data: {
        nickname
    }
})

export const Roster = () => JSON.stringify({
    event: 'chat.roster'
})
