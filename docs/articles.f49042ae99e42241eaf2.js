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
      C_Menu_Bar.style.zIndex = '100';
      C_Menu_Bar.style.padding = '1vw 3vw';
    } else {
      C_Menu_Bar.style.position = '';
      C_Menu_Bar.style.top = '';
      C_Menu_Bar.style.zIndex = '';
      C_Menu_Bar.style.padding = '1vw 3vw';
    }
  });
});

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
    var nameToTop = articleBlock.querySelector('.M_Name_and_Cross_Article');
    button.addEventListener("click", function (event) {
      if (articleText.style.display === 'none' || !articleText.style.display) {
        articleText.style.display = 'flex'; // Показываем статью
        button.style.transform = "rotate(45deg)";
      } else {
        articleText.style.display = 'none'; // Скрываем статью
        button.style.transform = "rotate(0deg)";
        nameToTop.style.position = 'static';
        nameToTop.style.top = '';
        nameToTop.style.width = '';
        nameToTop.style.zIndex = '';
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

//РАНДОМ ЦВЕТА
function changeColor() {
  var articles = document.querySelectorAll('.O_Article');
  var colors = ['rgba(0, 0, 255, 1)', 'rgba(0, 116, 217, 1)', 'rgba(192, 12, 192, 1)', 'rgba(150, 1, 255, 1)', 'rgba(199, 21, 133, 1)', 'rgba(13, 130, 130, 1)'];
  articles.forEach(function (article) {
    article.addEventListener('mouseenter', function () {
      var randomColor = colors[Math.floor(Math.random() * colors.length)];

      // эдлементы только внутри текущей статьи
      var randBack = article.querySelectorAll('.A_Color');
      var svgElStroke = article.querySelectorAll('#Random_Color_Stroke');
      var randText = article.querySelectorAll('.A_Color_Text');
      var randFill = article.querySelectorAll('.A_RandColorFill');

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
    article.addEventListener('mouseleave', function () {
      var randBack = article.querySelectorAll('.A_Color');
      var svgElStroke = article.querySelectorAll('#Random_Color_Stroke');
      var randText = article.querySelectorAll('.A_Color_Text');
      var randFill = article.querySelectorAll('.A_RandColorFill');
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
  var randomColor = colors[Math.floor(Math.random() * colors.length)];
  var textElement = document.querySelectorAll('.Random_Color');
  var logoEl = document.querySelectorAll('#Random_Color_Logo');
  textElement.forEach(function (element) {
    element.style.color = randomColor; // меняем цвет текста
  });
  logoEl.forEach(function (element) {
    element.style.fill = randomColor;
  });
}
window.onload = changeColor;
document.addEventListener('DOMContentLoaded', function () {
  var articles = document.querySelectorAll('.O_Article');
  var menu = document.querySelector('.C_Menu_Bar');
  if (!articles.length || !menu) {
    console.error('Не найдены необходимые элементы');
    return;
  }

  // Получаем позицию и высоту меню
  var menuRect = menu.getBoundingClientRect();
  var menuBottom = menuRect.bottom + window.scrollY;
  var menuHeight = menuRect.height;
  articles.forEach(function (article) {
    var nameToTop = article.querySelector('.M_Name_and_Cross_Article');
    var textArticle = article.querySelector('.A_Text_of_Article');
    var picArticle = article.querySelector('.A_Pic_for_Article');
    if (textArticle.currentStyle ? textArticle.currentStyle.display : getComputedStyle(textArticle, null).display == 'none') {}
    if (!nameToTop || !textArticle) return;
    window.addEventListener('scroll', function () {
      if (getComputedStyle(textArticle, null).display == 'none') {
        return;
      }
      // Получаем позиции элементов
      var articleRect = article.getBoundingClientRect();
      var articleTop = articleRect.top + window.scrollY;
      var articleBottom = articleRect.bottom + window.scrollY;
      var nameToTopHeight = nameToTop.offsetHeight;

      // Сохраняем исходное положение
      var originalTop = nameToTop.offsetTop;
      var isFixed = false;
      var scrollY = window.scrollY;
      var nameToTopRect = nameToTop.getBoundingClientRect();

      // Точка, где заголовок должен зафиксироваться
      var stickPoint = picArticle.getBoundingClientRect().bottom + window.scrollY - menuHeight;
      // Точка, где заголовок должен открепиться
      //const releasePoint = articleBottom - nameToTopHeight - menuHeight;
      var releasePoint = articleBottom - nameToTopHeight - menuHeight;

      // Если скролл дошел до точки фиксации, но не дошел до точки освобождения
      if (scrollY >= stickPoint && scrollY <= releasePoint) {
        if (!isFixed) {
          nameToTop.style.position = 'fixed';
          nameToTop.style.top = "".concat(menuBottom, "px");
          nameToTop.style.width = "".concat(articleRect.width, "px");
          nameToTop.style.zIndex = '10';
          isFixed = true;
        }
      }
      // Если скролл выше точки фиксации
      else if (scrollY < stickPoint) {
        nameToTop.style.position = 'static';
        nameToTop.style.top = '';
        nameToTop.style.width = '';
        nameToTop.style.zIndex = '';
        isFixed = false;
      }
      // Если скролл ниже точки освобождения
      else {
        nameToTop.style.position = 'fixed';
        nameToTop.style.top = "".concat(articleBottom - nameToTopHeight - scrollY, "px");
        nameToTop.style.width = "".concat(articleRect.width, "px");
        nameToTop.style.zIndex = '10';
        isFixed = false;
      }
    });
  });
});
/******/ })()
;