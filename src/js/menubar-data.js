const paths = [
  '/all_times/', //indx.html
  '/all_times/aboutUs.html',
  '/all_times/articls.html',
  '/all_times/reflection.html',
  '/all_times/sarch.html',
  '/all_times/select.html',
  '/all_times/ract-basics.html',
  '/all_times/manifests/crujok.html',
  '/all_times/manifests/dadaism.html',
  '/all_times/manifests/dogma.html',
  '/all_times/manifests/fluxus.html',
  '/all_times/manifests/GB.html',
  '/all_times/manifests/LightFormMoveSound.html',
  '/all_times/manifests/luchi.html',
  '/all_times/manifests/oppoyaz.html',
  '/all_times/manifests/surral.html',
]

//тут главная страница
const homeURL = 'http://localhost:8080/'
// const homeURL = ''
// const homeURL = 'https://hseadc.github.io/all_times/'

const menu = [
    {
        text: 'Статьи',
        url: 'articls.html',
    },
    {
        text: 'Рефлексия',
        url: 'reflection.html',
    },
    {
        text: 'О нас',
        url: 'aboutUs.html',
    },
]

//properties
const props = {
    prerender: true,
    homeURL,
    menu
}

export { props }