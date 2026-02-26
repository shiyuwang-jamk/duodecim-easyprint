// ==UserScript==
// @name     Oppiportti EasyPrint
// @namespace    http://tampermonkey.net/
// @version      2025-06-15
// @description  
// @author       Shiyu Wang
// @match  https://www.oppiportti.fi/oppikirjat/*
// @grant        none
// ==/UserScript==


// via https://superuser.com/questions/1337469/grasemonkey-change-design-css
function GM_addPrintStyle(cssStr) {
    var n = document.createElement('style');
    n.type = "text/css";
    n.innerHTML = "@media print {" + cssStr + "}";
    document.getElementsByTagName('head')[0].appendChild(n);
}

// Put header in same column as whole article
GM_addPrintStyle("article section[role=main] {column-count: 1;}");
// Split header and article
GM_addPrintStyle("article {column-count: 2!important;}");

// TODO: include header and footer
// GM_addPrintStyle("article .onecol {column-count: 1!important;}}");
// GM_addPrintStyle("article .d-document{column-count: 2!important;}}");

// GM_addPrintStyle("article img {page-break-inside: avoid!important;max-height: 95vh!important;max-width: 100%!important;width: 100%!important;}}");
GM_addPrintStyle("img {min-width: 95%; max-width: 100%!important}");
GM_addPrintStyle("div .d-print-block {display: none!important}");

// TODO new page before table/img
GM_addPrintStyle("caption var {page-break-before: always!important}");


// no scroll bar
GM_addPrintStyle("* {overflow: hidden!important;}");

GM_addPrintStyle("@page {size: a4!important}");
// No top badge/banner
GM_addPrintStyle(".d-none {display: none!important}}");
// GM_addPrintStyle("GM_addPrintStyle.d-article header .d-database, .d-updated .d-authors {display: none!important}}");

//  change title to h1 to match context and avoid clicking back and forth
// via https://stackoverflow.com/questions/76791476/how-to-change-the-title-with-userscripts
function fixTitleOP() {
    var title = document.title;

        title = document.querySelector('h1').outerText +
            ' | ' + document.querySelector('div.d-database').outerText // Name of book
            + ' - Dodecim Oppiportti'; // Database name
    
    return title;
}

// works on selecting from e.g. right-slide navigation tree panel, and in-text buttons
// When browsing textbooks in Oppiportti, all clicks, including redirecting to #ids of the same page, triggers loading.
// https://stackoverflow.com/questions/20613754/javascript-eventlistener-for-update-change-on-element-innertext
window.addEventListener("load", () => {
    document.title = fixTitleOP() // userscript: works on visiting a link in a new tab or refreshing the page
    
    // works on browser forward/backward switching betwen TP pages
    // https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
    let oldHref = document.location.href;
    // const body = document.querySelector('body');
    const loadObserver = new MutationObserver((mutations) => {
        // mutations.forEach((mutation) => {
        //     onloadIteration++;
        // });
        if (oldHref !== document.location.href) {
            oldHref = document.location.href;
            // urlChange++;
            document.title = fixTitleOP();
        }
    });
    loadObserver.observe(document.querySelector('body'), {
        childList: true,
        subtree: true
    });
    // window.alert('Upon (re)loading, iteration = ' + onloadIteration
    // + '\nURL changed caugut = ' + urlChange
    // + '\ndocument.title = ' + document.title);
    // loadObserver.disconnect();
});
var config = {
    characterData: true,
    subtree: true,
    childList: true
}; // Lääketietokanta: In article mode, mutations are several levels below app-article, which subtree won't observe recursively LTK#4
