// ==UserScript==
// @name     交大差勤自動化 NCTU PT-Attendance
// @author   Sean Wei
// @version  2023.11.26.0
// @grant    none
// @include  https://pt-attendance.nctu.edu.tw/*
// @include  https://pt-attendance.nycu.edu.tw/*
// @icon     https://www.google.com/s2/favicons?domain=www.nycu.edu.tw
// @downloadURL  https://raw.githubusercontent.com/Sea-n/NCTU-Tools/master/pt.user.js
// ==/UserScript==

function sortPlan() {
    const psel = document.getElementById('pno');
    let plans = psel.innerHTML.replaceAll('\n ', '!#@').replace(/\s+/g, ' ').split('!#@');
    plans.sort((a, b) => {
        const aDate = a.match(': (.*)~(.*) - Pay:');
        const bDate = b.match(': (.*)~(.*) - Pay:');
        if (aDate && bDate)
            return aDate[1] < bDate[1];
    });
    psel.innerHTML = plans.join('\n');
}

async function fillPT() {
    const psel = document.getElementById('pno');  // psel will be invalid soon
    const planText = psel.querySelector('option:checked').text.match(': (.*)~(.*) - Pay:')
    if (planText === null) {
        alert('Please select plan first.')
        return;
    }

    let formInfo = {
        workP: psel.value, // 選擇計畫編號
        host: document.getElementById('txtBuginfo').value, // 主持人/名稱
        worklog: document.getElementById('workdata4').value, // 工作內容
        yearmon: planText[1].substr(0, 7),
        startDay: Number(planText[1].substr(8)),
        endDay: Number(planText[2].substr(8)),
    }
    console.log({formInfo});

    /* Error Handling */
    let today, remToday, lastFill;
    const failedFunc = (msg) => {
        remToday += lastFill;
        console.log(`Alert: "${msg}", lastFill=${lastFill}, remToday=${remToday}`);
    };
    const oldAlert = unsafeWindow.alert;
    unsafeWindow.alert = exportFunction(failedFunc, unsafeWindow);
    const oldConfirm = unsafeWindow.confirm;
    unsafeWindow.confirm = exportFunction(failedFunc, unsafeWindow);

    /* Fill with loop */
    for (let day = formInfo['startDay']; day <= formInfo['endDay']; day++) {
        today = `${formInfo['yearmon']}-${padLeft(day, 2)}`;
        remToday = 8;

        if (true) {  // The rule to check Saturday or Sunday
            let dayOfTheWeek = (new Date(today)).getDay();
            if (dayOfTheWeek === 6 || dayOfTheWeek === 0)
                continue;
        }

        for (let time of [8, 13, 18, 5]) {
            if (remToday <= 0) break;
            lastFill = 4;
            let datetimepicker1 = `${today} ${padLeft(time, 2)}:00:00`
            let datetimepicker2 = `${today} ${padLeft(time + lastFill, 2)}:00:00`

            const psel = document.getElementById('pno');
            psel.value = formInfo['workP']; psel.onchange();
            document.getElementById('datetimepicker1').value = datetimepicker1;
            document.getElementById('datetimepicker2').value = datetimepicker2;
            document.getElementById('txtBuginfo').value = formInfo['host'];
            document.getElementById('workdata4').value = formInfo['worklog'];

            remToday -= lastFill;
            console.log(`Filling ${datetimepicker1} ~ ${datetimepicker2}, remToday=${remToday}`);
            document.getElementById('btnSubmit').click();
            await sleep(1000);
        }
    }

    unsafeWindow.alert = oldAlert;
    unsafeWindow.confirm = oldConfirm;
    console.log('Done!');
}


// Main Function (inf loop)
setInterval(() => {
    const psel = document.getElementById('pno');
    if (psel === null || psel.dataset.sean) return;
    psel.dataset.sean = 'done';  // don't run again

    sortPlan();
    if (psel.children[0].selected == true) {
        psel.children[1].selected = true;
        psel.onchange();  // showBugetName()
    }
    let fillBtn = document.createElement('input');
    fillBtn.onclick = fillPT;
    fillBtn.type = 'button';
    fillBtn.value = '自動填寫';
    document.getElementById('main3').appendChild(fillBtn);
}, 300);


// 8 -> '08', 12 -> '12'
function padLeft(str, len) {
    str = String(str);
    return str.length >= len ? str : '0'.repeat(len - str.length) + str;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
