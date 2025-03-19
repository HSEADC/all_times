import '../index.css'

//отдельный чанк мэйн тк в манифест.жс он не видит флюксус
document.querySelector('.Fluxus').addEventListener('click', function() {
    location.href = 'manifests/fluxus.html';
});

document.querySelector('.Crujok').addEventListener('click', function() {
  location.href = 'manifests/crujok.html';
});

//ховер для инфо блока
document.addEventListener('DOMContentLoaded', function () {
    const Info_Icon = document.querySelector('.A_Info_Icon');
    const infBlck = document.querySelector('.A_Info_Block');
  
    Info_Icon.addEventListener('mouseenter', () => {
      infBlck.style.display = 'block';  // Показываем блок
    });
  
    Info_Icon.addEventListener('mouseleave', () => {
      infBlck.style.display = 'none';  // Скрываем блок
    });
  
})