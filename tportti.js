// ==UserScript==
// @name     Terveysportti EasyPrint
// @match  https://www.ebm-guidelines.com/apps/dtk/ebmg/article/*
// @match  https://www.terveysportti.fi/apps/dtk/*/article/*
// @match  https://www.terveysportti.fi/apps/laake/*
// @description  Two features: a) modify print view for readability and reduce need to refer to the original webpage from print; b) modify <title> so print documents have proper header.
// @namespace    http://tampermonkey.net/
// @version      2026-02-27
// @author       Shiyu Wang
// ==/UserScript==

// ====== Changelong version 2026-02-27 ====== 
/*
    a) Rearranged code sequence by funcitonality for readability.
    
    Other notable changes in:
    Lääketietokanta:
    a) fixTitle(): more informative title would include: 
        - search result and hit count
        - active substance name (does not always work depending on page scenario and loading speed)
            - Might consider API on medID in the future
        - InxBase: count for all matches and for A,B,C,D categories
    b) CSS section 2.1 EasyPrint: excluded img.lk-triangle to avoid enlarging the kolmiolääke icon https://www.terveysportti.fi/apps/sanakirjat/0/kolmiol%C3%A4%C3%A4ke

    EasyPrint:
    a) CSS section 2.3 Dealing with colored .duo-anchor:
        - Preliminary href expansion in print for PubMed PMIDs (section 2.3.1) and TDOIs plus other in-page hash anchors (2.3.2)
        - Proposing a grayscale solution with prefixes
    b) CSS section 2.1 img: made min-width 95%; the "width: 95%" in the previous release won't enlarge images
*/

// ====== test cases ======
//
//    # DTK:
//
//    # Lääketietokanta:
//      - https://www.terveysportti.fi/apps/laake/laakeryhma/C1D
//      - https://www.terveysportti.fi/apps/laake/haku/asetyylisalisyylihappo*
//      - https://www.terveysportti.fi/apps/laake/haku/B01AC06*/12236/DTK/641
//      - https://www.terveysportti.fi/apps/laake/selaus/lft00847/artikkeli
//      - https://www.terveysportti.fi/apps/laake/haku/ASPIRIN*/138/DTK/641


// ====== EasyPrint: CSS ======
// N.B. all commented CSS statments are not functional. Un comment and use them at your own risk.
// https://superuser.com/questions/1337469/grasemonkey-change-design-css
function GM_addPrintStyle(selector, cssStr) {
    var n = document.createElement('style');
    // n.type = "text/css"; https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/style#deprecated_attributes
    n.innerHTML = "@media print {" +
        selector + " {" +
        cssStr + "}";
    document.getElementsByTagName('head')[0].appendChild(n);
}

function GM_hidePrintStyle(selector) {
    GM_addPrintStyle(selector, "display: none!important");
}
// CSS Part 1: print page settings: size, column, margins
GM_addPrintStyle("@page", "size:a4!important"); // Who uses A3 anyway
GM_addPrintStyle(".app-root, .article-container", "margin-top:0px!important");
GM_addPrintStyle("div#articleElement", "column-count: 2!important"); // Lääketietokanta: medicine pages, see title fix
GM_addPrintStyle(".article-section-container, .duo-body", "min-width: 1050px!important");
// GM_addPrintStyle("article * {width: 1100px!important}}"); // CCG in LTK
// GM_addPrintStyle("#article-container, article, #article-section-container {width: 1050px!important"); // CCG in LTK

// 1.1 Lääketietokanta
function laakett(url = document.url) {
    return url.startsWith('https://www.terveysportti.fi/apps/laake') ? true : false;
}

if (laakett) {
    // div.back-on-top: kts. https://www.terveyskirjasto.fi/uux29592
    // div.dropdown-selector: three-dash/square button
    GM_hidePrintStyle(`.additional-search, 
        div.back-on-top, 
        div.nav, 
        div.linkit, 
        div.dropdown-selector`);

    // Potilaan lääkeopas, see title fix
    GM_addPrintStyle(".dtkbody, .duo-body",
        `column-count: 2!important; 
        padding: 0!important`);

    GM_addPrintStyle("div.app-content", "margin-top: 0px!important");
}

// CSS Part 2: manipulating elements

// 2.X TODO Handling tables
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

// 2.1 image size
// GM_addPrintStyle("@article img {page-break-inside: avoid;max-height: 95vh!important;max-width: 100%!important;width: auto!important;}");
GM_addPrintStyle("img:not(.lk-triangle)", // kolmiolääke Lääketietokannassa
    `min-width: 95%!important; 
    max-width: 100%!important`);
// 2.2 color restoration
// By default, colors of the in-page redirection/number citation buttons (a.duo-anchor) won't appear in print
// Tables also look diffferently in print
// GM_addPrintStyle("table, a { print-color-adjust: exact!important;}");
GM_addPrintStyle("*", "print-color-adjust: exact!important;}"); // TODO reverse the color with colored ref numbers and frame?

// 2.3 Show hyperlink: PMID, DOI, tdoi
// Make print style based on modified buttons
// in order to find directly from the internet when reading on print

// 2.3.1 PMID
// devtools: one-line print PMID
// document.querySelectorAll('div#duo-references ol li a.duo-pubmed').forEach((a) => {console.log(a.parentNode.getAttribute('id') + ' ' + a.getAttribute('title'))})
// Show PMID, TDOI for references https://www.tutorialpedia.org/blog/css-print-links-as-text/
GM_addPrintStyle("a.duo-pubmed[title]::after", "content: attr(title);color: #000;}");
// with parentheses GM_addPrintStyle("a.duo-pubmed[title]::after { content: \" (\" attr(title) \")\";color: #000;}");
GM_hidePrintStyle("a.duo-pubmed var");

// 2.3.2 Duodecim resources, including TDOI
// Not implemented: avoid duplicates
// Counterindication: when the same drug (group) use different innerText , e.g. ASA, B01AC06
var laakeryhmat = [];
const atcRegex = /[A-Z]\d\d[A-Z][A-Z]\d\d/g; // ignore rare cases with [A-Z]\d\d[A-Z][A-Z] indicating one drug scheme
document.querySelectorAll('a.duo-drug').forEach((drug) => {
    const tatc = drug.getAttribute('href').split('laakeryhma/')[1];
    drug.setAttribute('data-tatc', tatc);

    // laakeryhmat.push(tatc);
    // console.log(drug.innerText, drug.getAttribute('data-tatc'));

    // change href for ATC
    const laakehaku = 'https://www.terveysportti.fi/apps/laake/haku/';
    if (tatc.match(atcRegex))
        drug.setAttribute('href', laakehaku + tatc);

});
// 2.3.2.1 Option A:
// Make all buttons `a.duo-anchors` in color as did in part 2.2
// GM_addPrintStyle("*", "print-color-adjust: exact!important;}"); // TODO reverse the color with colored ref numbers and frame?
// print text for select anc
/*  Handling of following buttons
    
    a) Same-page hash locations: no modification
    .duo-internal = e.g. in CCG #666 'dim gray'
    .duo-reference = numbered citation blocks #800 'Maroon'
    .duo-table, #FC6 'Grandis'

    b) Duodecim sources: to print href in the original form of <dtk>/<tdoi>
    .duo-article = link to other entries, e.g. CCG > CCG, ykt > ykt
    - Some appear as buttons as in ykt, CCG #098 'Persian Green'
    - Some appear as text hyperlink, e.g. voh00063 #0056B3 'Cobalt'
    .duo-extra, = ? 
    .duo-non_indexed: may include CCG nix subpages, #0CC 'robin egg blue'
    .duo-image
    
    c) Other sources:
    .duo-drug: text hyperlink using drug group or ATC code used in Lääketietokanta
    - to truncate to drug groups
    .duo-external #0CABC7 'Iris Blue'
    - Some refer to external links
    - Others may lead to DTK/CCG content, e.g. in Sairaanhoitajan käsikirja
    other external sources:
    .duo-internet #39C 'Summer Sky'
    .duo-pubmed: see above #369 'Lochmara'
*/
GM_addPrintStyle(`a.duo-anchor:not(
    .duo-extra,
    .duo-internal,
    .duo-internet,
    .duo-table,
    .duo-reference,
    .duo-pubmed)[href]::after`,
    `content: \" (\" attr(href) \")\";color: #000;}`);
// GM_addPrintStyle(`a.duo-anchor:not(
//     .duo-extra,
//     .duo-internal,
//     .duo-internet,
//     .duo-non_indexed,
//     .duo-table,
//     .duo-reference,
//     .duo-pubmed)[href]::after`,
//     `content: \" (\" attr(href) \")\";color: #000;}`);
// GM_addPrintStyle("a.duo-anchor.duo-article[href]::after { content: \" (\" attr(href) \")\";color: #000;}"); // TDOI
// GM_addPrintStyle("a.duo-anchor.duo-laboratory[href]::after { content: \" (\" attr(href) \")\";color: #000;}");
// Too verbose: GM_addPrintStyle("a.duo-anchor.duo-internet[href]::after { content: \" (\" attr(href) \")\";color: #000;}");

// TODO Preprosessing TDOIs from a.duo-internet for e.g. older articles using older DTK-TDOI format
// TODO tdoiRegex, from scraper?
// let tdoiAlternative = [ "duodecimlehti.fi", "kaypahoito.fi", "terveysportti.fi", "terveyskirjasto.fi"]

// Refer to zotero-translator/Terveysportti for reader correspondence
// let tdoiReader = [ "ltk", // Duodecim journal "duo", Suomen Lääkärilehti "sll", CCG "hoi", etc.
//     "shk",
//     "aho",
//     "pit",
//     ""
// ]
// const dtk; // regex and find dtk
// const tdoiURL = /(?<![\w\d])[a-z]{3}[0-9]{5}(?![\w\d])/g;
// document.querySelectorAll("a.duo-internet").forEach((article) => {
// 	// console.log(article.getAttribute('href'));
//     tdoiAlternative.forEach((domain) => {
//         const srcURL = article.getAttribute('href');
//         if (srcURL.includes(domain) && srcURL.match(tdoiURL)) {
//             const tdoi = srcURL.match(tdoiURL)
//             // cutsom attribute data-tdoi https://developer.mozilla.org/en-US/docs/Web/HTML/How_to/Use_data_attributes
//             // aRemontti(article, )
//             article.setAttribute("data-tdoi", tdoi);

//             // article.replaceWith(aRemontti(article));
//             GM_addPrintStyle("a.duo-internet[data-tdoi]::after { content: \" (\" attr(data-tdoi) \")\";color: #000;}");

//         }

//     });
// 
// });

// /**
//  * 
//  * @param {Element} a 
//  * @param {string} dtk ?
//  * @param {string} tdoi ?
// */
// function aRemontti(a){
//     // a.removeAttribute('target');
//     // a.setAttribute('href', dtk + '/' + tdoi);
//     return a;
// }

// 2.3.2.2: option B
// Print-friendly, no color, but mark anchors with a prefix
// a) .duo-reference, esp. CCG

// document.querySelectorAll('a.duo-article var').forEach((subVar) => {
//     subVar.innerText = 'A' + subVar.innerText; 
// });
// document.querySelectorAll('a.duo-reference var').forEach((subVar) => {
//     subVar.innerText = 'R' + subVar.innerText; 
// });
// document.querySelectorAll('a.duo-non_indexed var').forEach((subVar) => {
//     subVar.innerText = 'X' + subVar.innerText; // CCG: lisätieto
// });
// document.querySelectorAll('a.duo-image var').forEach((subVar) => {
//     subVar.innerText = 'F' + subVar.innerText; // Figure
// });

// ====== EasyPrint: fix title ======

//  change title to h1 to match context and avoid clicking back and forth
// via https://stackoverflow.com/questions/76791476/how-to-change-the-title-with-userscripts
var medID = ''; // tracking under the same medication"
var substance = '';
const searchRegex = /haku\/[^\/]*$/g;
// const medicineregex = /(selaus\/\d+\/|haku\/.*?())/g;
const medIDregex = /(?<=\/)\d+(?=\/start)/g;

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
    
    // Do not change on home page
    if (/https:\/\/www.terveysportti.fi\/apps\/laake\/?$/.test(document.URL)) {
        return document.title;
    }

    if (document.URL.startsWith('https://www.terveysportti.fi/apps/laake')) {
        title = ''; // Clears default 'Laaketietokanta'
        var h1 = ''; // article page
        var h2 = ''; // medicine page

        const link = document.URL.split('https://www.terveysportti.fi/apps/laake/')[1];

        // for search queries
        if (link.startsWith('laakeryhma/')) {
            const tatc = link.split('laakeryhma/')[1]
            title += 'Lääkeryhmä ' + tatc;
            var name;

            // Tracing the MIDDLE tree
            const cdkNode = document.querySelectorAll('div#middle cdk-tree-node[aria-expanded="true"]');
            name = cdkNode[cdkNode.length - 1].querySelector('div.parent-node').innerText;
            if (atcRegex.test(name)) name.toLowerCase();

            title += ' = ' + name;

        }

        var keyword = '';
        var haku = '';
        var onSearchPage = false;
        if (link.startsWith('haku/')) {
            keyword = link.split('haku/')[1].split('*')[0];
            if (link.match(searchRegex)) { // 
                onSearchPage = true;
                haku += "Hae: " + keyword;

                if (keyword.match(atcRegex))
                    haku += ' | = ' +
                    document.querySelector('mat-nested-tree-node ul').parentElement.parentElement
                    .querySelector('span.clickable-item').innerText.toLowerCase();
            }
        }

        // content/entry/article reader
        // title parts:
        //  - on article: article title <h1> and database
        //  - brand name (may include dosage)
        //  - labels restyled
        //  - active substance (if on ./start)

        // In case medID is needed, extracting from URL is safer
        // if (document.querySelector('app-tab-bar div.nav span.nav-item a'))
        // var currentID = document.querySelector('app-tab-bar div.nav span.nav-item a')
        //     .getAttribute('href').match(medIDregex)[0];
        // medID = currentID;
        // clear substance name upon medicine change
        // if (selausID != currentID) {
        //     substance = '';
        // }


        if (document.querySelector('h2#articleHeaderText')) {
            const h2Node = document.querySelector('h2#articleHeaderText');

            // Find medicine name and ignore labels
            h2 += h2Node.innerHTML.trim().match(/^.*?(?=<span)/g) + '('; // regex match would contain an ending space

            // differentiate labels
            const labels = h2Node.querySelectorAll('span a');
            if (labels.length) {
                for (var i = 0; i < labels.length; i++) {
                    // title += a.innerText.match(/\w+/g); // remove space
                    h2 += labels[i].innerText.trim(); // remove space
                    if (labels[i].querySelector('img.lk-triangle')) h2 += '△'; // kolmiolääke

                    if (i < labels.length - 1) h2 += ', ';
                }
            }

        }

        // Fetch and store active substance name on medicine Start page
        var substanceFetch = '';
        
        if (link.match(/\/\d+\/start$/g)) { // optimal case
            //  && medID === currentID) { // make ID in sync
            substance = document.querySelector('section.substances span span').innerText;
            // store
        } else if (keyword && keyword.match(atcRegex) && !substance && document.querySelector('mat-nested-tree-node ul')) { // Alternative on ATC search tree
            substanceFetch = document.querySelector('mat-nested-tree-node ul').parentElement.parentElement
                .querySelector('span.clickable-item').innerText;
        } else if (link.startsWith('haku/')) { // Alternative from search results
            // window.addEventListener('DOMSubtreeModified', () => {
            // TODO wait until search results fully loaded
            if (!onSearchPage) {
                haku = ' (hakusana: ' + link.split('haku/')[1].split('/')[0].split('*')[0] + ')';
            }
            document.querySelectorAll('div.search-results div.section-header').forEach((header) => {
                        const headerTitle = header.querySelectorAll('span')[0].innerText;
                        if (headerTitle === 'Potilaan lääkeopas') {
                            if (header.querySelectorAll('span')[1].innerText === '1') {
                        substanceFetch = header.parentElement.querySelector('a span').innerText.toLowerCase();
                    } // else https://www.terveysportti.fi/apps/laake/haku/asetyylisalisyylihappo*/16587/spc/fi
                }
                // Potilaan lääkeopas comes before the following sources
                // Overwrite because PL may include very long titles like https://www.terveysportti.fi/apps/laake/haku/B01AC06*/12236/DTK/641
                if (headerTitle === 'Akuuttihoidon lääkkeet' || headerTitle === 'Vastasyntyneiden ja imeväisten lääkkeet') {
                    substanceFetch = header.parentElement.querySelector('a span').innerText.toLowerCase();
                    return;
                }
            });
            //     }
            // )
        }
        // TIME 2602272100
        // Protect longer string
        substance = (substance.length > substanceFetch.length) ? substance : substanceFetch;

        if (substance && substance.length > 0 && !onSearchPage) { // https://www.terveysportti.fi/apps/laake/haku/N02BE01*
            // if (h2) h2 += (substance ? '; ' + substance.toLowerCase() : '') +  + ') ';
            if (h2) h2 += '; ' + substance.toLowerCase() + ') ';
            else h2 = '(' + substance.toLowerCase() + ')';
        } else if (h2) h2 += ')'; // https://www.terveysportti.fi/apps/laake/selaus/19694/INX

        /* devtools test:
               Sample h2: 'ASA-RATIOPHARM 100 mg enterotabletti (i, R; asetyylisalisyylihappo 100 mg) '
        
            // var h2 = '';
            // var substance = document.querySelector('section.substances span span').innerText;
            // const h2Node = document.querySelector('h2#articleHeaderText');
        
            //     // Find medicine name and ignore labels
            //     h2 += h2Node.innerHTML.trim().match(/^.*?(?=<span)/g) + '('; // regex match would contain an ending space
        
            //     // differentiate labels
            //     const labels = h2Node.querySelectorAll('span a');
            //     if (labels.length) {
            //         for (i = 0; i < labels.length; i++) {
            //             // title += a.innerText.match(/\w+/g); // remove space
            //             h2 += labels[i].innerText.trim(); // remove space
            //             if (i < labels.length - 1) h2 += ', ';
            //             else h2 += '; '; // followed by substance
            //         }
            //     }
            //     h2 += substance + ') '
            */

        var resultCount = '';

        // Result count for articles
        if (/\d+\/DTK\/\d+$/i.test(link) && document.querySelector('h6')) {
            var db = document.querySelector('h6').innerText;
            if (db === 'Lääketieteellinen farmakologia ja toksikologia') {
                db = 'Farmakologia ja toksikologia';
            }
            resultCount = db + ': ' + document.querySelectorAll('app-dtk-info ul li').length + ' osumia ';
        }

        // Result count for InxBase
        if (/\d+\/INX$/i.test(link)) {
            if (document.querySelector('div.card-results-body table.table')) {
                const cardTable = document.querySelector('div.card-results-body table.table tbody');
                resultCount = cardTable.querySelectorAll('tr').length + ' (';

                // Counting subclasses
                var catClass = {
                    'D': 0,
                    'C': 0,
                    'B': 0,
                    'A': 0
                };

                // Recording the counts
                cardTable.querySelectorAll('tr').forEach((tr) => {
                    // const class = 'tr.'+tr.getAttribute(class);
                    const trClass = tr.getAttribute('class').split('-')[1];
                    catClass[trClass]++;
                });

                // Reading the counts
                // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
                Object.entries(catClass).forEach((key) => {
                    if (catClass[key[0]]) resultCount += catClass[key[0]] + key[0].toLowerCase(); // for readability
                });

                resultCount += ') ';
                // const otsikko = 'Yhteisvaikutukset - InxBase: ' + resultCount
                // document.querySelector('h4').innerHTML = otsikko;
                // document.querySelector('h4').innerText.replace(/.*/g, otsikko);
                // const h4clone = cloneNode(document.querySelector('h4')).cloneNode(true);
                if (!document.querySelector('h4').innerText.endsWith(')')) {
                    const h4clone = document.querySelector('h4').cloneNode(true);
                    h4clone.innerText += ': ' + resultCount;
                    document.querySelector('h4').replaceWith(h4clone);
                }
                resultCount = 'InxBase: ' + resultCount;
            }
        }

        // Result count for RenBase
        // if (/\d+\/REN$/i.test(link)) {
        //     if (document.querySelector('div.card-results-body table.table')) {
        //         const letters = document.querySelector('div.card-results-body table.table div.classification-letter');
        //         resultCount = 'RenBase: ';

        //         // Counting subclasses
        //         var catClass = {
        //             'D': 0,
        //             'C': 0,
        //             'B': 0,
        //             'A': 0
        //         };

        //         cardTable.querySelectorAll('tr').forEach((tr) => {
        //             // const class = 'tr.'+tr.getAttribute(class);
        //             const trClass = tr.getAttribute('class').split('-')[1];
        //             catClass[trClass]++;
        //         });

        //         Object.entries(catClass).forEach((key) => {
        //             if (catClass[key[0]]) resultCount += catClass[key[0]] + key[0].toLowerCase(); // for readability
        //         });

        //         +
        //         cardTable.querySelectorAll('classification-letter').length + ' (';
        //         resultCount += ') ';
        //     }
        // }

        // article page
        if (document.querySelector('div.dtkbody h1') || document.querySelector('div.duo-body h1')) { // .dtkbody for Potilaan lääkeopas
            var db = 'div.duo-database'; // Name of book / collection / journal
            if (document.querySelector('div.database')) {
                db = 'div.database'; // Potilaan lääkeopas, dloXXXXX
                // GM_addPrintStyle(".dtkbody {column-count: 2!important; padding: 0!important;}"); // Potilaan lääkeopas
            }
            // keep article name first
            h1 = document.querySelector('h1').outerText + ' | ' + document.querySelector(db).outerText;
        }
        // else if (document.querySelector('h2#articleHeaderText')) {
        //     title += document.querySelector('h2#articleHeaderText').outerText;

        // }
        // GM_addPrintStyle("div#articleElement {column-count: 2!important;}");

        title += (onSearchPage ? haku : '') 
            + resultCount
            + h1 + ((h1 && h2) ? ' | ' : '') // https://www.terveysportti.fi/apps/laake/haku/pamol*/17001/DTK/641/lft00867
            + (h2.length > 2 ? h2 : '') // = 2, h2 = ') '
            + (onSearchPage ? '' : haku )
            + ' -  Lääketietokanta';
    }

    // document.title = title;
    // if (!title.startsWith(' ')) return title
    // else return fixTitle();
    return title;
}

// var onloadIteration = 0;
// var urlChange = 0;
var config = {
    characterData: true,
    subtree: true,
    childList: true
}; // Lääketietokanta: In article mode, mutations are several levels below app-article, which subtree won't observe recursively LTK#4

document.title = fixTitle() // userscript: works? on cached pages too?
// tampermonkey run-at default is idle https://www.tampermonkey.net/documentation.php?ext=dhdg#meta:run_at
window.addEventListener("load", () => { // https://www.geeksforgeeks.org/html/difference-between-domcontentloaded-and-load-events/
    document.title = fixTitle() // userscript: works on visiting a link in a new tab or refreshing the page

    // works on browser forward/backward switching betwen TP pages
    // https://stackoverflow.com/questions/3522090/event-when-window-location-href-changes
    let oldHref = document.location.href;
    // const body = document.querySelector('body');
    const loadObserver = new MutationObserver((mutations) => {
        // mutations.forEach((mutation) => {
        //     onloadIteration++;
        // });
        document.title = fixTitle();
        if (oldHref !== document.location.href) {
            oldHref = document.location.href;
            // urlChange++;
            document.title = fixTitle();
        }
    });
    loadObserver.observe(document.querySelector('body'), config);
    // window.alert('Upon (re)loading, iteration = ' + onloadIteration
    // + '\nURL changed caugut = ' + urlChange
    // + '\ndocument.title = ' + document.title);
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

// var articleIteration = 0;
// var articleIterationAccumulate = 0;
// var articleIterationRounds = 0;
// TODO necessary? same as Oppiportti, where all go thru load event?
var articleObserver = new MutationObserver((mutations, obs) => {
    // mutations.forEach((mutation) => {articleIteration++;}); // No furthur analysis on individual mutation for now.
    document.title = fixTitle();
    // tableClear();
    // if
    // obs.disconnect(); // dtk: reverting to generic title
    // articleIterationAccumulate += articleIteration;
    // articleIterationRounds++;
    // articleIteration = 0;
    // console.log('iteration in round ' + iteriter + ' = ' + iteration);
    // console.log('Accumulated = ' + iteration1);
    // console.log('Round = ' + iteriter);
    // console.log('document.title = ' + document.title);
});

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