var Messagestack = function () {

    var self = this;
    var stack = [];
    var isVisible = false;


    var popup = document.getElementById("popup");
    popup.addEventListener("animationend", animationEnd);

    _constructor = function () {
        stack = [];
        setInterval(checkStack, 100);
    }

    this.Push = function (item) {
        stack.push(item);
    }

    this.Reset = function () {
        popup.classList.add("hidden");
        popup.classList.remove("fadeIn");
        stack = [];
        var isVisible = false;
    }


    function animationEnd(event) {
        if (event !== undefined) {
            event.target.classList.add("hidden");
            event.target.classList.remove("fadeIn");
            isVisible = false;
        }
    }

    function checkStack() {
        if (!isVisible && stack.length > 0) {

            if (sfx !== undefined) {
                sfx.popup.play();
            }
            var item = stack[0];

            document.getElementById("name").innerHTML = "<span class='rarity_" + item.level + "'>" + item.name + "</span>" || " ";
            document.getElementById("icon").setAttribute("src", item.image);
            document.getElementById("blurb").innerText = item.blurb || " ";
            document.getElementById("value").innerHTML = item.value + "<img src='graphics/coin.png'/>" || " ";

            document.getElementById("popup").classList.add("fadeIn");
            document.getElementById("popup").classList.remove("hidden");

            stack.splice(0, 1);
            isVisible = true;
        }
    }

    _constructor();
}
