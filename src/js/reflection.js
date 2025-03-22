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