// function setBacking() {
//     let backing = document.getElementById("backing");
//     let content = document.getElementById("content");
//     backing.style.height = content.scrollHeight + "px";
//     let rect = content.getBoundingClientRect();
//     backing.style.top = content.style.top + content.scrollTop + "px";
//     backing.style.height = rect.height + "px";
// }


document.getElementById("content").addEventListener("scroll", function() {
    drawStars();
});

window.onresize = function() {
    initializeCanvas();
    drawStars();
}

document.addEventListener('keypress', keyPressed);

function keyPressed(e) {
    document.getElementById(e.key).scrollIntoView();
}

const STAR_DENSITY = 0.003;
const STAR_R_MIN = 0.1;
const STAR_R_MAX = 1.5;
const TAU = 2 * Math.PI;
const SCROLL_MIN = 0.0;
const SCROLL_MAX = 0.125;

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
    let offset = document.getElementById("content").scrollTop;
    let maxScroll = document.getElementById("content").scrollHeight * SCROLL_MAX;
    for (let i = 0; i < stars.length; i++) {
        let s = stars[i];
        let y = (s.y + maxScroll - s.scroll * offset) % canvas.height;
        context.moveTo(s.x, y);
        context.arc(s.x, y, s.r, 0, TAU);
    }
    context.fillStyle = "white";
    context.fill();
    context.closePath();

    // context.beginPath();
    // let x = canvas.width * 0.5;
    // let y = -canvas.height;
    // let r = canvas.height * 1.5;
    // context.arc(x, y, r, 0, TAU);
    // context.fillStyle = "black";
    // context.fill();
    // context.closePath();
}

window.onload = async function() {
    initializeCanvas();
    createStars();
    drawStars();
    //  If someone tries to access the page with an incomplete url, direct to default page
    //  Included to help site load properly whether loaded locally or from server
    let url = window.location.href;
    if (url == "https://truth-ii.kent-gardner.org/") {
        url = window.location.href = "https://truth-ii.kent-gardner.org/index.html?path=nav/gifts";
    }
    else if (!url.includes("?")) {
        url = window.location.href = "http://127.0.0.1:5500/index.html?path=nav/gifts";
    }
    //  Get page data from url params
    let params = new URLSearchParams(window.location.search);
    let path = params.get("path");
    let data = await pageData(path);
    //  Insert hyperlinks into page data
    data = data.replaceAll(/\[.*]/g, function(match) {  //  'g' means global I guess?
        match = match.substring(1, match.length - 1);
        match = match.split(":");
        let link = "<a href=\"" + getLinkUrl(match[1]) + "\">" + match[0] + "</a>";
        return link;
    });
    //  Separate data by element 
    let lines = data.split("|");
    //  Get elements to be modified
    let h1 = document.getElementById("title");
    let content = document.getElementById("content");
    //  Set page titles
    let title = lines[0].trim();
    h1.innerHTML = title;
    document.title = "Truth II - " + title;
    // content.innerHTML = "<div class=\"content-box\"><h1>" + title + "</h1></div>";
    //  Set page content
    for (let i = 1; i < lines.length; i++) {
        line = lines[i];
        line = line.trim();

        let typeIndex = line.search(/\s/g);
        let type = line.substring(0, typeIndex);
        line = line.substring(typeIndex);

        let split = type.split(/\#/g);
        let id = "";
        if (split.length > 1) {
            type = split[0];
            id = " id=\"" + split[1] + "\"";
        }

        if (type != "i") {
            text = line.split("*");
            let note = text.length == 2;
            let contentHTML = "<" + type + id + ">" + text[0] + "</" + type + ">";
            let noteHTML = "<aside>" + (note ? text[1] : "" ) + "</aside>";
            let html = "<div class=\"content-box\">" + contentHTML + noteHTML + "</div>";
            content.innerHTML += html;
        }
    }
    //  Add nav hyperlinks, will be different on local or hosted page
    let urlPrefix = url.split("?")[0];
    let navButtons = document.getElementsByClassName("nav-button");
    for (let i = 0; i < navButtons.length; i++) {
        let a = navButtons[i].childNodes[0];
        a.setAttribute("href", urlPrefix + "?path=nav/" + a.getAttribute("href"));
    }
    //  Move to element id passerd through url
    let hashID = window.location.hash;
    if (hashID) {
        hashID = hashID.replace("#", "");
        document.getElementById(hashID).scrollIntoView();
    }
}





function getLinkUrl(path) {
    let url = window.location.href;
    let cutIndex = url.indexOf("?");
    return url.substring(0, cutIndex) + "?path=" + path;
}

async function pageData(path) {
    let url = window.location.href;
    let cutIndex = url.indexOf("index.html");
    let dataPath = url.substring(0, cutIndex) + path + ".txt";
    return fetch(dataPath).then(response => response.text());
}