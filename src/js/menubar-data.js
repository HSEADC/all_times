// const homeURL = 'http://localhost:8080/'
const homeURL = 'https://hseadc.github.io/all_times/'
// const homeURL = 'http://annkomkova.github.io/static-site-09-24/'

const menu = [
  {
    text: 'All Times',
    url: 'index.html'
  },
  {
    text: 'Статьи',
    url: 'articles.html'
  },
  {
    text: 'Рефлексия',
    url: 'reflection.html'
  },
  {
    text: 'О нас',
    url: 'aboutUs.html'
  },
]

const props = {
  prerender: true,
  homeURL,
  menu,
}

export { props }

///////////////////////////////