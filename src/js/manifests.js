import '../index.css'
var __webpack_exports__ = {};

document.addEventListener('DOMContentLoaded', function () {
    var C_Menu_Bar = document.querySelector('.C_Menu_Bar');
    var top = C_Menu_Bar.offsetTop;

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


//Рандомное позиционирование иконки
document.addEventListener('DOMContentLoaded', function () {
  const Info_Icon = document.querySelector('.Random_Position');
  const max = 95;
  
  Info_Icon.style.left = `${Math.floor(Math.random()*(max + 1))}%`
  Info_Icon.style.bottom = `${Math.floor(Math.random()+(max + 1))}%`
})


//ховер для инфо блока
document.addEventListener('DOMContentLoaded', function () {
  const Info_Icon = document.querySelector('.A_Info_Icon');
  const infBlckM = document.querySelector('.A_Info_Block_Mani');

  Info_Icon.addEventListener('mouseenter', () => {
    infBlckM.style.display = 'block';  // Показываем блок
  });

  Info_Icon.addEventListener('mouseleave', () => {
    infBlckM.style.display = 'none';  // Скрываем блок
  });

})