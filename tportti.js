// ==UserScript==
// @name     Terveysportti EasyPrint
// @match  https://www.ebm-guidelines.com/apps/dtk/ebmg/article/*
// @match  https://www.terveysportti.fi/apps/*
// @exclude  https://www.terveysportti.fi/apps/laake/*
// @namespace    http://tampermonkey.net/
// @version      2025-06-17
// @author       Shiyu Wang
// ==/UserScript==

// via https://superuser.com/questions/1337469/grasemonkey-change-design-css

function GM_addStyle(cssStr){

    var n = document.createElement('style');
    n.type = "text/css";
    n.innerHTML = cssStr;
    document.getElementsByTagName('head')[0].appendChild(n);

}

GM_addStyle("@media print {.duo-body {column-count: 2;}}");
GM_addStyle("@media print {table { print-color-adjust: exact!important;}}");
GM_addStyle("@media print {.app-root {margin-top: 24px!important}");

// GM_addStyle("@media print {article img {page-break-inside: avoid;max-height: 95vh!important;max-width: 100%;width: auto!important;}}");
// GM_addStyle("@media print {.duo-body img {height: 100%; break-inside: avoid}}");
GM_addStyle("@media print {div.duo-figure, table {display: none}}");

// no scroll bar
GM_addStyle("@media print {* {overflow: hidden!important;}}");

GM_addStyle("@media print {.duo-body * {display: none} #printnow {display:block}}");

// width
GM_addStyle("@media print {div.article-section-container {width: 1200!important}}"); // won't work for KH?

// // KP?
// if (window.location.href.split('apps/dtk/ltk/article/hoi')[1]) {
//     GM_addStyle("@media print {.duo-body {width: 1035!impoartant;}}");
// }