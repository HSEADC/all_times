/******/ (() => { // webpackBootstrap
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Ищем карточки и тексты, создаем массивы
var manifests = _toConsumableArray(document.querySelectorAll('.O_Manifest_Card'));
var names = _toConsumableArray(document.querySelectorAll('.Name'));
var search_input = document.querySelector('#search');
console.log(manifests.length);
console.log(names.length);
document.addEventListener("keydown", function (event) {});
search_input.addEventListener('input', function () {
  var query = search_input.value.toLowerCase();
  var first_displayed = -1;
  //проходимся по имени и индексам
  names.forEach(function (name, index) {
    if (name.textContent.toLowerCase().includes(query)) {
      if (first_displayed === -1) {
        first_displayed = index;
      }
      manifests[index].style.display = 'flex'; // Показываем карточку, если текст совпадает
    } else {
      manifests[index].style.display = 'none'; // Скрываем карточку, если текст не совпадает
    }
  });
  document.addEventListener('keydown', function (event) {
    if (event.code === 'Enter' && first_displayed >= 0) {
      manifests[first_displayed].scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    }
  });
});

// //ховер для инфо блока
// document.addEventListener('DOMContentLoaded', function () {
//     const cards = document.querySelectorAll('.O_Manifest_Card');
//     const pics = document.querySelectorAll('.A_Picture');

//     cards.forEach(function (cards, pics) {
//         cards.addEventListener('mouseenter', () => {
//             pics.style.backgroundColor = 'rgb(0, 42, 255)';
//             pics.style.mixBlendMode = 'difference';
//         })
//         cards.addEventListener('mouseleave', () => {
//             pics.style.backgroundColor = 'none';
//         })
//     })

// })

/*
document.addEventListener('DOMContentLoaded', function () {
    const cards = document.querySelectorAll('.O_Manifest_Card');

    cards.forEach((card) => {
        const pic = card.querySelector('.A_Picture'); // Ищем картинку внутри карточки

        if (!pic) {
            console.warn('Картинка не найдена внутри карточки:', card);
            return; // Пропускаем эту карточку
        }

        card.addEventListener('mouseenter', () => {
            pic.style.filter = 'brightness(50%) contrast(150%) hue-rotate(90deg)'; // Пример эффекта для изображения
            pic.style.mixBlendMode = 'difference';
        });

        card.addEventListener('mouseleave', () => {
            pic.style.filter = 'none'; // Сбрасываем эффекты
            pic.style.mixBlendMode = 'normal';
        });
    });
});*/
/******/ })()
;