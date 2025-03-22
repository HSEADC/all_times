document.addEventListener("DOMContentLoaded", () => {
    const crosses = document.querySelectorAll('.A_Button_Article');
    const articles = document.querySelectorAll('.A_Text_of_Article');

    crosses.forEach((cross) => {
        cross.addEventListener("click", (event) => {
            articles.forEach((article) => {
                if (article.style.display === 'none') {
                    article.style.display = 'flex'; // Показываем статью
                    cross.style.transform = "rotate(45deg)";
                    // cross.classList.add('.A_Smoth_Rotate');
                } else {
                    article.style.display = 'none'; // Скрываем статью
                    cross.style.transform = "rotate(0deg)";
                }
            });
        });
    });




});


//Рандомное позиционирование иконки
document.addEventListener('DOMContentLoaded', function () {
    const Img_Icon = document.querySelectorAll('.Random_Position_Article_Icon');
    const max = 80;

    Img_Icon.forEach(el => {
        el.style.left = `${Math.floor(Math.random()*(max + 1))}%`
        el.style.top = `${Math.floor(Math.random()*(max + 1))}%`
    })

    const gifka = document.querySelectorAll('.A_Gifka')

    Img_Icon.forEach((el) => {
        el.addEventListener('mouseenter', () => {
            gifka.forEach(elem => {
                elem.style.display = 'block';  // Показываем блок
            })
        });
    })
})
  

// //ховер для инфо блока
// document.addEventListener('DOMContentLoaded', function () {
//     const Info_Icon = document.querySelector('.A_Info_Icon');
//     const infBlck = document.querySelector('.A_Info_Block');
  
//     Info_Icon.addEventListener('mouseenter', () => {
//       infBlck.style.display = 'block';  // Показываем блок
//     });
  
//     Info_Icon.addEventListener('mouseleave', () => {
//       infBlck.style.display = 'none';  // Скрываем блок
//     });
  
// })
