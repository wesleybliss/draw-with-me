import '../../styles/draw.styl'

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
/*import DrawOnline from './draw-online'
import DrawOffline from './draw-offline'*/

const mapStateToProps = (state/*, ownProps*/) => {
    return {
    }
}

const mapDispatchToProps = dispatch => {
    return {
        actions: {
        }
    }
}

class Draw extends Component {
    
    displayName: 'Draw'
    
    state = {
        canvas: null,
        ctx: null,
        drawing: false
    }
    
    // bottom, height, left, right, top, width, x, y
    getBounds = () => this.refs.canvas.getBoundingClientRect()
    
    getDrawPoint = e => {
        const bounds = this.getBounds()
        const x = e.clientX - bounds.x
        const y = e.clientY - bounds.y
        return { x, y }
    }
    
    handleMouseDown = e => {
        e.preventDefault()
        const { x, y } = this.getDrawPoint(e)
        this.state.ctx.moveTo(x, y)
        this.state.drawing = true
    }
    
    handleMouseUp = e => {
        e.preventDefault()
        this.state.drawing = false
    }
    
    handleMouseMove = e => {
        
        // Don't draw unless mouse is down
        if (!this.state.drawing) return
        
        const { ctx } = this.state
        const { x, y } = this.getDrawPoint(e)
        
        ctx.lineTo(x, y)
        ctx.stroke()
        
    }
    
    componentDidMount() {
        
        // this.state.canvas = document.querySelector('#canvas')
        const ctx = this.refs.canvas.getContext('2d')
        this.state.ctx = ctx
        
        ctx.fillStyle = 'rgb(0, 0, 0)'
        
        console.log('this.refs.canvas.offsetTop', this.refs.canvas.offsetTop)
        
    }
    
    render() {
        
        return pug`
            .row
                .col
                    h1 Draw
            .row
                .col
                    canvas(
                        ref = "canvas",
                        id = "canvas",
                        width = "800",
                        height = "600",
                        onMouseDown = this.handleMouseDown,
                        onMouseUp = this.handleMouseUp,
                        onMouseMove = this.handleMouseMove
                    )
            
            `
        
    }
    
}

Draw.propTypes = {
}

export default connect(mapStateToProps, mapDispatchToProps)(Draw)
