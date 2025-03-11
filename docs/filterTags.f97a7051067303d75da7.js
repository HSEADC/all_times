/******/ (() => { // webpackBootstrap
console.log(123);
document.addEventListener('DOMContentLoaded', function () {
  initFilter();
});
function initFilter() {
  var tags = document.querySelectorAll('.A_FilterTag');
  // внутри А -- все, в Б -- конкретный элемент
  var a = document.querySelector('.all');
  tags.forEach(function (tag) {
    tag.addEventListener('click', function () {
      //клик на любой из тегов который не равен всем -- он активен, а остальные не подсвечены
      if (tag != a) {
        //при работе с клаасс лист точки не ставим
        a.classList.remove('active');
        tag.classList.toggle('active');
        console.log('здесь итерация по тегам');
        filterByTag();
      }
      var b = document.querySelectorAll('.active');
      //.contains -- проверка есть ли такой класс или нет
      if (tag == a && !tag.classList.contains('active')) {
        b.forEach(function (tag) {
          tag.classList.remove('active');
          console.log('тут функция вывода всех карточек');
          tag.classList.add('active');
        });
      }
      if (tags.length - 1 == b.length || b.length == 0) {
        b.forEach(function (tag) {
          tag.classList.remove('active');
        });
        a.classList.add('active');
        console.log('здесь будет функция вывода всех карточек');
        filterAll();
      }
    });
  });
}
function filterAll() {
  var cards = document.querySelectorAll('.O_ArticleCard');
  var activeTags = document.querySelectorAll('.active');
  activeTags.forEach(function (tag) {
    //ура учим сплит -- через сплит делаем массив карточек
    //classList -- only one class, className -- list of all tags
    var classList = tag.className.split(' ');
    if (tag.classList.contains('all')) {
      cards.forEach(function (card) {
        card.style.cssText = 'displat: block;';
      });
    }
  });
}
function filterByTag() {
  var cards = document.querySelectorAll('.O_ArticleCard');
  var activeTags = document.querySelectorAll('.active');
  var count;
  //make an empty array
  var tagList = [];
  cards.forEach(function (card) {
    card.style.cssText = 'display: none;';
  });
  activeTags.forEach(function (tag) {
    var classList = tag.className.split(' ');
    //ура учим сорт
    classList = classList.sort();
    count = 1;
    // console.log(classList)
    if (classList[1] == 'active') {
      count++;
    }
    for (var i = count; i < classList.length; i++) {
      //пушаем итый эл в список --потом проверим их наличие
      tagList.push(classList[i]);
    }
  });
  tagList.forEach(function (tagName) {
    cards.forEach(function (card) {
      //сравнение двух списков -- выбранный и карточный
      if (card.classList.contains(tagName)) {
        card.style.cssText = 'display: block;';
      }
    });
  });
}
/******/ })()
;