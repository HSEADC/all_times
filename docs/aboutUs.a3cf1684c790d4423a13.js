/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

document.addEventListener('DOMContentLoaded', function () {
  var C_Menu_Bar = document.querySelector('.C_Menu_Bar');
  var top = C_Menu_Bar.offsetTop;
  //offset().Top

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

//меняем цвет рандом
function changeTextColor() {
  var textElement = document.querySelectorAll('.Random_Color'); // находим элемент
  //const svgEl = document.querySelector('#Random_Color_Fill');
  var svgElStroke = document.querySelectorAll('#Random_Color_Stroke');
  var logoEl = document.querySelectorAll('#Random_Color_Logo');
  var yearColorRand = document.querySelectorAll('#yearColorRand');
  var colors = ['rgba(0, 0, 255, 1)', 'rgba(0, 116, 217, 1)', 'rgba(192, 12, 192, 1)', 'rgba(150, 1, 255, 1)', 'rgba(199, 21, 133, 1)', 'rgba(13, 130, 130, 1)']; // массив цветов
  var randomColor = colors[Math.floor(Math.random() * colors.length)]; // случайный цвет

  textElement.forEach(function (element) {
    element.style.color = randomColor; // меняем цвет текста
  });

  //svgEl.style.fill = randomColor; 
  // svgElStroke.style.stroke = randomColor;  

  svgElStroke.forEach(function (element) {
    element.style.stroke = randomColor;
  });
  yearColorRand.forEach(function (element) {
    element.style.color = randomColor;
  });
  logoEl.forEach(function (element) {
    element.style.fill = randomColor;
  });
}
window.onload = changeTextColor;

//Рандомное позиционирование иконки
document.addEventListener('DOMContentLoaded', function () {
  var Info_Icon = document.querySelectorAll('.Random_Position');
  var max = 95;
  Info_Icon.forEach(function (el) {
    el.style.left = "".concat(Math.floor(Math.random() * (max + 1)), "%");
    el.style.top = "".concat(Math.floor(Math.random() * (max + 1)), "%");
  });

  // Info_Icon.style.left = `${Math.floor(Math.random()*(max + 1))}%`
  // Info_Icon.style.top = `${Math.floor(Math.random()*(max + 1))}%`
});
/******/ })()
;