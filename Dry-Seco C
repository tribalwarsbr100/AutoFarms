const template = "c";
const delay_tw100_clicks = 450; // ms

var light_to_send = Number(document.getElementsByName("light")[1].value);

var attackSenderInterval;
var currentIndex = 1;
var all;

if ($(document).ready)
{
	send_attacks();
}

function send_attacks()
{
	all = document.getElementsByClassName("farm_icon_" + template);
	attackSenderInterval = setInterval(send_attacks_update, delay_tw100_clicks);
}

function send_attacks_update()
{
	if (light_to_send > GetCurrentLight()) {clearInterval(attackSenderInterval); UI.ErrorMessage("#Tw 100# Informa Não há Calavaria Leve."); return;}

	all[currentIndex].click();
	currentIndex++;
	if (currentIndex >= all.length - 1) {clearInterval(attackSenderInterval); UI.Success("#Tw 100# Todos os ataques foram enviados."); return;}
}

function GetCurrentLight()
{
	return Number(document.getElementById("light").innerText);
}
