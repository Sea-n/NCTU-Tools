// ==UserScript==
// @name     交大差勤自動化 NCTU PT-Attendance
// @author   Sean Wei
// @version  2023.07.31.1
// @grant    none
// @include  https://pt-attendance.nctu.edu.tw/
// @include  https://pt-attendance.nycu.edu.tw/
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
    const psel = document.getElementById('pno');
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

    const failedFunc = (msg) => {};  // do nothing, not checking total filled time
    const oldAlert = unsafeWindow.alert;
    unsafeWindow.alert = failedFunc;
    const oldConfirm = unsafeWindow.confirm;
    unsafeWindow.confirm = failedFunc;

    for (let day = formInfo['startDay']; day <= formInfo['endDay']; day++) {
        let today = `${formInfo['yearmon']}-${padLeft(day, 2)}`;

        if (true) {  // The rule to check Saturday or Sunday
            let dayOfTheWeek = (new Date(today)).getDay();
            if (dayOfTheWeek === 6 || dayOfTheWeek === 0)
                continue;
        }

        let steps = [8, 18, 5];  // 08:00 - 12:00, 13:00 - 17:00, 18:00 - 22:00
        if (day >= formInfo['endDay'] - 2)  // final days (0, -1, -2)
            steps = [8, 17, 1];  // 08:00 - 09:00, 09:00 - 10:00, ....

        for (let time = steps[0]; time <= steps[1]; time += steps[2]) {
            let datetimepicker1 = `${today} ${padLeft(time, 2)}:00:00`
            let datetimepicker2 = `${today} ${padLeft(time + steps[2], 2)}:00:00`

            psel.value = formInfo['workP'];
            document.getElementById('datetimepicker1').value = datetimepicker1;
            document.getElementById('datetimepicker2').value = datetimepicker2;
            document.getElementById('txtBuginfo').value = formInfo['host'];
            document.getElementById('workdata4').value = formInfo['worklog'];

            document.getElementById('btnSubmit').click();
            console.log(`Filling ${datetimepicker1} ~ ${datetimepicker2}`);
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
    psel.children[1].selected = true;
    psel.onchange();  // showBugetName()
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
