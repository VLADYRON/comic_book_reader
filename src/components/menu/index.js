import { h, Component } from 'preact'
import { Link } from 'preact-router/match'
import style from './style'
import Icon from '../../components/icon'

const Item = ({ id, label, icon, href, onClick }) => {
  const action = event => onClick && onClick(event)
  return (
    <Link
      id={id}
      class={style.item}
      activeClassName={style.active}
      href={href}
      onClick={action}
    >
      {icon && <Icon name={icon} />}
      <span class={style.label}>{label}</span>
    </Link>
  )
}

// Internal button
const Button = ({ label, icon, onClick }) => {
  const action = event => onClick && onClick(event)
  return (
    <button class={style.button} title={label} onClick={action}>
      {icon && <Icon name={icon} />}
      <div class={style.line}>{label}</div>
    </button>
  )
}

export default class Menu extends Component {
  state = {
    openSlider: false,
  }

  onBtnFullScreen = () => {
    toggleFullScreen()
  }

  toggleSlider = () => {
    this.setState(prevState => ({ openSlider: !prevState.openSlider }))
  }

  hideSlider = () => {
    // Fast
    this.setState({ openSlider: false })
  }

  closeSlider = () => {
    // Wait
    setTimeout(() => {
      //this.setState({ openSlider: false })
    }, 250)
  }

  render() {
    let { props, state } = this
    return (
      <nav class={style.comic_menu}>
        {/* <Button onClick={this.toggleSlider} icon={'bars'} /> */}
        <Item id={style.appName} label={'CB-Reader'} href={'/'} />
        <div className={style.links}>
          <Item label={'Home'} href={'/'} />
          <Item label={'Docs'} href={'/fix'} />
          <Item label={'API'} href={'/fix'} />
        </div>
        {
          <div
            class={style.overlay}
            style={state.openSlider && { height: '100vh', opacity: 0 }}
            onClick={this.hideSlider}
          />
        }
      </nav>
    )
  }
}