import React, { Component } from 'react';
import './App.css';
import Hammer from 'hammerjs'

import { SketchPicker } from 'react-color'
import reactCSS from 'reactcss'
import tinycolor from 'tinycolor2'


const colorSet = [
  {
    backgroundColor: "#F8F8F8",
    darkStripColor: '#111111',
    lightStripColor: "#F5F5F5",
  },{
    backgroundColor: "#FFF125",
    darkStripColor: "#111111",
    lightStripColor: "#F5F5F5"
  },{
    backgroundColor: "#222222",
    darkStripColor: '#111111',
    lightStripColor: "#F5F5F5",
  },
  {
    backgroundColor: '#E22828',
    darkStripColor: '#111111',
    lightStripColor: '#FCE0E0',
  }
][Math.floor(Math.random() * 4)]

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      displayColorPickers: true,
      backgroundColor: colorSet.backgroundColor,
      darkStripColor: colorSet.darkStripColor,
      lightStripColor: colorSet.lightStripColor,
      blueColor: 'rgb(2, 106, 171)',
      yellowColor: 'rgb(218,211,1)',
      whiteColor: 'rgb(243, 224, 218)',
      blackColor: 'rgb(29, 47, 47)',
      redColor: 'rgb(214, 86, 52)',
      greenColor: 'rgb(0, 145, 80)',
      shapes: 100,
      maxSize: 15,
      minSize: 5,
      padding: 65,
      running: false
    }
  }

  componentWillMount () {
    this.updateDimensions()
  }

  updateDimensions () {
    const w = window,
        d = document,
        documentElement = d.documentElement,
        body = d.getElementsByTagName('body')[0]
    
    const width = w.innerWidth || documentElement.clientWidth || body.clientWidth,
        height = w.innerHeight|| documentElement.clientHeight|| body.clientHeight

    //const dim = Math.min(width, height)
    const settings = { width: width, height: height }

    if (width < 500) {
      settings.height = width
      settings.padding = 0
    } else {
      settings.padding = 65
    }

    this.setState(settings)
  }

  componentWillUnmount () {
    window.removeEventListener("resize", this.updateDimensions.bind(this), true)
    window.removeEventListener('keydown', this.handleKeydown.bind(this), true)
    window.clearInterval(this.interval)
  }

  componentDidMount () {
    window.addEventListener("resize", this.updateDimensions.bind(this), true)
    window.addEventListener('keydown', this.handleKeydown.bind(this), true)
    this.interval = window.setInterval(this.tick.bind(this), 400)

    const mc = new Hammer(document, { preventDefault: true })

    mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
    mc.get('pinch').set({ enable: true })

    
     mc.on("swipedown", ev => this.decrementShapes())
      .on("swipeup", ev => this.incrementShapes())
      .on("swipeleft", ev => this.decrementSize())
      .on("swiperight", ev => this.incrementSize())
      .on("pinchin", ev => { this.decrementSize(); } )
      .on("pinchout", ev => { this.incrementSize(); })
  }

  handleKeydown (ev) {
    if (ev.which === 67 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.setState({displayColorPickers: !this.state.displayColorPickers})
    } else if (ev.which === 83 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.handleSave()
    } else if (ev.which === 82 && !(ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      this.forceUpdate()
    } else if (ev.which === 84) {
      ev.preventDefault()
      this.toggleRun()
    } else if (ev.which === 40 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      //this.decrementStrokeWidth()
    } else if (ev.which === 40) {
      ev.preventDefault()
      this.decrementShapes()
    } else if (ev.which === 38 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      //this.incrementStrokeWidth()
    } else if (ev.which === 38) {
      ev.preventDefault()
      this.incrementShapes()
    } else if (ev.which === 37 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      //this.decrementTreeWidth()
    } else if (ev.which === 37) {
      ev.preventDefault()
      this.decrementSize()
    } else if (ev.which === 39 && (ev.metaKey || ev.ctrlKey)) {
      ev.preventDefault()
      //this.incrementTreeWidth()
    } else if (ev.which === 39) {
      ev.preventDefault()
      this.incrementSize()
    }
  }

  incrementShapes () {
    this.setState({shapes: Math.min(120, this.state.shapes + 2)})
  }

  decrementShapes () {
    this.setState({shapes: Math.max(2, this.state.shapes - 2)})
  }

  incrementSize () {
    this.setState({maxSize: Math.min(25, this.state.maxSize + 1)})
  }

  decrementSize () {
    this.setState({maxSize: Math.max(15, this.state.maxSize - 1)})
  }

  handleSave () {
    const svgData = document.getElementsByTagName('svg')[0].outerHTML   
    const link = document.createElement('a')
    
    var svgBlob = new Blob([svgData], { type:"image/svg+xml;charset=utf-8" })
    var svgURL = URL.createObjectURL(svgBlob)
    link.href = svgURL 

    link.setAttribute('download', `breakfast.svg`)
    link.click()
  }

  between (min, max) {
    return Math.floor(Math.random()*(max-min+1)+min);
  }

  getActualHeight () {
    return this.state.height-2*this.state.padding
  }

  getActualWidth () {
    return this.state.width-2*this.state.padding
  }

  toggleRun() {
    this.setState({running: !this.state.running})
  }

  tick () {
    if (this.state.running) {
      this.forceUpdate()
    }
  }

  shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
  }

  generateGriddles () {
    const griddles = []

    for (let i=0; i < this.state.shapes; i++) {
      griddles.push(this.generateGriddle(i))
    }

    return griddles
  }

  generateGriddle (key) {
    const minDimension = Math.min(this.getActualHeight(), this.getActualWidth())
    const griddleDimension = this.between(this.state.minSize, this.state.maxSize) * minDimension/100
    const isLightBackground = Math.random() > 0.4

    const x = this.between(-griddleDimension, this.getActualWidth())
    const y = this.between(-griddleDimension, this.getActualHeight())

    const bgColor = isLightBackground ? this.state.lightStripColor: this.state.darkStripColor
    const stripeColor = isLightBackground ? this.state.darkStripColor : this.state.lightStripColor

    const numberofSections = this.between(3,6) * 2

    const split = this.between(10, 50)/100

    const sectionWidth = griddleDimension/numberofSections

    const griddleLines = []


    for (let i = 0; i < numberofSections; i++) {
      griddleLines.push(<rect key={i} x={x} y={y+i*sectionWidth} width={griddleDimension} height={sectionWidth*split} fill={stripeColor} />)
    }


    return (
      <g key={key} filter="url(#f4)">
      <g transform={`rotate(${this.between(0, 360)} ${x+griddleDimension/2} ${y + griddleDimension/2})`}>
        <rect x={x} y={y}
                  width={griddleDimension} height={griddleDimension} fill={bgColor} />
        {griddleLines}
      </g>
      </g>
    )
  }

  generateEggs () {
    const eggs = []

    for (let i=0; i < this.state.shapes/4; i++) {
      eggs.push(this.generateEgg(i))
    }

    return eggs
  }

  generateEgg (key) {
    const minDimension = Math.min(this.getActualHeight(), this.getActualWidth())
    const eggDimension = this.between(this.state.minSize*0.75, this.state.maxSize*0.75) * minDimension/100

    const x = this.between(0, this.getActualWidth())
    const y = this.between(0, this.getActualHeight())

    return (
      <g key={key} filter="url(#f4)">
        <circle cx={x} cy={y} r={eggDimension/2} fill={
          [this.state.greenColor, this.state.blueColor, this.state.yellowColor, this.state.redColor, this.state.whiteColor, this.state.blackColor][Math.floor(Math.random() * 6)]
        } />
      </g>
    )
  }

  render() {

    const actualHeight = this.getActualHeight()
    const actualWidth = this.getActualWidth()

    return (
      <div className="App">
       { this.state.displayColorPickers ? <div className="color-pickers">
          <ColorPicker color={tinycolor(this.state.backgroundColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({backgroundColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.darkStripColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({darkStripColor: color.hex}) } />
          <ColorPicker color={tinycolor(this.state.lightStripColor).toRgb()} disableAlpha={true}
            handleChange={ (color) => this.setState({lightStripColor: color.hex}) } />
          <div className='no-mobile'>
            <ColorPicker color={tinycolor(this.state.yellowColor).toRgb()} disableAlpha={true}
              handleChange={ (color) => this.setState({yellowColor: color.hex}) } />
            <ColorPicker color={tinycolor(this.state.greenColor).toRgb()} disableAlpha={true}
              handleChange={ (color) => this.setState({greenColor: color.hex}) } />
            <ColorPicker color={tinycolor(this.state.blueColor).toRgb()} disableAlpha={true}
              handleChange={ (color) => this.setState({blueColor: color.hex}) } />
            <ColorPicker color={tinycolor(this.state.redColor).toRgb()} disableAlpha={true}
              handleChange={ (color) => this.setState({redColor: color.hex}) } />
            <ColorPicker color={tinycolor(this.state.whiteColor).toRgb()} disableAlpha={true}
              handleChange={ (color) => this.setState({whiteColor: color.hex}) } />
            <ColorPicker color={tinycolor(this.state.blackColor).toRgb()} disableAlpha={true}
              handleChange={ (color) => this.setState({blackColor: color.hex}) } />
          </div>
            </div> : null
        }

        <div style={{ padding: this.state.padding }}> 
          <svg width={actualWidth} height={actualHeight}>
            <defs>
              <clipPath id={"clip"}>
                <rect x={0} y={0} width={"100%"} height={"100%"} />
              </clipPath>
              <filter id="f4" height="130%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="3"/> 
                <feOffset dx="2" dy="2" result="offsetblur"/>
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.4"/>
                </feComponentTransfer>
                <feMerge> 
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic"/> 
                </feMerge>
              </filter>
            </defs>
            <g clipPath={`url(#clip)`}>
              <rect width={"100%"} height={"100%"} fill={this.state.backgroundColor} />
              <g>
                {this.generateGriddles()}
              </g>
              <g>
                {this.generateEggs()}
              </g>
            </g>
          </svg>
        </div>
      </div>
    );
  }
}

class ColorPicker extends React.Component {

  constructor (props) {
    super(props)

    this.state = {
      color: props.color,
      displayColorPicker: props.displayColorPicker,
      disableAlpha: props.disableAlpha
    }
  }

  handleClick = () => {
    this.setState({ displayColorPicker: !this.state.displayColorPicker })
  };

  handleClose = () => {
    this.setState({ displayColorPicker: false })
    if (this.props.handleClose) {
      this.props.handleClose()
    }
  };

  handleChange = (color) => {
    this.setState({ color: color.rgb })
    this.props.handleChange(color)
  };

  render () {

    const styles = reactCSS({
      'default': {
        color: {
          background: this.state.disableAlpha ?
                `rgb(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b })` :
                `rgba(${ this.state.color.r }, ${ this.state.color.g }, ${ this.state.color.b },  ${ this.state.color.a })`,
        },
        popover: {
          position: 'absolute',
          zIndex: '10',
        },
        cover: {
          position: 'fixed',
          top: '0px',
          right: '0px',
          bottom: '0px',
          left: '0px',
        },
      },
    })

    return (
      <div className='color-picker'>
        <div className='swatch' onClick={ this.handleClick }>
          <div className='color' style={ styles.color } />
        </div>
        { this.state.displayColorPicker ? <div style={ styles.popover }>
          <div style={ styles.cover } onClick={ this.handleClose }/>
          <SketchPicker color={ this.state.color } onChange={ this.handleChange } disableAlpha={this.state.disableAlpha} />
        </div> : null }
      </div>
    )
  }
}

export default App;
