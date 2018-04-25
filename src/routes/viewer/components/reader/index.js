import { h, Component } from 'preact'
import OpenSeaDragon from 'openseadragon'
import style from './style'
import OSDConfig from './osd.config.js'

// Test
const pages = [
  {
    type: 'image',
    url: 'https://bookofbadarguments.com/images/appeal_to_consequences.png',
    buildPyramid: false,
  },
  {
    type: 'image',
    url:
      'https://laughingsquid.com/wp-content/uploads/2013/09/20130916-17283299-2.png',
    buildPyramid: false,
  },
]

export default class Reader extends Component {
  constructor(props) {
    super(props)
    this.viewer = null
    this.state = {
      currentPage: 0,
    }
  }

  getCurrentPage() {
    const { currentPage } = this.state
    return this.viewer.world.getItemAt(currentPage)
  }

  getTargetZoom() {
    const { viewport } = this.viewer
    const page = this.getCurrentPage()
    return page.source.dimensions.x / viewport.getContainerSize().x
  }

  zoomToOriginalSize() {
    const targetZoom = this.getTargetZoom()
    this.viewer.viewport.zoomTo(targetZoom, null, true)
  }

  renderBookModeLayout() {
    let tiledImage, bounds
    const { viewport, world } = this.viewer
    const margin = 16 / viewport.getContainerSize().x
    const pos = new OpenSeaDragon.Point(0, 0)
    const count = world.getItemCount()
    for (let i = 0; i < count; i++) {
      tiledImage = world.getItemAt(i)
      bounds = tiledImage.getBounds()
      tiledImage.setPosition(pos)
      pos.x += bounds.width + margin
    }
    bounds.width = (bounds.width + margin) * 2
    viewport.fitBoundsWithConstraints(bounds, true)
  }

  // helper function to load image using promises
  loadImage = src =>
    new Promise(function(resolve, reject) {
      var img = document.createElement('img')
      img.addEventListener('load', function() {
        resolve(img)
      })
      img.addEventListener('error', function(err) {
        reject(404)
      })
      img.src = src
    })

  initOpenSeaDragon() {
    let { id, source } = this.props

    this.viewer = OpenSeaDragon({
      id: id,
      ...OSDConfig,

      // Cover
      tileSources: pages,
    })

    this.viewer.addHandler('open', () => {
      const { viewport, world } = this.viewer
      const targetZoom = this.getTargetZoom()

      // Set Zoom options
      viewport.maxZoomLevel = targetZoom
      viewport.defaultZoomLevel = targetZoom
      viewport.minZoomLevel = targetZoom / 2

      // Render Book mode
      this.renderBookModeLayout()

      // Center viewer
      //viewport.goHome(true)
    })
  }

  shouldComponentUpdate(nextProps, nextState) {
    return false
  }

  // gets called when this route is navigated to
  componentDidMount() {
    this.initOpenSeaDragon()
  }

  // gets called just before navigating away from the route
  componentWillUnmount() {}

  render() {
    const { id } = this.props
    return <div id={id} className={style.viewer} />
  }
}
