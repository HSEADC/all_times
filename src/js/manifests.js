import '../index.css'
var __webpack_exports__ = {};

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


//Рандомное позиционирование иконки
document.addEventListener('DOMContentLoaded', function () {
  const Info_Icon = document.querySelector('.Random_Position');
  const max = 95;
  
  Info_Icon.style.left = `${Math.floor(Math.random()*(max + 1))}%`
  Info_Icon.style.top = `${Math.floor(Math.random()+(max + 1))}%`
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






//ТУТ СЛАЙДЕР
document.addEventListener("DOMContentLoaded", function() {
  //Slider function
  let A_Images_in_Slider = document.querySelectorAll('.A_Images_in_Slider img');
  let currentIndexpage = 0;

  function updateContentpage() {
      A_Images_in_Slider.forEach(function(img, index) {
          img.classList.toggle('activ_img', index === currentIndexpage);
      });
  }

  let nextButtonp = document.querySelector('.A_Arrow_Forwards');
  let prevButtonp = document.querySelector('.A_Arrow_Backwards');

  if (nextButtonp && prevButtonp) {
      nextButtonp.addEventListener('click', function() {
        console.log(123)
          currentIndexpage = (currentIndexpage + 1) % A_Images_in_Slider.length;
          updateContentpage();
      });
      prevButtonp.addEventListener('click', function() {
          currentIndexpage = (currentIndexpage - 1 + A_Images_in_Slider.length) % A_Images_in_Slider.length;
          updateContentpage();
      });
      updateContentpage();
  }



  const text = document.querySelector('.clickTxt')
  const next = document.querySelector('.A_Arrow_Forwards')
  const previous = document.querySelector('.A_Arrow_Backwards')
  const amount = document.querySelector('#Image_len')

  let cnt = 0;
  const pic_cnt = Number(amount.innerHTML);

  next.addEventListener('click', () => {
      cnt++;
      cnt %= pic_cnt
      text.innerHTML = `${cnt + 1}`;
  })
  previous.addEventListener('click', () => {
      cnt--;
      cnt += pic_cnt
      cnt %= pic_cnt
      text.innerHTML = `${cnt + 1}`;
  })
})