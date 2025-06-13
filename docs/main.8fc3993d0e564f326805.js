/******/ (() => { // webpackBootstrap
//отдельный чанк мэйн тк в манифест.жс он не видит флюксус
document.querySelector('.Fluxus').addEventListener('click', function () {
  location.href = 'manifests/fluxus.html';
});
document.querySelector('.Crujok').addEventListener('click', function () {
  location.href = 'manifests/crujok.html';
});
document.querySelector('.Dadaism').addEventListener('click', function () {
  location.href = 'manifests/dadaism.html';
});
document.querySelector('.Oppoyaz').addEventListener('click', function () {
  location.href = 'manifests/oppoyaz.html';
});
document.querySelector('.Dogma').addEventListener('click', function () {
  location.href = 'manifests/dogma.html';
});
document.querySelector('.Luchi').addEventListener('click', function () {
  location.href = 'manifests/luchi.html';
});
document.querySelector('.Surreal').addEventListener('click', function () {
  location.href = 'manifests/surreal.html';
});
document.querySelector('.GB').addEventListener('click', function () {
  location.href = 'manifests/GB.html';
});
document.querySelector('.LightFormMoveSound').addEventListener('click', function () {
  location.href = 'manifests/LightFormMoveSound.html';
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

// //ховер для инфо блока для всех -- не получилось???
// document.addEventListener('DOMContentLoaded', function () {
//   const Info_Icon = document.querySelectorAll('.A_Info_Icon');
//   const infBlck = document.querySelectorAll('.A_Info_Block');

//   Info_Icon.forEach((icon) => {
//     icon.addEventListener('mouseenter', () => {
//       infBlck.forEach((block) => {
//         block.style.display = 'block';
//       })
//     });
//   })

//   Info_Icon.forEach((icon) => {
//     icon.addEventListener('mouseleave', () => {
//       infBlck.forEach((block) => {
//         block.style.display = 'none';
//       })
//     });
//   })

// })
/******/ })()
;