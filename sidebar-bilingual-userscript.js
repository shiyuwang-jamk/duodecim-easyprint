// ==UserScript==
// @name         Bilingual EBMG/LKK article
// @namespace    http://tampermonkey.net/
// @version      0.01
// @description  Send an API request from a userscript
// @match        https://www.terveysportti.fi/apps/dtk/ltk/article/*
// @author       Shiyu Wang
// ==/UserScript==

/*
   CHANGELOG

   v 0.01: basic feature: add a button to the sidebar of Finnish Lääkärin Käsikirja article to its English version in EBMG (if applicable).
*/
/**
 * 
 * @param {Node} list the default list would be the left sidebar
 * @param {string} tdoi through either element mutation observation or API fetch
 * @param {string} dtk For a fuller version dealing with both EN>FI and FI>EN
 */
function addLink(dtk, list, tdoi) {
    // FI>EN

    const liNodes = list.querySelectorAll('li');
    const cloneSrc = liNodes[liNodes.length - 1];
    var clone = cloneSrc.cloneNode(true);
    const cloneTitle = 'EBMG Englanniksi';
    // const cloneTitle = onEBMG ? 'Suomeksi' : 'In English'
    //         + articleTitle ? (': ' + articleTitle) : '';

    clone.querySelector('DIV').innerHTML = `<app-plugin-external-link
            _ngcontent-xaq-c65="" _nghost-xaq-c62="" class="ng-star-inserted"><a _ngcontent-xaq-c62=""
                target="_blank" class="nav-link ng-star-inserted" href="/apps/dtk/` +
        dtk + `/` + tdoi + `"><i _ngcontent-xaq-c62="" class="app-plugin-list-icon"></i> ` +
        cloneTitle + `</a></app-plugin-external-link>`;
    cloneSrc.appendChild(clone);
}

function currentPage(url) {
    // const dtk = url.split('/')[5];
    // const tdoi = url.split('/')[7].substring(0,8);
    return url.split('/')[7].substring(0, 8);
    // return {dtk, tdoi}
}

(function () {
    'use strict';

    const ydoiRegex = /ykt[0-9]{5}/g; // to be used in an API fetch
    const edoiRegex = /ebm[0-9]{5}/g;

    var sideObserver = new MutationObserver((mutations) => {
        mutations.forEach((e)=>{}); // skip all mutations?
        // var {dtk, edoi} = currentPage(document.URL);
        if (currentPage(document.URL).match(ydoiRegex)) { // only for ykt articles
            // var side = document.querySelector('div.more-plugins.ng-star-inserted'); // left sidebar, the part under table of contents
            var side = document.querySelector('div.more-plugins'); // .ng-star-inserted may disappear on switching from certain non-ykt articles like CCG summaries
            var aList = side.querySelectorAll('a');
            var edoi = aList[aList.length - 1].getAttribute('href').split('mcm?id=')[1];
            // ykt: 'Ajankohtaisia viitteitä' shall be the last list element
            if (edoi.match(edoiRegex)) {
                addLink('ebmg', side, edoi);
            }
        }
    });

    const config = {
        characterData: true,
        subtree: true,
        childList: true
    };
    
    var sideBar = document.querySelector('app-overview-sidebar'); // target node
    sideObserver.observe(sideBar, config);


})();

/*
    FI>EN: devTools test code
    const liNodes = document.querySelectorAll('div.more-plugins.ng-star-inserted li');
    const cloneSrc = liNodes[liNodes.length -1];
    const edoi = cloneSrc.querySelector('a').getAttribute('href').split('=')[1];
    const    tdoi = edoi;
    const onEBMG = false; // test code
    const dtk = onEBMG ?'ltk' : 'ebmg' ;
    var clone = cloneSrc.cloneNode(true);
    const cloneTitle = onEBMG ? 'Artikkeli Lääkärin käsikirjassa' : 'In English: ';
    clone.querySelector('DIV').innerHTML = `<app-plugin-external-link
    _ngcontent-xaq-c65="" _nghost-xaq-c62="" class="ng-star-inserted"><a _ngcontent-xaq-c62=""
        target="_blank" class="nav-link ng-star-inserted" href="/apps/dtk/`+dtk+`/`+tdoi+`"><i
            _ngcontent-xaq-c62="" class="app-plugin-list-icon"></i> `+cloneTitle+`</a></app-plugin-external-link>`
    cloneSrc.appendChild(clone);
*/