// ==UserScript==
// @name     Terveysportti EasyPrint
// @match  https://www.terveysportti.fi/apps/laake/*
// ==/UserScript==

function urlReplace() {
    const rootURL=document.URL.match(/.*\//)[0];
    document.querySelectorAll('.duo-anchor').forEach(e => {
            if (e != null) {
                let tdoi = e.href.match(/(?<==).*?$/)[0];
                e.href = rootURL+tdoi;
            }
        })
}

if (document.URL.match("DTK") != null) {
    try {
        urlReplace();
    } catch (error) {
        console.error("An error occurred:", error.message);
    }
}

function GM_addStyle(cssStr){

    var n = document.createElement('style');
    n.type = "text/css";
    n.innerHTML = cssStr;
    document.getElementsByTagName('head')[0].appendChild(n);

}

GM_addStyle("@media print {.additional-search {display: none} * { print-color-adjust: exact!important;}}");
GM_addStyle("@media print {.app-content {margin-top: 0!important}}");
GM_addStyle("@media print {.article {column-count: 2;}}");