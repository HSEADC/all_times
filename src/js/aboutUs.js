import '../index.css'

document.addEventListener('DOMContentLoaded', function () {
    var C_Menu_Bar = document.querySelector('.C_Menu_Bar')
    var top = C_Menu_Bar.offsetTop
    //offset().Top

    window.addEventListener('scroll', function () {
      if (window.scrollY >= top) {
        C_Menu_Bar.style.position = ''
        C_Menu_Bar.style.top = '0'
        C_Menu_Bar.style.zIndex = '10'
        C_Menu_Bar.style.padding = '1vw 3vw'
      } else {
        C_Menu_Bar.style.position = ''
        C_Menu_Bar.style.top = ''
        C_Menu_Bar.style.zIndex = ''
        C_Menu_Bar.style.padding = '1vw 3vw'
      }
    })
  })




    //меняем цвет рандом
    function changeTextColor() {
        const textElement = document.querySelectorAll('.Random_Color'); // находим элемент
        //const svgEl = document.querySelector('#Random_Color_Fill');
        const svgElStroke = document.querySelectorAll('#Random_Color_Stroke');

        const logoEl = document.querySelectorAll('#Random_Color_Logo');
        const yearColorRand = document.querySelectorAll('#yearColorRand');

        const colors = ['rgba(24, 165, 149, 1)', 'rgba(149, 0, 255, 1)', 'rgba(225, 1, 141, 1)', 'rgba(51, 50, 255, 1)', 'rgba(249, 1, 93, 1)', 'rgba(0, 134, 252, 1)']; // новый массив цветов
        const randomColor = colors[Math.floor(Math.random() * colors.length)]; // случайный цвет
        
        textElement.forEach(element => {
          element.style.color = randomColor; // меняем цвет текста
        })
       
        //svgEl.style.fill = randomColor; 
        // svgElStroke.style.stroke = randomColor;  

        svgElStroke.forEach(element => {
            element.style.stroke = randomColor;
        })


        yearColorRand.forEach(element => {
          element.style.color = randomColor;
        })

        logoEl.forEach(element => {
          element.style.fill = randomColor;
        })


      }

      window.onload = changeTextColor;

//Рандомное позиционирование иконки
document.addEventListener('DOMContentLoaded', function () {
  const Info_Icon = document.querySelectorAll('.Random_Position');
  const max = 95;

  Info_Icon.forEach(el => {
    el.style.left = `${Math.floor(Math.random()*(max + 1))}%`
    el.style.top = `${Math.floor(Math.random()*(max + 1))}%`
  })

  // Info_Icon.style.left = `${Math.floor(Math.random()*(max + 1))}%`
  // Info_Icon.style.top = `${Math.floor(Math.random()*(max + 1))}%`
})

