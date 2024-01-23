// ==UserScript==
// @name     交大成績系統 NCTU Score Prettifier
// @author   Sean Wei
// @version  2024.01.23.0
// @grant    none
// @include  https://regist.nycu.edu.tw/p_student/*
// @icon     https://www.google.com/s2/favicons?domain=www.nycu.edu.tw
// @downloadURL  https://raw.githubusercontent.com/Sea-n/NCTU-Tools/master/regist-score.user.js
// ==/UserScript==

var grid = document.getElementById("GridView1");
var rows = grid.firstElementChild.children;
if (rows[0].children[7].innerText == "等級成績") {
  rows[0].children[8].innerText = "換算分數";
  for (var i=1; i<rows.length; i++) {
    var score = rows[i].children[7].innerText.trim(); // 等級成績
    var range = "Unknown";
    
    if (score == "")   score = "00", range = "?";
    if (score == "通過") score = "60", range = "Pass";
    
    if (score == "A+") score = "95", range = "90 - 100";
    if (score == "A")  score = "87", range = "85 - 89";
    if (score == "A-") score = "82", range = "80 - 84";
    
    if (score == "B+") score = "78", range = "77 - 79";
    if (score == "B")  score = "75", range = "73 - 76";
    if (score == "B-") score = "71", range = "70 - 72";
    
    if (score == "C+") score = "68", range = "67 - 69";
    if (score == "C")  score = "65", range = "63 - 66";
    if (score == "C-") score = "61", range = "60 - 62";
    
    if (score == "D")  score = "55", range = "50 - 59";
    if (score == "E")  score = "49", range = "1 - 49";
    if (score == "X")  score = "00", range = "0";
    
    rows[i].dataset.score = score;
    rows[i].children[8].innerText = "~" + score + " (" + range + ")";
  }

  for (var k=rows.length; k; k--)
    for (var i=2; i<k; i++)
        if (rows[i-1].dataset.score < rows[i].dataset.score)
          rows[i].parentNode.insertBefore(rows[i], rows[i-1]);

  for (var i=1; i<rows.length; i++) {
    rows[i].children[9].style.width = ''; // 任課老師
    rows[i].children[9].innerText = rows[i].children[9].innerText.replaceAll(';', '; ');
    rows[i].classList.remove("table_text", "table_alt");
    rows[i].classList.add(i&1 ? "table_text" : "table_alt");
  }
  
  
  /* Remove unused columns */
  for (var i=0; i<rows.length; i++) {
    rows[i].children[0].outerHTML = ''; // 筆
    rows[i].children[0].outerHTML = ''; // 學期
    rows[i].children[0].outerHTML = ''; // 課號
    rows[i].children[0].outerHTML = ''; // 開課單位
    // 課程名稱
    rows[i].children[1].outerHTML = ''; // 選別
    // 學分, 等級成績, 成績狀態
    // 任課老師
    rows[i].children[5].outerHTML = ''; // 向度
  }

  
	/* Style */
  grid.style.maxWidth = "640px";
  document.body.style.marginLeft = '6px';
  document.body.style.fontFamily = 'sans-serif';
  document.getElementById('Label3').outerHTML = '';
  document.getElementsByClassName('bt')[0].parentNode.outerHTML = '';
  document.getElementById('trDescription').outerHTML = '';
  document.getElementById('Label1').style.marginLeft = '6px';
  document.getElementById('Label6').style.marginLeft = '6px';
  document.getElementById('Label4').parentNode.parentNode.outerHTML = '';
}