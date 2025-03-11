/******/ (() => { // webpackBootstrap
//ЧАСЫ ПРОБУЮ
//document.querySelector('.Twenties').addEventListener('click', function () {
//addEventListener("mousemove", (event) => {});

// стрелочка
document.addEventListener("DOMContentLoaded", function (event) {
  document.addEventListener("mousemove", function (event) {
    handleMouseMove(event);
  });
  function handleMouseMove(event) {
    var hands = document.querySelectorAll(".A_Hand");
    var oClocks = document.querySelectorAll(".O_Clock");
    // получаем все эленты с классом .eye
    oClocks.forEach(function (oClock) {
      var hand = oClock.querySelector(".A_Hand");
      var oClockRect = oClock.getBoundingClientRect();
      // .getBoundingClientRect() - метод который 
      // возвращает координаты в контексте окна
      var deltaX = event.clientX - (oClockRect.left + oClockRect.right) / 2;
      var deltaY = event.clientY - (oClockRect.bottom + oClockRect.top) / 2;

      // далее вычисляем угол между курсором и центром глаза
      var radian = Math.atan2(deltaX, deltaY);
      var rotation = radian * (180 / Math.PI) * -1 + 360;
      // поворачиваем глаза в направлении курсора
      hand.style.transform = "rotate(".concat(rotation + 90, "deg)");
    });
    /*hands.forEach(function(hand){
        let oClockRect = oClock.getBoundingClientRect();
        // .getBoundingClientRect() - метод который 
        // возвращает координаты в контексте окна 
        let deltaX = event.clientX - (oClockRect.left + oClockRect.right) / 2;
        let deltaY = event.clientY - (oClockRect.bottom + oClockRect.top) / 2;
          // далее вычисляем угол между курсором и центром глаза
        let radian = Math.atan2(deltaX, deltaY);
        let rotation = (radian * (180 / Math.PI ) * -1) + 360;
        // поворачиваем глаза в направлении курсора
        hand.style.transform = `rotate(${rotation + 90}deg)`;
    });*/

    var O_Clock = document.querySelector(".O_Clock");
    O_Clock.addEventListener("mousemove", handleMouseMove);

    ///перенесли сюда иконку ховера тк вне функции стрелки она не работает
    var Info_Icon = document.querySelector('.A_Info_Icon');
    var infBlck = document.querySelector('.A_Info_Block');
    Info_Icon.addEventListener('mouseenter', function () {
      infBlck.style.display = 'block'; // Показываем блок
    });
    Info_Icon.addEventListener('mouseleave', function () {
      infBlck.style.display = 'none'; // Скрываем блок
    });
  }
  ;
});

// ПЕРЕХОД НА 20Е
document.querySelector('.Twenties').addEventListener('click', function () {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Twenties_Display_Time = document.querySelectorAll('.Twenties_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var Clock_2020 = document.querySelector('.Clock_2020');

  // Перебираем все элементы с классом .A_Time и скрываем их
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'none'; // 'none' в кавычках
  });
  Clock_Main.style.display = 'none';
  Twenties_Display_Time.forEach(function (element) {
    element.style.display = 'block';
  });
  Clock_2020.style.display = 'block';
});

//КНОПКА БЭК НА 20Х
//везде одна и та же кнопка бэк
document.querySelectorAll('.Back_to_Main_Clock').forEach(function (e) {
  e.addEventListener('click', function () {
    BackFunc();
  });
});
function BackFunc() {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var Twenties_Display_Time = document.querySelectorAll('.Twenties_Display_Time');
  var Clock_2020 = document.querySelector('.Clock_2020');
  var NineteenTen_Display_Time = document.querySelectorAll('.NineteenTen_Display_Time');
  var Clock_1910 = document.querySelector('.Clock_1910');
  var NineteenTwenty_Display_Time = document.querySelectorAll('.NineteenTwenty_Display_Time');
  var Clock_1920 = document.querySelector('.Clock_1920');
  var NineteenThirty_Display_Time = document.querySelectorAll('.NineteenThirty_Display_Time');
  var Clock_1930 = document.querySelector('.Clock_1930');
  var NineteenFourty_Display_Time = document.querySelectorAll('.NineteenFourty_Display_Time');
  var Clock_1940 = document.querySelector('.Clock_1940');
  var NineteenFifty_Display_Time = document.querySelectorAll('.NineteenFifty_Display_Time');
  var Clock_1950 = document.querySelector('.Clock_1950');
  var NineteenSixty_Display_Time = document.querySelectorAll('.NineteenSixty_Display_Time');
  var Clock_1960 = document.querySelector('.Clock_1960');
  var NineteenSeventy_Display_Time = document.querySelectorAll('.NineteenSeventy_Display_Time');
  var Clock_1970 = document.querySelector('.Clock_1970');
  var NineteenEighty_Display_Time = document.querySelectorAll('.NineteenEighty_Display_Time');
  var Clock_1980 = document.querySelector('.Clock_1980');
  var NineteenNinety_Display_Time = document.querySelectorAll('.NineteenNinety_Display_Time');
  var Clock_1990 = document.querySelector('.Clock_1990');
  var TwoThousand_Display_Time = document.querySelectorAll('.TwoThousand_Display_Time');
  var Clock_2000 = document.querySelector('.Clock_2000');
  var TwentyTen_Display_Time = document.querySelectorAll('.TwentyTen_Display_Time');
  var Clock_2010 = document.querySelector('.Clock_2010');

  // Перебираем все элементы с классом .A_Time и скрываем их
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'block'; // 'none' в кавычках
  });
  Clock_Main.style.display = 'block';
  Twenties_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_2020.style.display = 'none';
  NineteenTen_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_1910.style.display = 'none';
  NineteenTwenty_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_1920.style.display = 'none';
  NineteenThirty_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_1930.style.display = 'none';
  NineteenFourty_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_1940.style.display = 'none';
  NineteenFifty_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_1950.style.display = 'none';
  NineteenSixty_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_1960.style.display = 'none';
  NineteenSeventy_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_1970.style.display = 'none';
  NineteenEighty_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_1980.style.display = 'none';
  NineteenNinety_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_1990.style.display = 'none';
  TwoThousand_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_2000.style.display = 'none';
  TwentyTen_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_2010.style.display = 'none';
}

// ПЕРЕХОД НА 1910Е
document.querySelector('.NineteenTen').addEventListener('click', function () {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var NineteenTen_Display_Time = document.querySelectorAll('.NineteenTen_Display_Time');
  var Clock_1910 = document.querySelector('.Clock_1910');
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_Main.style.display = 'none';
  NineteenTen_Display_Time.forEach(function (element) {
    element.style.display = 'block';
  });
  Clock_1910.style.display = 'block';
});

// ПЕРЕХОД НА 1920Е
document.querySelector('.NineteenTwenty').addEventListener('click', function () {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var NineteenTwenty_Display_Time = document.querySelectorAll('.NineteenTwenty_Display_Time');
  var Clock_1920 = document.querySelector('.Clock_1920');
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_Main.style.display = 'none';
  NineteenTwenty_Display_Time.forEach(function (element) {
    element.style.display = 'block';
  });
  Clock_1920.style.display = 'block';
});

// ПЕРЕХОД НА 1930Е
document.querySelector('.NineteenThirty').addEventListener('click', function () {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var NineteenThirty_Display_Time = document.querySelectorAll('.NineteenThirty_Display_Time');
  var Clock_1930 = document.querySelector('.Clock_1930');
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_Main.style.display = 'none';
  NineteenThirty_Display_Time.forEach(function (element) {
    element.style.display = 'block';
  });
  Clock_1930.style.display = 'block';
});

// ПЕРЕХОД НА 1940Е
document.querySelector('.NineteenFourty').addEventListener('click', function () {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var NineteenFourty_Display_Time = document.querySelectorAll('.NineteenFourty_Display_Time');
  var Clock_1940 = document.querySelector('.Clock_1940');
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_Main.style.display = 'none';
  NineteenFourty_Display_Time.forEach(function (element) {
    element.style.display = 'block';
  });
  Clock_1940.style.display = 'block';
});

// ПЕРЕХОД НА 1950Е
document.querySelector('.NineteenFifty').addEventListener('click', function () {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var NineteenFifty_Display_Time = document.querySelectorAll('.NineteenFifty_Display_Time');
  var Clock_1950 = document.querySelector('.Clock_1950');
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_Main.style.display = 'none';
  NineteenFifty_Display_Time.forEach(function (element) {
    element.style.display = 'block';
  });
  Clock_1950.style.display = 'block';
});

// ПЕРЕХОД НА 1960Е
document.querySelector('.NineteenSixty').addEventListener('click', function () {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var NineteenSixty_Display_Time = document.querySelectorAll('.NineteenSixty_Display_Time');
  var Clock_1960 = document.querySelector('.Clock_1960');
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_Main.style.display = 'none';
  NineteenSixty_Display_Time.forEach(function (element) {
    element.style.display = 'block';
  });
  Clock_1960.style.display = 'block';
});

// ПЕРЕХОД НА 1970Е
document.querySelector('.NineteenSeventy').addEventListener('click', function () {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var NineteenSeventy_Display_Time = document.querySelectorAll('.NineteenSeventy_Display_Time');
  var Clock_1970 = document.querySelector('.Clock_1970');
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_Main.style.display = 'none';
  NineteenSeventy_Display_Time.forEach(function (element) {
    element.style.display = 'block';
  });
  Clock_1970.style.display = 'block';
});

// ПЕРЕХОД НА 1980Е
document.querySelector('.NineteenEighty').addEventListener('click', function () {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var NineteenEighty_Display_Time = document.querySelectorAll('.NineteenEighty_Display_Time');
  var Clock_1980 = document.querySelector('.Clock_1980');
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_Main.style.display = 'none';
  NineteenEighty_Display_Time.forEach(function (element) {
    element.style.display = 'block';
  });
  Clock_1980.style.display = 'block';
});

// ПЕРЕХОД НА 1990Е
document.querySelector('.NineteenNinety').addEventListener('click', function () {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var NineteenNinety_Display_Time = document.querySelectorAll('.NineteenNinety_Display_Time');
  var Clock_1990 = document.querySelector('.Clock_1990');
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_Main.style.display = 'none';
  NineteenNinety_Display_Time.forEach(function (element) {
    element.style.display = 'block';
  });
  Clock_1990.style.display = 'block';
});

// ПЕРЕХОД НА 2000Е
document.querySelector('.TwoThousand').addEventListener('click', function () {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var TwoThousand_Display_Time = document.querySelectorAll('.TwoThousand_Display_Time');
  var Clock_2000 = document.querySelector('.Clock_2000');
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_Main.style.display = 'none';
  TwoThousand_Display_Time.forEach(function (element) {
    element.style.display = 'block';
  });
  Clock_2000.style.display = 'block';
});

// ПЕРЕХОД НА 2010Е
document.querySelector('.TwentyTen').addEventListener('click', function () {
  var Main_Display_Time = document.querySelectorAll('.Main_Display_Time');
  var Clock_Main = document.querySelector('.Clock_Main');
  var TwentyTen_Display_Time = document.querySelectorAll('.TwentyTen_Display_Time');
  var Clock_2010 = document.querySelector('.Clock_2010');
  Main_Display_Time.forEach(function (element) {
    element.style.display = 'none';
  });
  Clock_Main.style.display = 'none';
  TwentyTen_Display_Time.forEach(function (element) {
    element.style.display = 'block';
  });
  Clock_2010.style.display = 'block';
});
/******/ })()
;