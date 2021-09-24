const STAR_DENSITY = 0.003;
const STAR_R_MIN = 0.1;
const STAR_R_MAX = 1.5;
const SCROLL_MIN = 0.0;
const SCROLL_MAX = 0.125;

//  Move to content box with id of key press (encyclopedia)
document.addEventListener('keypress', keyPressed);
function keyPressed(e) {
    document.getElementById(e.key).scrollIntoView();
}

//  Generate and draw stars
let stars;
function initializeCanvas() {
    var canvas = document.getElementById("stars");
    canvas.style.width ='100%';
    canvas.style.height ='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}
function createStars() {
    //  Get max window resolution to handle resizing corner cases
    let w = window.screen.width * window.devicePixelRatio;
    let h = window.screen.height * window.devicePixelRatio;
    let area = w * h;
    let starCount = area * STAR_DENSITY;
    stars = [];
    // resetSeed();
    for (let i = 0; i < starCount; i++) {
        let x = Math.random() * w;
        let y = Math.random() * h;
        let r = STAR_R_MIN + Math.random() * Math.random() * (STAR_R_MAX - STAR_R_MIN);
        let scroll = SCROLL_MIN + Math.random() * (SCROLL_MAX - SCROLL_MIN);
        stars.push({x: x, y: y, r: r, scroll: scroll});
    }
}
function drawStars() {
    var canvas = document.getElementById("stars");
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.beginPath();
    let content = document.getElementById("content");


    let position = content.scrollTop;
    let viewHeight = content.clientHeight;
    let totalHeight = content.scrollHeight;
    let totalScroll = totalHeight - viewHeight;
    let offset = Math.ceil(totalScroll / canvas.height) * canvas.height;

    for (let i = 0; i < stars.length; i++) {
        let s = stars[i];
        let y = (s.y + offset - s.scroll * position) % canvas.height;
        context.moveTo(s.x, y);
        context.arc(s.x, y, s.r, 0, TAU);
    }
    context.fillStyle = "white";
    context.fill();
    context.closePath();
}
document.getElementById("content").addEventListener("scroll", function() {
    drawStars();
});
window.onresize = function() {
    initializeCanvas();
    drawStars();
}




const COLOR_INCREMENT = 0.0005;
const COLOR_UPDATE_MS = 50;
const TAU = 2 * Math.PI;
const COLOR_CONST = 255 / 2;
let colorPosition = 0;
function valueAtPosition(position) {
    return Math.round(COLOR_CONST * (1 + Math.sin(TAU * (position))));
}
function rgb(r, g, b, a) {
    return "rgb(" + r + ", " + g + ", " + b + ")";
}
function rgba(r, g, b, a) {
    return "rgba(" + r + ", " + g + ", " + b + ", " + a + ")";
}
function updateColorCycle() {
    let r = valueAtPosition(colorPosition + 2/3);
    let g = valueAtPosition(colorPosition);
    let b = valueAtPosition(colorPosition + 1/3);
    let buttons = document.getElementsByClassName("nav-button");
    let title = document.getElementById("title");
    let textColor = rgb(r, g, b);
    title.style.color = textColor;
    for (let i = 0; i < buttons.length; i++) {
        let buttonText = buttons[i].firstChild;
        buttonText.style.color = textColor;
    }
    colorPosition += COLOR_INCREMENT;
}


//  Page load
window.onload = async function() {
    setInterval(updateColorCycle, COLOR_UPDATE_MS);
    //  If someone tries to access the page with an incomplete url, direct to default page
    if (!window.location.search) {
        window.location.href += "?nav/truth_ii.html";
    }
    let path = window.location.search.substring(1);
    addLinkListeners(document.getElementById("nav-bar"));
    loadContent(path, true);
    initializeCanvas();
    createStars();
    drawStars();
}
async function loadContent(path, add) {
    if (add) {
        history.pushState(path, null, "index.html?" + path);
    }

    let html = await contentHTML(path);
    let titleIndex = html.search('\n');
    let title = document.getElementById("title");
    document.title = title.innerHTML = html.substring(0, titleIndex);
    let content = document.getElementById("content");
    content.innerHTML = html.substring(titleIndex);
    
    //  Move to element id passed through url
    //  e.g. index.html?nav/enc#f
    let hashtagID = window.location.hash;
    if (hashtagID) {
        hashtagID = hashtagID.replace("#", "");
        document.getElementById(hashtagID).scrollIntoView();
    } else {
        content.scrollTop = 0;
    }
    addLinkListeners(content);
}
async function contentHTML(path) {
    let url = window.location.href;
    let cutIndex = url.indexOf("index.html");
    let dataPath = url.substring(0, cutIndex) + path;

    return fetch(dataPath).then(response => response.text());
}
function addLinkListeners(element) {
    let links = element.getElementsByClassName("link");
    for (let i = 0; i < links.length; i++) {
        let link = links[i];
        link.addEventListener('click', function (event) {
            loadContent(link.dataset.path, true);
        });
    }
}



// const a = 1103515245;
// const c = 12345;
// const m = 2**31;
// let seed;
// function resetSeed() {
//     seed = 1;
// }
// function rand() {
//     seed = (a * seed + c) % m;
//     return seed / m;
// }


window.onpopstate = function (event) {
    if (event.state) {
        loadContent(event.state, false);
    }
}
