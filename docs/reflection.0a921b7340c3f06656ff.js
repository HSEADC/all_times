/******/ (() => { // webpackBootstrap
//ховер для инфо блока
document.addEventListener('DOMContentLoaded', function () {
  var Info_Icon = document.querySelector('.A_Info_Icon');
  var infBlck = document.querySelector('.A_Info_Block');
  Info_Icon.addEventListener('mouseenter', function () {
    infBlck.style.display = 'block'; // Показываем блок
  });
  Info_Icon.addEventListener('mouseleave', function () {
    infBlck.style.display = 'none'; // Скрываем блок
  });
});
/******/ })()
;