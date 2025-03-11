import '../index.css'

//ТУТ СЛАЙДЕР
document.addEventListener("DOMContentLoaded", function() {
    //Slider function
    let A_Images_in_Slider = document.querySelectorAll('.A_Images_in_Slider img');
    let currentIndexpage = 0;
  
    function updateContentpage() {
        A_Images_in_Slider.forEach(function(img, index) {
            img.classList.toggle('activ_img', index === currentIndexpage);
        });
    }
  
    let nextButtonp = document.querySelector('.A_Arrow_Forwards');
    let prevButtonp = document.querySelector('.A_Arrow_Backwards');
  
    if (nextButtonp && prevButtonp) {
        nextButtonp.addEventListener('click', function() {
          console.log(123)
            currentIndexpage = (currentIndexpage + 1) % A_Images_in_Slider.length;
            updateContentpage();
        });
        prevButtonp.addEventListener('click', function() {
            currentIndexpage = (currentIndexpage - 1 + A_Images_in_Slider.length) % A_Images_in_Slider.length;
            updateContentpage();
        });
        updateContentpage();
    }
  
  
  
    const text = document.querySelector('.clickTxt')
    const next = document.querySelector('.A_Arrow_Forwards')
    const previous = document.querySelector('.A_Arrow_Backwards')
    const amount = document.querySelector('#Image_len')
  
    let cnt = 0;
    const pic_cnt = Number(amount.innerHTML);
  
    next.addEventListener('click', () => {
        cnt++;
        cnt %= pic_cnt
        text.innerHTML = `${cnt + 1}`;
    })
    previous.addEventListener('click', () => {
        cnt--;
        cnt += pic_cnt
        cnt %= pic_cnt
        text.innerHTML = `${cnt + 1}`;
    })
})