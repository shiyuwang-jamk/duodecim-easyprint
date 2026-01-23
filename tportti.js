// ==UserScript==
// @name     Terveysportti EasyPrint
// @match  https://www.ebm-guidelines.com/apps/dtk/ebmg/article/*
// @match  https://www.terveysportti.fi/apps/dtk/*/article/*
// @match        https://www.terveysportti.fi/apps/laake/*/artikkeli
// @namespace    http://tampermonkey.net/
// @version      2026-01-23
// @author       Shiyu Wang
// ==/UserScript==

// via https://superuser.com/questions/1337469/grasemonkey-change-design-css

function GM_addPrintStyle(cssStr){
    var n = document.createElement('style');
    n.type = "text/css";
    n.innerHTML = "@media print {" + cssStr + "}";
    document.getElementsByTagName('head')[0].appendChild(n);
}

GM_addPrintStyle(".duo-body {column-count: 2;}"); // ltk
GM_addPrintStyle(".dtkbody {column-count: 2;}"); // Lääketietokanta
GM_addPrintStyle("div.back-on-top {display: none!important;}"); // Lääketietokanta
GM_addPrintStyle("table { print-color-adjust: exact!important;}");
GM_addPrintStyle(".app-root {margin-top: 24px!important}");

// GM_addStyle("@media print {article img {page-break-inside: avoid;max-height: 95vh!important;max-width: 100%;width: auto!important;}}");
GM_addPrintStyle(".duo-body img {width: 100%!important}");
// GM_addStyle("@media print {.article-section-container {width: 1200px!important}}");
// GM_addStyle("@media print {article * {width: 1200px!important}}"); // CCG in LTK
GM_addPrintStyle("#article-container, article, #article-section-container {width: 1050px!important"); // CCG in LTK