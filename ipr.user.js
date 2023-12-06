// ==UserScript==
// @name     交大智財權有獎徵答 NCTU IPR
// @author   Sean Wei
// @version  2023.12.06.0
// @grant    none
// @include  https://iprcampaign.nycu.edu.tw/*
// @icon     https://www.google.com/s2/favicons?domain=www.nycu.edu.tw
// @downloadURL  https://raw.githubusercontent.com/Sea-n/NCTU-Tools/master/ipr.user.js
// ==/UserScript==

// 答案來源：感謝 @frozenkp
// https://github.com/frozenkp/nctu-Intellectual-Property-Rights
async function autoAnswer() {
    const ansUrl = 'https://raw.githubusercontent.com/frozenkp/nctu-Intellectual-Property-Rights/master/data';
    let ansData = await fetch(ansUrl)
        .then(resp => resp.text())
        .then(resp => resp.trim())
        .then(resp => resp.split('\n'));

    const q2ans = {}  // {題目A: 1, 題目B: 2, 題目C: 1}
    ansData.forEach((item) => {
        q2ans[item.slice(2)] = item.slice(0, 1)
    });

    for (let k=1; k<=20; k++) {
        let qtext = document.querySelector(`label[for="test${k}"]`).innerText;
        switch (q2ans[qtext]) {
            case '1':
                document.getElementById(`test${k}one`).click();
                break;
            case '2':
                document.getElementById(`test${k}two`).click();
                break;
            default:
                console.log(`Warning: question "${qtext}" not found! Guess false as answer.`);
                document.getElementById(`test${k}two`).click();
                break;
        }
    }
}

setInterval(() => {
    const headElem = document.getElementsByClassName('head')[0];
    if (headElem === null || headElem.dataset.sean) return;
    if (headElem.innerText.trim() != '題目') return;

    headElem.innerHTML += '<input type="button" id="autoAnswerBtn" value="自動填答"' +
                          'style="position: absolute; left: calc(20% + 64px); top: calc(50% - 12px);">';

    document.getElementById('autoAnswerBtn').onclick = autoAnswer;
    headElem.dataset.sean = 'done';
}, 300);
