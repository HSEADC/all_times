/******/ (() => { // webpackBootstrap
// import '../index.css'

// document.addEventListener("DOMContentLoaded", () => {
//     const crosses = document.querySelectorAll('.A_Button_Article');
//     const articles = document.querySelectorAll('.A_Text_of_Article');

//     crosses.forEach((cross) => {
//         cross.addEventListener("click", (event) => {
//             articles.forEach((article) => {
//                 if (article.style.display === 'none') {
//                     article.style.display = 'flex'; // Показываем статью
//                     cross.style.transform = "rotate(45deg)";
//                     // cross.classList.add('.A_Smoth_Rotate');
//                 } else {
//                     article.style.display = 'none'; // Скрываем статью
//                     cross.style.transform = "rotate(0deg)";
//                 }
//             });
//         });
//     });
// });

//ТУТ РАБОТАЕТ КРЕСТИК
document.addEventListener("DOMContentLoaded", function () {
  var buttons = document.querySelectorAll('.A_Button_Article');
  buttons.forEach(function (button) {
    // Находим родительский блок статьи -- closest()
    var articleBlock = button.closest('.O_Article');
    // Находим соответствующий блок текста статьи внутри этого блока
    var articleText = articleBlock.querySelector('.A_Text_of_Article');
    button.addEventListener("click", function (event) {
      if (articleText.style.display === 'none' || !articleText.style.display) {
        articleText.style.display = 'flex'; // Показываем статью
        button.style.transform = "rotate(45deg)";
      } else {
        articleText.style.display = 'none'; // Скрываем статью
        button.style.transform = "rotate(0deg)";
      }
    });
  });
});

//Рандомное позиционирование иконки
document.addEventListener('DOMContentLoaded', function () {
  var Img_Icon = document.querySelectorAll('.Random_Position_Article_Icon');
  var max = 80;
  Img_Icon.forEach(function (el) {
    el.style.left = "".concat(Math.floor(Math.random() * (max + 1)), "%");
    // el.style.top = `${Math.floor(Math.random()*(max + 1))}%`
  });
  var gifka = document.querySelectorAll('.A_Gifka');
  Img_Icon.forEach(function (el) {
    el.addEventListener('mouseenter', function () {
      gifka.forEach(function (elem) {
        elem.style.display = 'block';
      });
    });
  });
  Img_Icon.forEach(function (el) {
    el.addEventListener('mouseleave', function () {
      gifka.forEach(function (elem) {
        elem.style.display = 'none';
      });
    });
  });
});

//меняем цвет рандом
function changeColor() {
  var backColor = document.querySelectorAll('.Random_Color_Back');
  var colors = ['rgba(0, 0, 255, 1)', 'rgba(0, 116, 217, 1)', 'rgba(192, 12, 192, 1)', 'rgba(150, 1, 255, 1)', 'rgba(199, 21, 133, 1)', 'rgba(13, 130, 130, 1)']; // массив цветов
  var randomColor = colors[Math.floor(Math.random() * colors.length)]; // случайный цвет

  backColor.forEach(function (element) {
    element.style.backgroundColor = randomColor; // меняем цвет текста
  });
}
window.onload = changeColor;
/******/ })()
;