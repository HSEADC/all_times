import '../index.css'

document.addEventListener('DOMContentLoaded', function () {
    var C_Menu_Bar = document.querySelector('.C_Menu_Bar')
    var top = C_Menu_Bar.offsetTop
    //offset().Top

    window.addEventListener('scroll', function () {
      if (window.scrollY >= top) {
        C_Menu_Bar.style.position = ''
        C_Menu_Bar.style.top = '0'
        C_Menu_Bar.style.zIndex = '100'
        C_Menu_Bar.style.padding = '1vw 3vw'
      } else {
        C_Menu_Bar.style.position = ''
        C_Menu_Bar.style.top = ''
        C_Menu_Bar.style.zIndex = ''
        C_Menu_Bar.style.padding = '1vw 3vw'
      }
    })
  })

// document.addEventListener("DOMContentLoaded", () => {
//     const crosses = document.querySelectorAll('.A_Button_Article');
//     const articles = document.querySelectorAll('.A_Text_of_Article');

//     crosses.forEach((cross) => {
//         cross.addEventListener("click", (event) => {
//             articles.forEach((article) => {
//                 if (article.style.display === 'none') {
//                     article.style.display = 'flex'; // Показываем статью
//                     cross.style.transform = "rotate(45deg)";
//                     // cross.classList.add('.A_Smoth_Rotate');
//                 } else {
//                     article.style.display = 'none'; // Скрываем статью
//                     cross.style.transform = "rotate(0deg)";
//                 }
//             });
//         });
//     });
// });

//ТУТ РАБОТАЕТ КРЕСТИК
document.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll('.A_Button_Article');

    buttons.forEach((button) => {
        // Находим родительский блок статьи -- closest()
        const articleBlock = button.closest('.O_Article');
        // Находим соответствующий блок текста статьи внутри этого блока
        const articleText = articleBlock.querySelector('.A_Text_of_Article');

        const nameToTop = articleBlock.querySelector('.M_Name_and_Cross_Article');

        button.addEventListener("click", (event) => {
            if (articleText.style.display === 'none' || !articleText.style.display) {
                articleText.style.display = 'flex'; // Показываем статью
                button.style.transform = "rotate(45deg)";
            } else {
                articleText.style.display = 'none'; // Скрываем статью
                button.style.transform = "rotate(0deg)";


                nameToTop.style.position = 'static';
                nameToTop.style.top = '';
                nameToTop.style.width = '';
                nameToTop.style.zIndex = '';
            }
        });
    });
});





//Рандомное позиционирование иконки
document.addEventListener('DOMContentLoaded', function () {
    const Img_Icon = document.querySelectorAll('.Random_Position_Article_Icon');
    const max = 80;

    Img_Icon.forEach(el => {
        el.style.left = `${Math.floor(Math.random()*(max + 1))}%`
        // el.style.top = `${Math.floor(Math.random()*(max + 1))}%`
    })

    const gifka = document.querySelectorAll('.A_Gifka')

    Img_Icon.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            gifka.forEach(elem => {
                elem.style.display = 'block'; 
            })
        });
    });

    Img_Icon.forEach((el) => {
        el.addEventListener('mouseleave', () => {
            gifka.forEach(elem => {
                elem.style.display = 'none';  
            })
        });
    })
})





//РАНДОМ ЦВЕТА
function changeColor() {
    const articles = document.querySelectorAll('.O_Article');
    const colors = ['rgba(24, 165, 149, 1)', 'rgba(149, 0, 255, 1)', 'rgba(225, 1, 141, 1)', 'rgba(51, 50, 255, 1)', 'rgba(249, 1, 93, 1)', 'rgba(0, 134, 252, 1)']; // новый массив цветов

    articles.forEach(article => {
        article.addEventListener('mouseenter', () => {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            
            // эдлементы только внутри текущей статьи
            const randBack = article.querySelectorAll('.A_Color');
            const svgElStroke = article.querySelectorAll('#Random_Color_Stroke');
            const randText = article.querySelectorAll('.A_Color_Text');
            const randFill = article.querySelectorAll('.A_RandColorFill');
            
            // применяем рандом
            randBack.forEach(el => el.style.backgroundColor = randomColor);
            svgElStroke.forEach(el => el.style.stroke = randomColor);
            randText.forEach(el => el.style.color = randomColor);
            randFill.forEach(el => el.style.fill = randomColor);
        });
        
        article.addEventListener('mouseleave', () => {
            const randBack = article.querySelectorAll('.A_Color');
            const svgElStroke = article.querySelectorAll('#Random_Color_Stroke');
            const randText = article.querySelectorAll('.A_Color_Text');
            const randFill = article.querySelectorAll('.A_RandColorFill');
            
            randBack.forEach(el => el.style.backgroundColor = '');
            svgElStroke.forEach(el => el.style.stroke = '');
            randText.forEach(el => el.style.color = '');
            randFill.forEach(el => el.style.fill = '');
        });
    });

    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const textElement = document.querySelectorAll('.Random_Color');
    const logoEl = document.querySelectorAll('#Random_Color_Logo');
    textElement.forEach(element => {
        element.style.color = randomColor; // меняем цвет текста
    })
     
    logoEl.forEach(element => {
      element.style.fill = randomColor;         
    })
}

window.onload = changeColor;
















document.addEventListener('DOMContentLoaded', function() {
    const articles = document.querySelectorAll('.O_Article');
    const menu = document.querySelector('.C_Menu_Bar');
    
    if (!articles.length || !menu) {
        console.error('Не найдены необходимые элементы');
        return;
    }

    

    // Получаем позицию и высоту меню
    const menuRect = menu.getBoundingClientRect();
    const menuBottom = menuRect.bottom + window.scrollY;
    const menuHeight = menuRect.height;

    articles.forEach(article => {
        const nameToTop = article.querySelector('.M_Name_and_Cross_Article');
        const textArticle = article.querySelector('.A_Text_of_Article');

        const picArticle = article.querySelector('.A_Pic_for_Article');
        
        
        if (textArticle.currentStyle ? textArticle.currentStyle.display :
            getComputedStyle(textArticle, null).display == 'none') {
        }
        if (!nameToTop || !textArticle) return;

        

        window.addEventListener('scroll', function() {
            if (getComputedStyle(textArticle, null).display == 'none') {
                return;
            }
            // Получаем позиции элементов
            const articleRect = article.getBoundingClientRect();
            const articleTop = articleRect.top + window.scrollY;
            const articleBottom = articleRect.bottom + window.scrollY;
            const nameToTopHeight = nameToTop.offsetHeight;

            // Сохраняем исходное положение
            const originalTop = nameToTop.offsetTop;
            let isFixed = false;

            const scrollY = window.scrollY;
            const nameToTopRect = nameToTop.getBoundingClientRect();

            // Точка, где заголовок должен зафиксироваться
            const stickPoint = picArticle.getBoundingClientRect().bottom + window.scrollY - menuHeight;
            // Точка, где заголовок должен открепиться
            //const releasePoint = articleBottom - nameToTopHeight - menuHeight;
            const releasePoint = articleBottom - nameToTopHeight - menuHeight;

            // Если скролл дошел до точки фиксации, но не дошел до точки освобождения
            if (scrollY >= stickPoint && scrollY <= releasePoint) {
                if (!isFixed) {
                    nameToTop.style.position = 'fixed';
                    nameToTop.style.top = `${menuBottom}px`;
                    nameToTop.style.width = `${articleRect.width}px`;
                    nameToTop.style.zIndex = '10';
                    isFixed = true;
                }
            } 
            // Если скролл выше точки фиксации
            else if (scrollY < stickPoint) {
                nameToTop.style.position = 'static';
                nameToTop.style.top = '';
                nameToTop.style.width = '';
                nameToTop.style.zIndex = '';
                isFixed = false;
            }
            // Если скролл ниже точки освобождения
            else {
                nameToTop.style.position = 'fixed';
                nameToTop.style.top = `${articleBottom - nameToTopHeight - scrollY}px`;
                nameToTop.style.width = `${articleRect.width}px`;
                nameToTop.style.zIndex = '10';
                isFixed = false;
            }
        });
    });
});

