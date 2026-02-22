// ==UserScript==
// @name     Terveysportti EasyPrint
// @match  https://www.ebm-guidelines.com/apps/dtk/ebmg/article/*
// @match  https://www.terveysportti.fi/apps/dtk/*/article/*
// @match  https://www.terveysportti.fi/apps/laake/*
// @namespace    http://tampermonkey.net/
// @version      2026-02-22
// @author       Shiyu Wang
// ==/UserScript==



// https://superuser.com/questions/1337469/grasemonkey-change-design-css
function GM_addPrintStyle(cssStr) {
    var n = document.createElement('style');
    n.type = "text/css";
    n.innerHTML = "@media print {" + cssStr + "}";
    document.getElementsByTagName('head')[0].appendChild(n);
}

GM_addPrintStyle("img {width: 95%; max-width: 100%!important}");
GM_addPrintStyle("@page {size:a4!important}"); // Who uses A3 anyway
// GM_addPrintStyle("table, a { print-color-adjust: exact!important;}");
GM_addPrintStyle("* { print-color-adjust: exact!important;}");


// Lääketietokanta
// div.back-on-top: kts. https://www.terveyskirjasto.fi/uux29592
// div.dropdown-selector: three-dash/square button
GM_addPrintStyle(".additional-search, div.back-on-top, div.nav, div.linkit, div.dropdown-selector {display: none!important;}");
GM_addPrintStyle(".dtkbody, .duo-body {column-count: 2!important; padding: 0!important;}"); // Potilaan lääkeopas, see title fix
GM_addPrintStyle("div.app-content {margin-top: 0px!important}");
GM_addPrintStyle("div#articleElement {column-count: 2!important;}"); // Lääketietokanta: medicine pages, see title fix

// Handling tables
// GM_addPrintStyle("div.duo-table-container {break-before: auto; orphan: 1000}");
// GM_addPrintStyle("table { max-width: 500px!important;width: auto; overflow:hidden !important}");
// Hide oversized tables
// function tableClear(){
// document.querySelectorAll('table').forEach((table) => {
//     var tWidth = table.offsetWidth;
//     var pEmpty = document.createElement("p");
//     pEmpty.style.cssText = 'text-align: center';
//     // pEmpty.innerHTML = "<br><i>&lt;Taulukko piilotettiin tulostteesta&gt;</i><br>";
//     if (tWidth > document.body.offsetWidth / 2) {
//         // console.log(tWidth);
//         table.classList.add('d-print-none');
//         pEmpty.innerHTML = "<br><i>&lt;Taulukko piilotettiin tulostteesta, leveys: " + tWidth + ", sivun leveys: " + document.body.offsetWidth + " +&gt;</i><br>";
//         table.previousElementSibling.append(pEmpty);
//     }
// });}

// Show hyperlink: PMID, DOI, tdoi?
// GM_addPrintStyle("a { print-color-adjust: exact!important;}");

GM_addPrintStyle(".app-root, .article-container {margin-top:0px!important}");

// GM_addPrintStyle("@media print {article img {page-break-inside: avoid;max-height: 95vh!important;max-width: 100%!important;width: auto!important;}}");
GM_addPrintStyle("@media print {.article-section-container, .duo-body {min-width: 1050px!important}}");
// GM_addPrintStyle("@media print {article * {width: 1100px!important}}"); // CCG in LTK
// GM_addPrintStyle("#article-container, article, #article-section-container {width: 1050px!important"); // CCG in LTK

// =====================================================

//  change title to h1 to match context and avoid clicking back and forth
// via https://stackoverflow.com/questions/76791476/how-to-change-the-title-with-userscripts
function fixTitle() {
    var title = document.title;

    // dtk
    if (title.endsWith(" - Duodecim") && (document.querySelector('h1'))) {
        // GM_addPrintStyle(".duo-body {column-count: 2;}");
        title = document.querySelector('h1').outerText +
            ' | ' + document.querySelector('div.duo-database').outerText // Name of book / collection / journal
            +
            ' - ' + document.querySelector('a.nav-link').outerText; // Database name
    }

    // Lääketietokanta LTK#2
    if (document.URL.startsWith('https://www.terveysportti.fi/apps/laake')) {
        title = ''; // Clears default 'Laaketietokanta'
        if (document.querySelector('div.dtkbody h1') || document.querySelector('div.duo-body h1')) { // article; dtkbody for Potilaan lääkeopas
            var db = 'div.duo-database'; // Name of book / collection / journal
            if (document.querySelector('div.database')) {
                db = 'div.database';
                GM_addPrintStyle(".dtkbody {column-count: 2!important; padding: 0!important;}"); // Potilaan lääkeopas
            } // Potilaan lääkeopas, dloXXXXX

            title = document.querySelector('h1').outerText + ' | ' + document.querySelector(db).outerText;

            // On medicine pages, add tradename after article section
            if (document.querySelector('h2#articleHeaderText')) title += ' | ' + document.querySelector('h2#articleHeaderText').outerText;
            // Medicine page
        } else if (document.querySelector('h2#articleHeaderText')) {
            title = document.querySelector('h2#articleHeaderText').outerText;
        }
        GM_addPrintStyle("div#articleElement {column-count: 2!important;}");
        title += ' -  Lääketietokanta';
    }

    // document.title = title;
    // if (!title.startsWith(' ')) return title
    // else return fixTitle();
    return title;
}

var onloadIteration = 0;
var urlChange = 0;
window.addEventListener("load", () => {
    document.title = fixTitle() // userscript: works on visiting a link in a new tab or refreshing the page
    
    // works on browser forward/backward switching betwen TP pages
    // https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
    let oldHref = document.location.href;
    // const body = document.querySelector('body');
    const loadObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            onloadIteration++;
        });
        if (oldHref !== document.location.href) {
            oldHref = document.location.href;
            urlChange++;
            document.title = fixTitle();
        }
    });
    loadObserver.observe(document.querySelector('body'), {
        childList: true,
        subtree: true
    });
    window.alert('Upon (re)loading, iteration = ' + onloadIteration
    + '\nURL changed caugut = ' + urlChange
    + '\ndocument.title = ' + document.title);
    loadObserver.disconnect();
});
// manual trigger for debugging
// fixTitle();

// works on selecting from e.g. right-slide navigation tree panel, in-text buttons or left-side panel
// https://stackoverflow.com/questions/20613754/javascript-eventlistener-for-update-change-on-element-innertext
var article = document.querySelector('app-article');
// LTK#3
if (document.URL.startsWith('https://www.terveysportti.fi/apps/laake')) {
    article = document.querySelector('div#middle'); //
}

var articleIteration = 0;
var articleIterationAccumulate = 0;
var articleIterationRounds = 0;
var articleObserver = new MutationObserver((mutations, obs) => {
    mutations.forEach((mutation) => {articleIteration++;}); // No furthur analysis on individual mutation for now.
    document.title = fixTitle();
    // tableClear();
    // if
    // obs.disconnect(); // dtk: reverting to generic title
    articleIterationAccumulate += articleIteration;
    articleIterationRounds++;
    articleIteration = 0;
    // console.log('iteration in round ' + iteriter + ' = ' + iteration);
    // console.log('Accumulated = ' + iteration1);
    // console.log('Round = ' + iteriter);
    // console.log('document.title = ' + document.title);
});

var config = {
    characterData: true,
    subtree: true,
    childList: true
}; // Lääketietokanta: In article mode, mutations are several levels below app-article, which subtree won't observe recursively LTK#4
articleObserver.observe(article, config);

// test code: pop-up dialog showcasing Observers' iteration records
// var title = document.title;
// var titleObserver = new MutationObserver((mutations, titleObs) => {
//     mutations.forEach((mutation) => {
//         console.log(document.title);
//     })
// });

// test code as a pop-up dialog
// window.alert('From clicking to new equilibrium, iteration in round ' + articleIterationRounds + ' = ' + articleIteration
//     + '\nAccumulated = ' + articleIterationAccumulate
//     + '\ndocument.title = ' + document.title);