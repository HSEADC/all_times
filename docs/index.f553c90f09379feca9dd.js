/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

document.addEventListener('DOMContentLoaded', function () {
  var C_Menu_Bar = document.querySelector('.C_Menu_Bar');
  var top = C_Menu_Bar.offsetTop;
  //offset().Top
  console.log(1234);
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
  var svgEl = document.querySelectorAll('#Random_Color_Fill');
  var svgElStroke = document.querySelectorAll('#Random_Color_Stroke');
  var infBlckMain = document.querySelectorAll('.Random_Color_Inf_Block');
  var logoEl = document.querySelectorAll('#Random_Color_Logo');
  var yearColorRand = document.querySelectorAll('#yearColorRand');
  var colors = ['rgba(0, 0, 255, 1)', 'rgba(0, 116, 217, 1)', 'rgba(192, 12, 192, 1)', 'rgba(150, 1, 255, 1)', 'rgba(199, 21, 133, 1)', 'rgba(13, 130, 130, 1)']; // массив цветов
  var randomColor = colors[Math.floor(Math.random() * colors.length)]; // случайный цвет

  textElement.forEach(function (element) {
    element.style.color = randomColor; // меняем цвет текста
  });
  svgElStroke.forEach(function (el) {
    el.style.stroke = randomColor;
  });
  yearColorRand.forEach(function (element) {
    element.style.color = randomColor;
  });
  svgEl.forEach(function (element) {
    element.style.fill = randomColor;
  });
  logoEl.forEach(function (element) {
    element.style.fill = randomColor;
  });
  infBlckMain.forEach(function (element) {
    element.style.background = randomColor;
  });
  var cards = document.querySelectorAll('.O_Manifest_Card');
  //const colors = ['rgba(0, 0, 255, 1)', 'rgba(0, 116, 217, 1)', 'rgba(192, 12, 192, 1)', 'rgba(150, 1, 255, 1)', 'rgba(199, 21, 133, 1)', 'rgba(13, 130, 130, 1)'];

  cards.forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      var randomColor = colors[Math.floor(Math.random() * colors.length)];

      // эдлементы только внутри текущей статьи
      var randBack = card.querySelectorAll('.A_Color_Manifest');
      var svgElStroke = card.querySelectorAll('#Random_Color_Stroke');
      var randText = card.querySelectorAll('.A_Color_Text');
      var randFill = card.querySelectorAll('.A_RandColorFill');
      console.log('kgliig');

      // применяем рандом
      randBack.forEach(function (el) {
        return el.style.backgroundColor = randomColor;
      });
      svgElStroke.forEach(function (el) {
        return el.style.stroke = randomColor;
      });
      randText.forEach(function (el) {
        return el.style.color = randomColor;
      });
      randFill.forEach(function (el) {
        return el.style.fill = randomColor;
      });
    });
    card.addEventListener('mouseleave', function () {
      var randBack = card.querySelectorAll('.A_Color_Manifest');
      var svgElStroke = card.querySelectorAll('#Random_Color_Stroke');
      var randText = card.querySelectorAll('.A_Color_Text');
      var randFill = card.querySelectorAll('.A_RandColorFill');
      randBack.forEach(function (el) {
        return el.style.backgroundColor = '';
      });
      svgElStroke.forEach(function (el) {
        return el.style.stroke = '';
      });
      randText.forEach(function (el) {
        return el.style.color = '';
      });
      randFill.forEach(function (el) {
        return el.style.fill = '';
      });
    });
  });
}
window.onload = changeTextColor;

//Рандомное позиционирование иконки
document.addEventListener('DOMContentLoaded', function () {
  var Info_Icon = document.querySelectorAll('.Random_Position');
  Info_Icon.forEach(function (el) {
    el.style.left = "".concat(Math.floor(Math.random() * 95), "%");
    el.style.top = "".concat(Math.floor(Math.random() * 50), "%");
  });
});
/******/ })()
;