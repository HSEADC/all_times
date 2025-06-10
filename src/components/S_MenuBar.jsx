import React, { useState, useEffect } from 'react'
import { getPostTeasers } from '../js/search-data.js'
import A_MainMenu from './A_MainMenu.jsx'
import O_SearchBar from './O_SearchBar.jsx'

export default function S_MenuBar({
  searchInputValue: initialSearchValue,
  prerender,
  menu,
  homeURL
}) {
  const currentURL = !prerender ? window.location.href : ''

  const menuElements = menu.map(({ text, url }, i) => {
    const linkURL = homeURL + url // уникальный адрес для каждой страницы, например http://localhost:8080/articles.html
    return (
      <A_MainMenu
        key={i}
        current={linkURL === currentURL}
        text={text}
        url={linkURL}
        type="mainMenuItem"
      />
    )
  })

  return (
    <>
      <A_MainMenu current={false} text="" url={homeURL} type="mainMenuLogo" />
      <div className="C_MainMenu">{menuElements}</div>
    </>
  )
}
