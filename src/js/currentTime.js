import '../index.css'

document.addEventListener("DOMContentLoaded", () => {

    var div = document.querySelector('.A_dateandtime');

    setInterval(function() {
        var date = new Date;
        div.innerHTML = date.toLocaleString();
    }, 1000);


    //рандом перебор картинок
    let time_icon = document.querySelector('.A_Time_Icon');
    let gif_and_time = document.querySelector('.O_Gif_and_Time');
    let menu_hide = document.querySelector('.C_Menu_Bar') 
    let icon_leave = document.querySelector('.A_Time_Icon_Close');
    const gif_paths = ['A_Background_Time_1.gif', 'A_Background_Time_2.gif', 'A_Background_Time_3.gif'];

    time_icon.addEventListener("mouseenter", () => {
        let gif_num = Math.floor(Math.random() * gif_paths.length);
        gif_and_time.style.display = 'flex';    
        // gif_and_time.style.backgroundColor = 'brown';
        gif_and_time.style.backgroundImage = "url('https://raw.githubusercontent.com/HSEADC/all_times/refs/heads/main/src/images/".concat(gif_paths[gif_num]).concat("')");
        menu_hide.style.display = 'none';

    });
    // time_icon.addEventListener("mouseleave", () => {
    //     gif_and_time.style.display = 'none';
    // });
    icon_leave.addEventListener("mouseenter", () => {
        gif_and_time.style.display = 'none';
        menu_hide.style.display = 'flex';
    });

    
});

