import '../index.css'

import React from 'react'
import { createRoot } from 'react-dom/client'

import S_SearchContent from '../components/S_SearchContent.jsx'


function getSearchRequest() {
    const url = new URL(window.location.href)
    const searchParams = new URLSearchParams(url.search)

    if (searchParams.has('request')) {
        return searchParams.get('request')
    }

}

// const root = createRoot(document.querySelector('.app'))
const root = createRoot(document.querySelector('.W_ReactModule'))
root.render(<S_SearchContent searchInputValue={getSearchRequest()} />)