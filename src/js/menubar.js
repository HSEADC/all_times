import { props } from './menubar-data.js'

const React = require('react')
const ReactDOMServer = require('react-dom/server')

const S_MenuBar = require('../components/S_MenuBar.jsx').default

const menubar = ReactDOMServer.renderToString(
  React.createElement(S_MenuBar, props)
)

export { menubar }
