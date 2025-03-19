/******/ (() => { // webpackBootstrap
/******/ 	"use strict";


//отдельный чанк мэйн тк в манифест.жс он не видит флюксус
document.querySelector('.Fluxus').addEventListener('click', function () {
  location.href = 'manifests/fluxus.html';
});
document.querySelector('.Crujok').addEventListener('click', function () {
  location.href = 'manifests/crujok.html';
});

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