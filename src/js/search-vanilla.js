import '../index.css'

import { getManifests } from "./search-data.js";

let content = []

document.addEventListener('DOMContentLoaded', () => {
    getManifests().then((data) => {
        //обновление данных
        // update(data)
        content = data
        initSearch()
    })
})


function initSearch() {
    const O_Search = document.querySelector('.O_Search');
    const A_SearchInput = O_Search.querySelector('.A_SearchInput');
    const A_SearchButton = O_Search.querySelector('.A_SearchButton');
    
    let requestText = getSearchRequest()

    if (requestText != undefined) {
        //сохранение зпроса - не стираем его
        A_SearchInput.value = requestText

        if (content) {
            SearchContent(requestText) //если есть контент\данные -- запускаем функциию рендера контента
        }
    }
    else {
        //обуление поиска
        A_SearchInput.value = ''
    }

    //считываем значение
    A_SearchInput.addEventListener('input', (e) => {
        
        requestText = e.target.value

        //как только воодится текст -- кнопка становится активной
        if (requestText.length >= 3) {
            A_SearchButton.classList.remove('disable')
        }
        else{
            A_SearchButton.classList.add('disable')
        }
    })

    //enter 
    A_SearchInput.addEventListener('keydown', (e) => {
        requestText = e.target.value

        if (e.key == 'Enter') {
            setSearchRequest(requestText)
            SearchContent(requestText)
        }
    })

    A_SearchButton.addEventListener('click', (e) => {
        //проверка что класса нет
        if (!e.target.classList.contains('disable')) {
            requestText = A_SearchInput.value

            setSearchRequest(requestText)
            SearchContent(requestText)
        }
    })
}

function getSearchRequest() {
    const url = new URL(window.location.href)
    const searchParams = new URLSearchParams(url.search)

    if (searchParams.has('request')) {
        return searchParams.get('request')
    }

}

//значение поискового запроса -- в строке кода будет типо search?=manifests
function setSearchRequest(requestText) {
    const url = window.location.href.split('?')[0]

    window.location.href = url + '?request=' + requestText
}

//сердце поиска - отобрадение карточек
function SearchContent(requestText) {
    const container = document.querySelector('.S_Content')
    container.innerHTML = ''

    let contentItemIds = []

    console.log(content)

    content.forEach((contentItem) => {
        const nbspRegEx = /[\u202F\u00A0]/gm
        const punctuationRegEx = /[.,\/#!$%\^&\*;:{}=\-_`()]/gm

        let { titles, years, describtions, id } = contentItem

        titles = titles.replaceAll(nbspRegEx, ' ')
        titles = titles.replaceAll(punctuationRegEx, '')
    
        describtions = describtions.replaceAll(nbspRegEx, ' ')
        describtions = describtions.replaceAll(punctuationRegEx, '')

        if (requestText.length >= 3) {
            if (titles.toLowerCase().includes(requestText.toLowerCase()) || years.toString().includes(requestText) || describtions.toLowerCase().includes(requestText.toLowerCase())){
                contentItemIds.push(id)
            } 
            else{
                console.log('ids')
            }
        }

        if (contentItemIds.length > 0) {
            renderCardsByIds(container, contentItemIds)
        }
        else {
            renderNothingFounded()
        }
    })
}

function renderNothingFounded() {
    // container.innerHTML = 'Ничего не найдено :('
    document.querySelector('.S_Content').innerText = ''
    document.querySelector('.S_Content').innerText = 'Ничего не найдено'
}

function renderCardsByIds(container, ids) {
    //как проверить что карточки не повторяются
    document.querySelector('.S_Content').innerText = ''
    ids = [...new Set(ids)] 

    ids.forEach((id) => {
        content.forEach((item) => {
            if (item.id === id) {
                //one more var
                // createCard(item)
                container.appendChild(createCard(item))
            }
        })
    }) 
}

//ОБЫЧННАЯ ФУНКЦИЯ СОЗДАНИЯ КАРТОЧЕК ПОИСКА
function createCard(contentItemData) {
    //content == data
    const container = document.querySelector('.S_Content')

    const contentItem = document.createElement('a')
    contentItem.classList.add('O_ContentItem')
    contentItem.classList.add(`${contentItemData.class}`)
    contentItem.href = contentItemData.url

    const contentItemImg = document.createElement('img')
    contentItemImg.classList.add('A_ContentItemImg')
    contentItemImg.src = contentItemData.imgs

    const contentItemTitle = document.createElement('h1')
    contentItemTitle.classList.add('A_ContentItemTitle')
    contentItemTitle.innerText = contentItemData.titles

    const contentItemDescribtion = document.createElement('p')
    contentItemDescribtion.classList.add('A_ContentItemDescribtion')
    contentItemDescribtion.innerText = contentItemData.describtions

    console.log(contentItemData)
    //Из лога видно, что contentItemData.tags — это строка (например, "2024", "1963"), а не массив.
    //Метод .forEach() работает только с массивами, поэтому возникает ошибка.
    const contentItemTags = document.createElement('div')
    contentItemTags.classList.add('C_ContentItemTags')

    contentItemData.tags.forEach((tag) => {
        const contentItemTag = document.createElement('p')
        contentItemTag.classList.add('A_ContentItemTag')
        contentItemTag.innerText = tag
        contentItemTags.appendChild(contentItemTag)
    })


    //пробую создать див для тайтла и тегов -- не получилось :(
    const contentItemTitleAndTags = document.createElement('div')
    contentItemTitleAndTags.classList.add('M_TitleAndTags_Container')
    contentItemTitleAndTags.appendChild(contentItemTitle)
    contentItemTitleAndTags.appendChild(contentItemTags)
    // console.log(contentItemTitleAndTags)

    contentItem.appendChild(contentItemImg)
    contentItem.appendChild(contentItemTitleAndTags)
    contentItem.appendChild(contentItemDescribtion)

    // container.appendChild(contentItem)
    return contentItem
    
}

// ///ЗДЕСЬ ФУНКЦИЯ СОЗДАНИЯ БЛОКОВ ЕСЛИ НЕ ОТОБРАЖАТЬ ПУСТЫЕ КАРТИНКИ
// function createCard(contentItemData) {
//     const container = document.querySelector('.S_Content')

//     const contentItem = document.createElement('a')
//     contentItem.classList.add('O_ContentItem')
//     contentItem.classList.add(`${contentItemData.class}`)
//     contentItem.href = contentItemData.url

//     // Создаем элемент для изображения только если есть URL картинки
//     if (contentItemData.imgs) {
//         const contentItemImg = document.createElement('img')
//         contentItemImg.classList.add('A_ContentItemImg')
//         contentItemImg.src = contentItemData.imgs
//         contentItem.appendChild(contentItemImg)
//     }

//     const contentItemTitle = document.createElement('h1')
//     contentItemTitle.classList.add('A_ContentItemTitle')
//     contentItemTitle.innerText = contentItemData.titles

//     const contentItemDescribtion = document.createElement('p')
//     contentItemDescribtion.classList.add('A_ContentItemDescribtion')
//     contentItemDescribtion.innerText = contentItemData.describtions

//     const contentItemTags = document.createElement('div')
//     contentItemTags.classList.add('C_ContentItemTags')

//     // Обрабатываем теги - проверяем, является ли значение массивом или строкой
//     const tags = contentItemData.tags
//     if (tags) {
//         if (Array.isArray(tags)) {
//             tags.forEach(tag => {
//                 const contentItemTag = document.createElement('p')
//                 contentItemTag.classList.add('A_ContentItemTag')
//                 contentItemTag.innerText = tag
//                 contentItemTags.appendChild(contentItemTag)
//             })
//         } else if (typeof tags === 'string') {
//             const contentItemTag = document.createElement('p')
//             contentItemTag.classList.add('A_ContentItemTag')
//             contentItemTag.innerText = tags
//             contentItemTags.appendChild(contentItemTag)
//         }
//     }

//     const contentItemTitleAndTags = document.createElement('div')
//     contentItemTitleAndTags.classList.add('M_TitleAndTags_Container')
//     contentItemTitleAndTags.appendChild(contentItemTitle)
//     contentItemTitleAndTags.appendChild(contentItemTags)

//     contentItem.appendChild(contentItemTitleAndTags)
//     contentItem.appendChild(contentItemDescribtion)

//     return contentItem
// }