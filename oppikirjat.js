// ==UserScript==
// @name     Oppiportti EasyPrint
// @match  https://www.oppiportti.fi/oppikirjat/*
// ==/UserScript==

// via https://superuser.com/questions/1337469/grasemonkey-change-design-css
function GM_addStyle(cssStr){

    var n = document.createElement('style');
    n.type = "text/css";
    n.innerHTML = cssStr;
    document.getElementsByTagName('head')[0].appendChild(n);

}

GM_addStyle("@media print {article section[role=main] {column-count: 1;}}");
GM_addStyle("@media print {article {column-count: 2!important;}}");

// TODO: include header and footer
// GM_addStyle("@media print {article .onecol {column-count: 1!important;}}");
// GM_addStyle("@media print {article .d-document{column-count: 2!important;}}");

// GM_addStyle("@media print {article img {page-break-inside: avoid!important;max-height: 95vh!important;max-width: 100%!important;width: 100%!important;}}");
GM_addStyle("@media print {article img {width: 95%!important}}");
GM_addStyle("@media print {div .d-print-block {display: none!important}}");

// TODO new page before table/img
GM_addStyle("@media print {caption var {page-break-before: always!important}}");


// no scroll bar
GM_addStyle("@media print {* {overflow: hidden!important;}}");

// GM_addStyle("@media print {.d-article header .d-database, .d-updated .d-authors {display: none!important}}");