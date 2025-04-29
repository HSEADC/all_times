// import '../index.css'

// import React from 'react'
// import { createRoot } from 'react-dom/client'

// // import A_Title from '../components/A_Title.jsx'
// import A_Title from '../components/M_Card.jsx'

// const app = document.querySelector('.app')
// const root = createRoot(app)
// root.render(<A_Title />)
// //из одного места вынули и вставили в другое

// //передача компонентов туда сюда

import '../index.css'

import React from 'react'
import { createRoot } from 'react-dom/client'

import O_Container from '../components/O_Container.jsx'

const root = createRoot(document.querySelector('.app'))
root.render(<O_Container />)