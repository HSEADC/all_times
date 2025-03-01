import './index.css'

document.addEventListener('DOMContentLoaded', function () {
    var C_Menu_Bar = document.querySelector('.C_Menu_Bar')
    var top = C_Menu_Bar.offsetTop

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
        const textElement = document.querySelector('.Random_Color'); // находим элемент
        const svgEl = document.querySelector('#Random_Color_Fill');
        const svgElStroke = document.querySelector('#Random_Color_Stroke');
        const logoEl = document.querySelector('.Random_Color_Logo');
        const infBlckMain = document.querySelector('.Random_Color_Inf_Block');


        const colors = ['rgba(0, 0, 255, 1)', 'rgba(0, 116, 217, 1)', 'rgba(192, 12, 192, 1)', 'rgba(150, 1, 255, 1)', 'rgba(199, 21, 133, 1)', 'rgba(13, 130, 130, 1)']; // массив цветов
        const randomColor = colors[Math.floor(Math.random() * colors.length)]; // случайный цвет
        
        textElement.style.color = randomColor; // меняем цвет текста
        svgEl.style.fill = randomColor; 
        svgElStroke.style.stroke = randomColor; 
        logoEl.style.fill = randomColor; 
        infBlckMain.style.background = randomColor;
      }

      window.onload = changeTextColor;




  document.getElementById('Fluxus').addEventListener('click', function() {
    location.href = 'manifests/fluxus.html';
  });

//Рандомное позиционирование иконки
document.addEventListener('DOMContentLoaded', function () {
  const Info_Icon = document.querySelector('.Random_Position');
  const max = 95;
  
  Info_Icon.style.left = `${Math.floor(Math.random()*(max + 1))}%`
  Info_Icon.style.top = `${Math.floor(Math.random()*(max + 1))}%`
})


//ховер для инфо блока
document.addEventListener('DOMContentLoaded', function () {
  const Info_Icon = document.querySelector('.A_Info_Icon');
  const infBlck = document.querySelector('.A_Info_Block');

  Info_Icon.addEventListener('mouseenter', () => {
    infBlck.style.display = 'block';  // Показываем блок
  });

  Info_Icon.addEventListener('mouseleave', () => {
    infBlck.style.display = 'none';  // Скрываем блок
  });

})
