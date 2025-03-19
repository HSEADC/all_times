class Period {
    constructor (period_str) {
        if (period_str[4] == 'е') {
            this.bottom = Number(period_str.slice(0, 4))
            this.upper = this.bottom + 9
        } else {
            this.bottom = Number(period_str)
            this.upper = this.bottom
        }
    }

    includes(year) {
        return (this.bottom <= Number(year)) && (Number(year) <= this.upper)
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const FilterButtons = document.querySelectorAll(".Filter");
    const Cards = document.querySelectorAll(".O_Manifest_Card");
    const Backs = document.querySelectorAll(".Back_to_Main_Clock");

    FilterButtons.forEach((FilterButton) => {
        FilterButton.addEventListener("click", (event) => {
            const period_str = FilterButton.innerHTML;
            const period = new Period(period_str);
            const ourdiv = document.querySelector(".W_Manifests_Container");
            
            Cards.forEach((card) => {
                const year = card.querySelector(".Year").innerHTML;
                let flag = true;
                
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
            ourdiv.scrollIntoView({ behavior: "smooth", block: "start", inline: "nearest"});
            
        });
    });

    Backs.forEach((Back) => {
        Back.addEventListener("click", (event) => {
            Cards.forEach((card) => {
                card.style.display = 'flex';
            });
        });
    });
});