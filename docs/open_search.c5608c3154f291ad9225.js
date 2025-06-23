/******/ (() => { // webpackBootstrap
document.addEventListener('DOMContentLoaded', function () {
  var search = document.querySelectorAll('.A_Search_Container');
  search.forEach(function (el) {
    el.addEventListener("click", function (event) {
      window.location.href = '/search.html';
    });
  });
});
/******/ })()
;