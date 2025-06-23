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

        const colors = ['rgba(24, 165, 149, 1)', 'rgba(149, 0, 255, 1)', 'rgba(225, 1, 141, 1)', 'rgba(51, 50, 255, 1)', 'rgba(249, 1, 93, 1)', 'rgba(0, 134, 252, 1)']; // новый массив цветов
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
        cards.forEach(card => {
          card.addEventListener('mouseenter', () => {
                
                // эдлементы только внутри текущей карточки манифеста
                const randColorPic = card.querySelectorAll('.A_Color') 
                const randColorText = card.querySelectorAll('.A_Manifest_Text')
                console.log('kgliig')
                
                // применяем рандом
                randColorPic.forEach(el => el.style.backgroundColor = randomColor);
                randColorText.forEach(el => el.style.color = randomColor);
            });
            
            card.addEventListener('mouseleave', () => {
                const randColorPic = card.querySelectorAll('.A_Color') 
                const randColorText = card.querySelectorAll('.A_Manifest_Text')
                
                randColorPic.forEach(el => el.style.backgroundColor = '');
                randColorText.forEach(el => el.style.color = '');
            });
        });

      }

      window.onload = changeTextColor;

//Рандомное позиционирование иконки
document.addEventListener('DOMContentLoaded', function () {
  const Info_Icon = document.querySelectorAll('.Random_Position');
  Info_Icon.forEach(el => {
    el.style.left = `${Math.floor(Math.random()*95)}%`
    el.style.top = `${Math.floor(Math.random()*50)}%`  
  })
  
})



