// Ищем карточки и тексты, создаем массивы
var manifests = [...document.querySelectorAll('.O_Manifest_Card')];
var names = [...document.querySelectorAll('.Name')];
const search_input = document.querySelector('#search');

console.log(manifests.length);
console.log(names.length);

document.addEventListener("keydown", event => {

});

search_input.addEventListener('input', () => {
    const query = search_input.value.toLowerCase();
    let first_displayed = -1;
    //проходимся по имени и индексам
    names.forEach((name, index) => {
        if (name.textContent.toLowerCase().includes(query)) {
            if (first_displayed === -1) {
                first_displayed = index;
            }
            manifests[index].style.display = 'flex'; // Показываем карточку, если текст совпадает
        } else {
            manifests[index].style.display = 'none'; // Скрываем карточку, если текст не совпадает
        }
    });
    document.addEventListener('keydown', event => {
        if (event.code === 'Enter' && first_displayed >= 0) {
            manifests[first_displayed].scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest"});
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