
console.log(123)
document.addEventListener('DOMContentLoaded', () => {
    initFilter()
})

function initFilter() {
    const tags = document.querySelectorAll('.A_FilterTag')
    // внутри А -- все, в Б -- конкретный элемент
    const a = document.querySelector('.all')

    tags.forEach((tag) => {
        tag.addEventListener('click', () => {
            //клик на любой из тегов который не равен всем -- он активен, а остальные не подсвечены
            if (tag != a) {
                //при работе с клаасс лист точки не ставим
                a.classList.remove('active')
                tag.classList.toggle('active')

                console.log('здесь итерация по тегам')
                filterByTag() 
            }

            let b = document.querySelectorAll('.active')
            //.contains -- проверка есть ли такой класс или нет
            if (tag == a && !tag.classList.contains('active')){
                b.forEach((tag) => {
                    tag.classList.remove('active')
                    console.log('тут функция вывода всех карточек')
                    tag.classList.add('active')
                })
            }
            if (tags.length - 1 == b.length || b.length == 0) {
                b.forEach((tag) => {
                    tag.classList.remove('active')
                })
                a.classList.add('active')
                console.log('здесь будет функция вывода всех карточек')
                filterAll()
            }
        })
    })
}

function filterAll() {
    const cards = document.querySelectorAll('.O_ArticleCard')
    const activeTags = document.querySelectorAll('.active')

    activeTags.forEach((tag) =>{
        //ура учим сплит -- через сплит делаем массив карточек
        //classList -- only one class, className -- list of all tags
        let classList = tag.className.split(' ')
        if (tag.classList.contains('all')) {
            cards.forEach((card) => {
                card.style.cssText = 'displat: block;'
            })
        }

    })
}

function filterByTag() {
    const cards = document.querySelectorAll('.O_ArticleCard')
    const activeTags = document.querySelectorAll('.active')
    let count 
    //make an empty array
    let tagList = []

    cards.forEach((card) => {
        card.style.cssText = 'display: none;'
    })

    activeTags.forEach((tag) => {
        let classList = tag.className.split(' ')
        //ура учим сорт
        classList = classList.sort()
        count = 1
        // console.log(classList)
        if (classList[1] == 'active') {
            count ++
        }
        for (let i = count; i < classList.length; i++){
            //пушаем итый эл в список --потом проверим их наличие
            tagList.push(classList[i])
        }
    })
    tagList.forEach((tagName) => {
        cards.forEach((card) => {
            //сравнение двух списков -- выбранный и карточный
            if (card.classList.contains(tagName)) {
                card.style.cssText = 'display: block;'
            }
        })
    })

}