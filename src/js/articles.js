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

        button.addEventListener("click", (event) => {
            if (articleText.style.display === 'none' || !articleText.style.display) {
                articleText.style.display = 'flex'; // Показываем статью
                button.style.transform = "rotate(45deg)";
            } else {
                articleText.style.display = 'none'; // Скрываем статью
                button.style.transform = "rotate(0deg)";
            }
        });
    });
});


//ТУТ МЕНЯЕМ ЦВЕТ БЛОКА НА ХОВЕРЕ
document.addEventListener("DOMContentLoaded", () => {
    const picContainers = document.querySelectorAll('.A_Pic_for_Article');
  
    picContainers.forEach(container => {
      container.addEventListener('mouseenter', () => {
        container.style.backgroundImage = 'none';
        container.classList.add('.Random_Color_Back');
      });
  
      container.addEventListener('mouseleave', () => {
        container.style.backgroundImage = 'url(/src/images/A_Dada_Back.webp)';
        container.classList.remove('.Random_Color_Back');
      });
    });
});

//меняем цвет рандом
function changeColor() {
    const backColor = document.querySelectorAll('.Random_Color_Back')
    backColor.forEach(element => {
      element.style.backgroundColor = randomColor; // меняем цвет текста
    })
}

window.onload = changeColor;














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



////HOVER RANDOM BACK
// document.addEventListener('DOMContentLoaded', function () {
//     const first = document.querySelectorAll('.First_P');
//     const second = document.querySelectorAll('.Second_P');

//     first.forEach((el) => {
//         el.addEventListener('mouseenter', () => {
//             el.style.opacity = '0';
//         })
//     })

//     second.forEach((el) => {
//         el.addEventListener('mouseleave', () => {
//             el.style.opacity = '100';
//         })
//     })

// })





  
