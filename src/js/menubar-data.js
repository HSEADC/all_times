const homeURL = 'http://localhost:8080/'
// const homeURL = 'http://annkomkova.github.io/static-site-09-24/'
// const homeURL = 'http://hseadc.github.io/NOOB/'

const menu = [
  {
    text: 'Статьи',
    url: 'articles.html'
  },
  {
    text: 'Настолки',
    url: 'boardgames.html'
  },
  {
    text: 'Поиск',
    url: 'search.html'
  },
  {
    text: 'Селект',
    url: 'select.html'
  }
]

const props = {
  prerender: true,
  homeURL,
  menu
}

export { props }
