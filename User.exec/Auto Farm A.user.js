// ==UserScript==
// @name        	AutoFarm A
// @namespace   	https://www.youtube.com/c/TW100TRIBALWARS
// @icon          https://media.innogamescdn.com/com_DS_FR/Quickbar/oldaxe.png
// @website       https://tribalwarsbr100.wixsite.com/tw100
// @email         tribalwarsbr100@gmail.com
// @description 	Auto Farm Game Tribal Wars, Modelo A
// @author		    Marcos v.s Marques
// @include     	http*://*.tribalwars.*/game.php?*&screen=am_farm*
// @version     	5.7
// @updateURL		  https://github.com/tribalwarsbr100/AutoFarms/blob/master/Javascript/Auto%20Farm%20A.js
// @downloadURL   https://github.com/tribalwarsbr100/AutoFarms/edit/master/User.exec/Auto%20Farm%20A.user.js
// @supportURL    https://github.com/tribalwarsbr100/AutoFarms/issues
// ==/UserScript==
var atualizarPagina = 1;
var tempo = 805;
var x = 0;
var minhaVar = "";
var remove_atacadas = 1;
var menu = $('#am_widget_Farm a.farm_icon_a');
var altAldTempo = 1;
var jaEnviados = $(menu).parent().parent().find('img.tooltip').length+"000";
if (remove_atacadas == 0) {
$('img').each(function() {
var tempStr = $(this).attr('src');
if (tempStr.indexOf('attack') != -1) {
$(this).addClass('tooltip')
}
});
}
if(atualizarPagina == 1) {
setInterval(
function() {
window.location.reload();
}, 16000);
}
console.log("Ja existe " + jaEnviados.substring(0,(jaEnviados.length - 3)) + " aldeia com ataque.");
if (altAldTempo == "0") {
var altAldTempo = aleatorio(12000,22000);
} else {
var altAldTempo = parseInt(altAldTempo) + parseInt(aleatorio(12000,22000));
}
console.log("Resta " + altAldTempo + " milesegundos para alternar a aldeia.");
function aleatorio(superior,inferior) {
numPosibilidades = superior - inferior
aleat = Math.random() * numPosibilidades
return Math.round(parseInt(inferior) + aleat)
}
for (i = 0; i < 50; i++) {
$(menu).eq(i).each(function() {
if (!($(this).parent().parent().find('img.tooltip').length)) {
var tempoAgora = (tempo * ++x) - aleatorio(150,300);
setTimeout(function(minhaVar) {
$(minhaVar).click();
}, tempoAgora, this);
}
})
}
function altAldeia()
{
$('.arrowRight').click();
$('.groupRight').click();
}
setInterval(altAldeia, altAldTempo);
console.log("Script changed and modified by channel Tw100");
