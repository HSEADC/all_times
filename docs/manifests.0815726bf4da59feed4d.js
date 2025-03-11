/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

var __webpack_exports__ = {};
document.addEventListener('DOMContentLoaded', function () {
  var C_Menu_Bar = document.querySelector('.C_Menu_Bar');
  var top = C_Menu_Bar.offsetTop;
  window.addEventListener('scroll', function () {
    if (window.scrollY >= top) {
      C_Menu_Bar.style.position = '';
      C_Menu_Bar.style.top = '0';
      C_Menu_Bar.style.zIndex = '10';
      C_Menu_Bar.style.padding = '1vw 3vw';
    } else {
      C_Menu_Bar.style.position = '';
      C_Menu_Bar.style.top = '';
      C_Menu_Bar.style.zIndex = '';
      C_Menu_Bar.style.padding = '1vw 3vw';
    }
  });
});

//Рандомное позиционирование иконки
document.addEventListener('DOMContentLoaded', function () {
  var Info_Icon = document.querySelector('.Random_Position');
  var max = 95;
  Info_Icon.style.left = "".concat(Math.floor(Math.random() * (max + 1)), "%");
  Info_Icon.style.top = "".concat(Math.floor(Math.random() + (max + 1)), "%");
});

//ховер для инфо блока
document.addEventListener('DOMContentLoaded', function () {
  var Info_Icon = document.querySelector('.A_Info_Icon');
  var infBlckM = document.querySelector('.A_Info_Block_Mani');
  Info_Icon.addEventListener('mouseenter', function () {
    infBlckM.style.display = 'block'; // Показываем блок
  });
  Info_Icon.addEventListener('mouseleave', function () {
    infBlckM.style.display = 'none'; // Скрываем блок
  });
});

//ТУТ СЛАЙДЕР
document.addEventListener("DOMContentLoaded", function () {
  //Slider function
  var A_Images_in_Slider = document.querySelectorAll('.A_Images_in_Slider img');
  var currentIndexpage = 0;
  function updateContentpage() {
    A_Images_in_Slider.forEach(function (img, index) {
      img.classList.toggle('activ_img', index === currentIndexpage);
    });
  }
  var nextButtonp = document.querySelector('.A_Arrow_Forwards');
  var prevButtonp = document.querySelector('.A_Arrow_Backwards');
  if (nextButtonp && prevButtonp) {
    nextButtonp.addEventListener('click', function () {
      console.log(123);
      currentIndexpage = (currentIndexpage + 1) % A_Images_in_Slider.length;
      updateContentpage();
    });
    prevButtonp.addEventListener('click', function () {
      currentIndexpage = (currentIndexpage - 1 + A_Images_in_Slider.length) % A_Images_in_Slider.length;
      updateContentpage();
    });
    updateContentpage();
  }
  var text = document.querySelector('.clickTxt');
  var next = document.querySelector('.A_Arrow_Forwards');
  var previous = document.querySelector('.A_Arrow_Backwards');
  var amount = document.querySelector('#Image_len');
  var cnt = 0;
  var pic_cnt = Number(amount.innerHTML);
  next.addEventListener('click', function () {
    cnt++;
    cnt %= pic_cnt;
    text.innerHTML = "".concat(cnt + 1);
  });
  previous.addEventListener('click', function () {
    cnt--;
    cnt += pic_cnt;
    cnt %= pic_cnt;
    text.innerHTML = "".concat(cnt + 1);
  });
});
/******/ })()
;