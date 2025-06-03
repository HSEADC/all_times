/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _classCallCheck(a, n) { if (!(a instanceof n)) throw new TypeError("Cannot call a class as a function"); }
function _defineProperties(e, r) { for (var t = 0; t < r.length; t++) { var o = r[t]; o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o); } }
function _createClass(e, r, t) { return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", { writable: !1 }), e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }

var Period = /*#__PURE__*/function () {
  function Period(period_str) {
    _classCallCheck(this, Period);
    if (period_str[4] == 'е') {
      this.bottom = Number(period_str.slice(0, 4));
      this.upper = this.bottom + 9;
    } else {
      this.bottom = Number(period_str);
      this.upper = this.bottom;
    }
  }
  return _createClass(Period, [{
    key: "includes",
    value: function includes(year) {
      return this.bottom <= Number(year) && Number(year) <= this.upper;
    }
  }]);
}();
document.addEventListener("DOMContentLoaded", function () {
  var FilterButtons = document.querySelectorAll(".Filter");
  var Cards = document.querySelectorAll(".O_Manifest_Card");
  var Backs = document.querySelectorAll(".Back_to_Main_Clock");
  FilterButtons.forEach(function (FilterButton) {
    FilterButton.addEventListener("click", function (event) {
      var period_str = FilterButton.innerHTML;
      var period = new Period(period_str);
      var ourdiv = document.querySelector(".W_Manifests_Container");
      Cards.forEach(function (card) {
        var year = card.querySelector(".Year").innerHTML;
        var flag = true;
        if (period.includes(year)) {
          /*if (flag) {
              card.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest"});
              flag = false;
          }*/
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
      //ПЕРЕМЕЩЕНИЕ К ПЕРВОЙ НАЙДЕННОЙ КАРТОЧКЕ
      ourdiv.scrollIntoView({
        behavior: "smooth",
        block: "start",
        inline: "nearest"
      });
    });
  });
  Backs.forEach(function (Back) {
    Back.addEventListener("click", function (event) {
      Cards.forEach(function (card) {
        card.style.display = 'flex';
      });
    });
  });
});
/******/ })()
;