/******/ (() => { // webpackBootstrap
/******/ 	"use strict";


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