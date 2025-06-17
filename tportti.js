// ==UserScript==
// @name     Terveysportti EasyPrint
// @match  https://www.ebm-guidelines.com/apps/dtk/ebmg/article/*
// @match  https://www.terveysportti.fi/apps/*
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
GM_addStyle("@media print {.duo-body img {width: 100%!important}}");
