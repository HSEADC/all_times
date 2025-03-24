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


  
//меняем цвет рандом
function changeColor() {
    const backColor = document.querySelectorAll('.Random_Color_Back');
    const randBack = document.querySelectorAll('.A_Color')
    const svgElStroke = document.querySelectorAll('#Random_Color_Stroke');
    const colors = ['rgba(0, 0, 255, 1)', 'rgba(0, 116, 217, 1)', 'rgba(192, 12, 192, 1)', 'rgba(150, 1, 255, 1)', 'rgba(199, 21, 133, 1)', 'rgba(13, 130, 130, 1)']; // массив цветов
    const randomColor = colors[Math.floor(Math.random() * colors.length)]; // случайный цвет

    backColor.forEach(element => {
      element.style.backgroundColor = randomColor; // меняем цвет текста
    });

    svgElStroke.forEach(el => {
        el.style.stroke = randomColor;  
    });

    // randBack.forEach(el => {
    //     el.style.backgroundColor = randomColor; 
    // })



      
    randBack.forEach(el => {
        el.addEventListener('mouseenter', () => {
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          el.style.backgroundColor = randomColor;
        });
        
        el.addEventListener('mouseleave', () => {
          el.style.backgroundColor = ''; // Возвращаем прозрачный цвет
        });
      });
}

window.onload = changeColor;

