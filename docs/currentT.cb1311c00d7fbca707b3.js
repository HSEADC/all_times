/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var div = document.querySelector('.A_dateandtime');
  setInterval(function () {
    var date = new Date();
    div.innerHTML = date.toLocaleString();
  }, 1000);
  var time_icon = document.querySelector('.A_Time_Icon');
  var gif_and_time = document.querySelector('.O_Gif_and_Time');
  var gif_paths = ['../images/A_Background_Time_1.gif', '../images/A_Background_Time_2.gif'];
  time_icon.addEventListener("mouseenter", function () {
    var gif_num = Math.floor(Math.random() * gif_paths.length);
    gif_and_time.style.display = 'flex';
    // gif_and_time.style.backgroundColor = 'brown';
    gif_and_time.style.backgroundImage = "url('/src/images/A_Background_Time_1.gif')";
  });
  time_icon.addEventListener("mouseleave", function () {
    gif_and_time.style.display = 'none';
  });
});
/******/ })()
;