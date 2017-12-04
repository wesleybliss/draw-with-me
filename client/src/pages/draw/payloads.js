
export const MouseDown = (x, y) => JSON.stringify({
    event: 'draw.mouse.down',
    data: {
        x, y
    }
})

export const MouseUp = (x, y) => JSON.stringify({
    event: 'draw.mouse.up',
    data: {
        x, y
    }
})

export const MouseMove = (x, y) => JSON.stringify({
    event: 'draw.mouse.move',
    data: {
        x, y
    }
})
