import '../../styles/draw.styl'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import * as appActions from '../../redux/actions/app'
import {
    wsSelector,
    nicknameSelector,
    rosterSelector
} from '../../redux/selectors'
import * as Payloads from './payloads'
import { Roster as RosterPayload } from '../chat/payloads'

const DrawTypes = {
    Down: 0,
    Up: 1,
    Move: 2
}

const mapStateToProps = state => {
    return {
        ws: wsSelector(state),
        nickname: nicknameSelector(state),
        roster: rosterSelector(state)
    }
}

const mapDispatchToProps = dispatch => {
    return {
        actions: {
            ...bindActionCreators(appActions, dispatch)
        }
    }
}

class Draw extends Component {
    
    displayName: 'Draw'
    
    state = {
        canvasMinWidth: 400,
        canvasMinHeight: 600,
        canvas: null,
        ctx: null,
        drawing: false
    }
    
    rosterToList = () =>
        this.props.roster
            .map((entry, index) => pug`
                li.list-group-item(key = index.toString())
                    | ${entry.nickname} 
                    | ${entry.nickname === this.props.nickname
                            ? '*' : ''}
                `)
    
    // bottom, height, left, right, top, width, x, y
    getBounds = () => this.refs.canvas.getBoundingClientRect()
    
    getPadding = el => {
        const cs = window.getComputedStyle(el, null)
        const props = {
            top: cs.getPropertyValue('padding-'),
            bottom: cs.getPropertyValue('padding-bottom'),
            left: cs.getPropertyValue('padding-left'),
            right: cs.getPropertyValue('padding-right')
        }
        Object.keys(props)
            .forEach(k => {
                if (props[k]) props[k] = parseInt(props[k]) })
        return props
    }
    
    resizeCanvas = () => {
        
        const col = this.refs.canvasCol
        const padding = this.getPadding(col)
        
        let w = col.clientWidth - padding.left - padding.right
        let h = col.clientHeight - padding.top - padding.bottom
        
        if (w < this.state.canvasMinWidth) w = this.state.canvasMinWidth
        if (h < this.state.canvasMinHeight) h = this.state.canvasMinHeight
        
        console.info('Resizing canvas to', w, h)
        this.refs.canvas.width = w
        this.refs.canvas.height = h
        
    }
    
    getDrawPoint = e => {
        const bounds = this.getBounds()
        const x = e.clientX - bounds.x
        const y = e.clientY - bounds.y
        return { x, y }
    }
    
    draw = (type, x, y) => {
        const { ctx } = this.state
        switch (type) {
            case DrawTypes.Down:
                ctx.beginPath()
                ctx.moveTo(x, y)
                break
            case DrawTypes.Up:
                ctx.lineTo(x, y)
                ctx.stroke()
                break
            case DrawTypes.Move:
                ctx.closePath()
                break
            default:
                console.error('Invalid draw type')
        }
    }
    
    handleMouseDown = e => {
        if (e.preventDefault) e.preventDefault()
        const { x, y } = this.getDrawPoint(e)
        this.draw(DrawTypes.Down, x, y)
        this.state.drawing = true
        this.props.ws.send(Payloads.MouseDown(x, y))
    }
    
    handleMouseUp = e => {
        if (e.preventDefault) e.preventDefault()
        const { x, y } = this.getDrawPoint(e)
        this.draw(DrawTypes.Up, x, y)
        this.state.drawing = false
        this.props.ws.send(Payloads.MouseUp(x, y))
    }
    
    handleMouseMove = e => {
        // Don't draw unless mouse is down
        if (!this.state.drawing) return
        const { x, y } = this.getDrawPoint(e)
        this.draw(DrawTypes.Move, x, y)
        this.props.ws.send(Payloads.MouseMove(x, y))
    }
    
    handleRemoteDraw = data => {
        const event = data.event.split('.').slice(1).join('.')
        const { x, y } = data.data
        switch (event) {
            case 'mouse.down': return this.draw(DrawTypes.Down, x, y)
            case 'mouse.up': return this.draw(DrawTypes.Up, x, y)
            case 'mouse.move': return this.draw(DrawTypes.Move, x, y)
            default: console.warn('Unknown remote draw event')
        }
    }
    
    componentDidMount() {
        
        const { ws } = this.props
        const ctx = this.refs.canvas.getContext('2d')
        
        this.state.ctx = ctx
        ctx.fillStyle = 'rgb(0, 0, 0)'
        
        const parentOnMessageHandler = ws.onmessage
        ws.onmessage = event => {
            
            parentOnMessageHandler(event)
            
            if (event.data === 'PONG') return
            
            console.info('WS', 'Message:', event.data)
            
            let data = null
            
            try {
                data = JSON.parse(event.data)
            }
            catch (e) {
                console.error(e)
                console.warn('Error adding incoming message to history', data, typeof data)
                // @todo Better error reporting
                return console.error('Error adding incoming message to history', (typeof data, data))
            }
            
            if (data.request && data.request === 'IDENT') return
            
            // @todo Parent should handle this, but prob should check
            // for specific errors as well
            if (data.error) return
            
            if (data.roster)
                return this.props.actions.setRoster(data.roster)
            
            if (data.event && data.event.startsWith('draw.'))
                return this.handleRemoteDraw(data)
            
        }
        
        // Request list of connected users
        console.info('WS', 'Requesting roster', { request: 'roster' })
        ws.send(RosterPayload())
        
        this.resizeCanvas()
        window.addEventListener('resize', this.resizeCanvas, false)
        
    }
    
    render() {
        
        return pug`
            .container
                .row
                    .col
                        h1 Draw
                .row
                    .col-8(ref = "canvasCol")
                        h5
                            | Canvas 
                            ${ this.state.drawing && pug`span: i Drawing` }
                        canvas(
                            ref = "canvas",
                            id = "canvas",
                            width = "100%",
                            height = "100%",
                            onMouseDown = this.handleMouseDown,
                            onMouseUp = this.handleMouseUp,
                            onMouseMove = this.handleMouseMove
                        )
                    .col-4
                        h5 Users In This Session
                        ul.list-group
                            =${ this.rosterToList() }
            
            `
        
    }
    
}

Draw.propTypes = {
    ws: PropTypes.object,
    nickname: PropTypes.string.isRequired,
    roster: PropTypes.array.isRequired
}

export default connect(mapStateToProps, mapDispatchToProps)(Draw)
