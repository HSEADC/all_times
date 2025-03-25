import './index.css'

document.addEventListener('DOMContentLoaded', function () {
    var C_Menu_Bar = document.querySelector('.C_Menu_Bar')
    var top = C_Menu_Bar.offsetTop
    //offset().Top
    console.log(1234)

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
        const svgEl = document.querySelectorAll('#Random_Color_Fill');
        const svgElStroke = document.querySelectorAll('#Random_Color_Stroke');
        const infBlckMain = document.querySelectorAll('.Random_Color_Inf_Block');

        const logoEl = document.querySelectorAll('#Random_Color_Logo');
        const yearColorRand = document.querySelectorAll('#yearColorRand');

        const colors = ['rgba(0, 0, 255, 1)', 'rgba(0, 116, 217, 1)', 'rgba(192, 12, 192, 1)', 'rgba(150, 1, 255, 1)', 'rgba(199, 21, 133, 1)', 'rgba(13, 130, 130, 1)']; // массив цветов
        const randomColor = colors[Math.floor(Math.random() * colors.length)]; // случайный цвет
        
        textElement.forEach(element => {
          element.style.color = randomColor; // меняем цвет текста
        })
       
        svgElStroke.forEach(el => {
          el.style.stroke = randomColor;  
        })
 
        yearColorRand.forEach(element => {
          element.style.color = randomColor;
        })

        svgEl.forEach(element => {
          element.style.fill = randomColor;         
        })


        logoEl.forEach(element => {
          element.style.fill = randomColor;
        })

        infBlckMain.forEach(element => {
          element.style.background = randomColor;
        })






















      const cards = document.querySelectorAll('.O_Manifest_Card');
        //const colors = ['rgba(0, 0, 255, 1)', 'rgba(0, 116, 217, 1)', 'rgba(192, 12, 192, 1)', 'rgba(150, 1, 255, 1)', 'rgba(199, 21, 133, 1)', 'rgba(13, 130, 130, 1)'];
    
        cards.forEach(card => {
          card.addEventListener('mouseenter', () => {
                const randomColor = colors[Math.floor(Math.random() * colors.length)];
                
                // эдлементы только внутри текущей статьи
                const randBack = card.querySelectorAll('.A_Color_Manifest');
                const svgElStroke = card.querySelectorAll('#Random_Color_Stroke');
                const randText = card.querySelectorAll('.A_Color_Text');
                const randFill = card.querySelectorAll('.A_RandColorFill');
                console.log('kgliig')
                
                // применяем рандом
                randBack.forEach(el => el.style.backgroundColor = randomColor);
                svgElStroke.forEach(el => el.style.stroke = randomColor);
                randText.forEach(el => el.style.color = randomColor);
                randFill.forEach(el => el.style.fill = randomColor);
            });
            
            card.addEventListener('mouseleave', () => {
                const randBack = card.querySelectorAll('.A_Color_Manifest');
                const svgElStroke = card.querySelectorAll('#Random_Color_Stroke');
                const randText = card.querySelectorAll('.A_Color_Text');
                const randFill = card.querySelectorAll('.A_RandColorFill');
                
                randBack.forEach(el => el.style.backgroundColor = '');
                svgElStroke.forEach(el => el.style.stroke = '');
                randText.forEach(el => el.style.color = '');
                randFill.forEach(el => el.style.fill = '');
            });
        });

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
  
})



