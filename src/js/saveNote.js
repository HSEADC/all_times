const downloadToFile = (content, filename, contentType) => {
    const a = document.createElement('a');
    const file = new Blob([content], {type: contentType});
    
    a.href= URL.createObjectURL(file);
    a.download = filename;
    a.click();
    
    URL.revokeObjectURL(a.href);
  };
  
document.querySelector('#btnSave').addEventListener('click', () => {
    const textArea = document.querySelector('textarea');
    
    downloadToFile(textArea.value, 'заметки_к_манифесту.txt', 'text/plain');
});


// document.addEventListener('DOMContentLoaded', function () {
//   const NoteToTop = document.querySelector('.M_Notes')
//   // const top = NoteToTop.offsetTop
//   const block = document.querySelector('.O_Notes_and_Links')
//   const menu = document.querySelector('.C_Menu_Bar')
//   menu.offsetBottom = menu.offsetTop + menu.offsetHeight

//   const top = block.offsetTop

//   window.addEventListener('scroll', function () {
//     if (top <= window.scrollY) {
//       NoteToTop.style.position = 'block'
//       // block.style.position ='fixed'
//       NoteToTop.style.top = '0'
//       NoteToTop.style.zIndex = '10'
//       NoteToTop.style.padding = '1vw 3vw'
//       //console.log(123)
//     } else {
//       NoteToTop.style.position = ''
//       NoteToTop.style.top = ''
//       NoteToTop.style.zIndex = ''
//       NoteToTop.style.padding = '1vw 3vw'
//     }
//   })
// })

function getPosition(elem){
  var dims = {offsetLeft:0, offsetTop:0};
  do {
      dims.offsetLeft += elem.offsetLeft;
      dims.offsetTop += elem.offsetTop;
  }
  while (elem = elem.offsetParent);
  return dims;
}

document.addEventListener('DOMContentLoaded', function () {
  const NoteToTop = document.querySelector('.M_Notes');
  const block = document.querySelector('.O_Notes_and_Links');
  const menu = document.querySelector('.C_Menu_Bar');
  const links = document.querySelector('.M_Links');

  // Вычисляем нижнюю границу элемента menu
  const menuTop = getPosition(menu).offsetTop;
  const menuBottom = getPosition(menu).offsetTop + menu.offsetHeight;

  // Получаем верхнюю границу элемента block
  const blockTop = getPosition(block).offsetTop;
    // Получаем верхнюю границу элемента M_Links
  const linksTop = getPosition(links).offsetTop;
  const stopPoint = linksTop - NoteToTop.offsetHeight;

  window.addEventListener('scroll', function () {
    // Получаем текущую позицию прокрутки
    const scrollY = window.scrollY;

    // Проверяем, достигли ли верхней границы блока
    if (scrollY + menuBottom >= blockTop) {
      // Если достигли, фиксируем NoteToTop у верхней границы блока
      NoteToTop.style.position = 'block';
      NoteToTop.style.top = `${menuBottom}px`; // Позиционируем под меню
      NoteToTop.style.zIndex = '10';
      // console.log(scrollY, stopPoint, menuBottom, blockTop)
      // Если NoteToTop достиг верхней границы links, останавливаем его
      if (scrollY >= stopPoint) {
        NoteToTop.style.zIndex = '8';
        NoteToTop.style.top = `${stopPoint - scrollY + menuBottom}px`;
      }
    } 

    else {
      // Иначе сбрасываем стили
      NoteToTop.style.position = '';
      NoteToTop.style.top = '';
      NoteToTop.style.zIndex = '';
    }
  });
});

