// ==UserScript==
// @name                Farm Revolution 
// @namespace           @@marcosvinicius.santosmarques
// @icon                https://i.imgur.com/7WgHTT8.gif
// @website             https://tribalwarsbr100.wixsite.com/tw100
// @email               tribalwarsbr100@gmail.com
// @description         Modelo Auto Farm Para Game Tribal Wars Tradicional, Painel Interativo, Mult Funções. 
// @detailing           Desmembrado inumeros problemas criticos de funcionamento, Funcional em 80% - Infuncional em 20%
// @version     	    0.0.1
// @updateURL		    https://github.com/tribalwarsbr100/AutoFarms/blob/master/Javascript/Farm%20Revolution.js
// @downloadURL         https://github.com/tribalwarsbr100/AutoFarms/raw/master/User.exec/Farm%20Revolution.user.js
// @supportURL          https://github.com/tribalwarsbr100/AutoFarms/issues
// @grant               GM_addStyle
// @grant               GM_getValue
// @grant               GM_setValue
// @grant               unsafeWindow
// @grant               GM_getResourceText
// @include             https://*screen=am_farm*   

/*	Changelog versão 1.25
*        Equipe do Canal Youtube TW 100 Foi Realizado a Mais Recente Atualização Para Implatação da universalização do conteudo do canal, assim tornando nosso conteudo cada vez mais usual e presente em todos servidores de tribalwars.
*        Equipe do Canal Youtube TW 100 Solicita humildemente a colaboração dos usuarios dos conteudos abragidos no canal com likes, curtidas, comentarios nos videos, e com compartilhamento dos videos, isso era proporcionar um crescimento do canal, e com isso cada vez  mais iremos trazer mais conteudo.
*        Equipe do Canal Youtube TW 100 se reserva ao direito de possuir a posse do codigo-fonte  do script, quaisquer modificação deve ser solicitado via email, segundos regras da Licença Pública Geral GNU 
*        Equipe do Canal Youtube TW 100 não se responsabiliza por eventuais danos causados pela utilização do script
*        Equipe do Canal Youtube TW 100 promove a canpanha "Software livre não e virus nem boot" abraça e se solidariza com os scripts de tampermonkey voltados para o game tribal wars, do qual as equipes inesperientes de suporte, sem conhecimento, e sem saber a historia dos primordios do game, impõe um pensamento de que os script de grasemonkey tampermonkey violentmonkey e scripts utilizados na barra de favoritos do navegador são proibidos. Muitas das melhorias no game, que se deu atraves de scrips de tampermonkey, grasemonkey, violentmonkey, entre outros meios de leitura e execução, feitos de players para players, Prova disso e os diversos scripts de grasemonkey sempre foram permitidos no forum da comunidade do Servidor Alemão DE e tambem permitidos no servidor holandês NL, Alem do qual esse pensamento foi uma forma da da grande empresa tutora do game promover seus ganhos com recursos pagos, e assim prejudicando os jogadores que não utiliza de dinheiro para jogar, *EQUIPE TW 100 DEIXA CLARO, QUE NÃO E PRECISO TER FUNÇÕES PAGAS PARA USUFLUIR DO GAME, TEMOS A MISSÃO DE TRAZER UMA INGUALAÇÃO DO QUAL OS PLAYERS QUE NÃO USUFLEM DE RECURSOS PREMIUNS TENHA A SUA DIPONIBILIDADE OS MESMO RECURSOS DOS QUE TEM*/
/*		 Equipe do Canal Youtube TW 100 no dia 25/01/2017 v2.0i primeira versão para atualização TW 8.89
*        Equipe do Canal Youtube TW 100 Script em desenvolvimento, ao longo do tempo, de acordo com o tempo disponivel iremos adicionar mais funções
*/




/*var version="2.0 - Semi Oficial<br/>";var updateversion=1.6;var CdnRoot="https://dsen.innogamescdn.com/8.48.1/29690/graphic/";var keycodes={"a":65,"b":66,"c":67,"skip":74,"right":39,"left":37,"master":90};var keyedits={"a":false,"b":false,"c":false,"skip":false};var key;var keydown=false;var cansend=true;var sitter="";if(window.game_data.player.sitter!="0"){sitter="t="+ window.game_data.player.id+"&";}
var link=["https://"+ window.location.host+"/game.php?"+ sitter+"village=","&screen=am_farm"];var pos={s:{order:0,dir:1,loadp:2,fp:3,lp:4,remaxes:5,remyellow:6,remred:7,remblue:8,remgreen:9,remredy:10,remredb:11,remattsince:12}};var faTable,userkeys,userset,totalrows,countedrows=0;var pagesLoad=0;pagesLoaded=false,pageLoading=false,start=false;function run(){checkPage();if(checkCookie()){if($.cookie(cookieName).indexOf('{')==-1){alert("Attempting to adapt existing settings to work with newer version. If there are problems with the settings transition, please try changing your cookie name.\n\n-crim");dodokeys=$.cookie(cookieName).split(',');resetCookie();userkeys[0]=dodokeys[0];userkeys[1]=dodokeys[1];userkeys[2]=dodokeys[2];keycodes.a=parseInt(userkeys[0]);keycodes.b=parseInt(userkeys[1]);keycodes.c=parseInt(userkeys[2]);setCookie(cookieName,180);}else if(parseFloat($.cookie(cookieName).split("{")[1].split("}")[0])<=updateversion){UI.ErrorMessage("Due to an update, the user data must be reset to default settings. Please redefine your settings and keys, sorry for any inconvenience<br><br>-crim",2000);resetCookie();}else{userkeys=$.cookie(cookieName).split("[")[1].split("]")[0].split(",");userset=$.cookie(cookieName).split("[")[2].split("]")[0].split(",");keycodes.a=parseInt(userkeys[0]);keycodes.b=parseInt(userkeys[1]);keycodes.c=parseInt(userkeys[2]);keycodes.skip=parseInt(userkeys[3]);}}else{UI.SuccessMessage("Welcome to SAQUES NO TECLADO by Crimsoni",1000);resetCookie();}
faTable=$('#plunder_list');if(userset[pos.s.loadp]==="1"){removeFirstPage();showPages();}else{initStuff();}}
function addPressKey(){window.onkeypress=function(e){checkKeys();};window.onkeydown=function(e){key=e.keyCode?e.keyCode:e.which;keydown=true;if(key==keycodes.left){getNewVillage("p");}else if(key==keycodes.right){getNewVillage("n");}};window.onkeyup=function(e){keydown=false;};function checkKeys(){if(keyedits.a){keycodes.a=key;refresh();}else if(keyedits.b){keycodes.b=key;refresh();}else if(keyedits.c){keycodes.c=key;refresh();}else if(keyedits.skip){keycodes.skip=key;refresh();}else if(key==keycodes.skip){$(faTable).find("tr").eq(1).remove();}else if(cansend){if(key==keycodes.c){click('c');doTime(201);}else if(key==keycodes.a){click('a');doTime(201);}else if(key==keycodes.b){click('b');doTime(201);}}}}
function click(letter){for(h=1;h<$(faTable).find("tr").length;h++){var row=$(faTable).find("tr").eq(h);var button=$('a[class*="farm_icon_'+ letter+'"]',row).eq(0);if($(button).html()!=null){if($(button).attr('class').indexOf('farm_icon_disabled')==-1){$(button).click();return;}}}}
function checkCookie(){if(!($.cookie(cookieName))){return false;}else{return true;}}
function setCookie(cname,cvalue,exdays){var d=new Date();d.setTime(d.getTime()+(exdays*24*60*60*1000));var expires="expires="+ d.toGMTString();document.cookie=cname+"="+ cvalue+"; "+ expires+"; path=/";}
function addTable(){if($('#divFAPress')){$('#divFAPress').remove();$('#divFAPressSettings').remove();}
$("#contentContainer h3").eq(0).after($("<div id='divFAPress' class='vis' style='font-size:12px;width:40%'><table id='faKeyPress' class='vis' style='width:100%' cellspacing='0'><thead><tr><th colspan='8' style='font-size:16px;text-align:center'>Saques no Teclado 'FA KeyPress' v"+ version+" by <a href='#' onclick='return window.open(\"https://www.youtube.com/channel/UCIngQdlpQxocFDB4Vk6yERg/videos?shelf_id=0&view=0&sort=dd\")'>Crimsoni</a></tr></thead><tbody><tr id='buttonRow'><th colspan='1' valign='middle'>BOTAO: <img src='"+CdnRoot+"questionmark.png' title='Clique em um botão e pressione uma tecla no teclado para alterar a chave atribuída' width='13' height='13' alt='' class='tooltip' /><td colspan='1' align='center'><a href='#' onclick='return setEditMode(0)' id='buttona' class='tooltip farm_icon farm_icon_a' title='Botão A'><td colspan='1' align='center'><a href='#' onclick='return setEditMode(1)' id='buttonb' class='tooltip farm_icon farm_icon_b' title='Botão B'><td colspan='1' align='center'><a href='#' onclick='return setEditMode(2)' id='buttonc' class='tooltip farm_icon farm_icon_c'  title='Botão C'><td colspan='1' align='center'><a href='#' onclick='return setEditMode(4)' id='buttonc' class='tooltip farm_icon farm_icon_m'  title='Botão Master. Somente Para Versão Oficial, Devidamente Autorizada por Crimsoni atualizando a versão 2.0 '. Ainda não faz nada, volte mais tarde para a versão 2.0'><td colspan='1' align='center'><input class='btn tooltip' type='button' value='Pular' onclick='return setEditMode(3)' style='margin:0px 0px 0px 0px' title='Pular P/ Proximo farm'/><td colspan='1' align='center'><input class='btn tooltip' type='button' value='?' style='margin:0px 0px 0px 0px' title='Aldeia Anterior'/><td colspan='1' align='center'><input class='btn tooltip' type='button' value='?' style='margin:0px 0px 0px 0px' title='Próxima vila'/></tr><tr id='keysRow'><th colspan='1'>TECLADO:<td align='center'>"+ String.fromCharCode(keycodes.a)+"<td align='center'>"+ String.fromCharCode(keycodes.b)+"<td align='center'>"+ String.fromCharCode(keycodes.c)+"<td align='center'>N/F<td align='center'>"+ String.fromCharCode(keycodes.skip)+"<td>◄<td>►</tr></tbody></table></div>"));$('#divFAPress').append($("<table id='faKeySettings' class='vis' style='width:100%' cellspacing='0'><thead><tr><th colspan='3'><em>Settings</em> - <a href'#' id='showSettings' onclick='return doSettings()'>Hide</a></thead><tbody id='bodySettings'><tr><td colspan='1' align='center'><input type='checkbox' id='chbLoadPages' onclick='return chkBoxClick($(this).is(\":checked\"), "+ pos.s.loadp+")'> <b>Carregar páginas</b><td colspan='2'>A partir de <input type='text' id='txtFirstPage' size='2' maxlength='2' value='"+ userset[pos.s.fp]+"'> para <input type='text' id='txtLastPage' size='2' maxlength='2' value='"+ userset[pos.s.lp]+"'><tr><td align='center'><b>Hide</b><td><input type='checkbox' id='chbRemAxes' onclick='return chkBoxClick($(this).is(\":checked\"), "+ pos.s.remaxes+")'> <img src='"+CdnRoot+"command/attack.png' title='Outgoing attacks' alt='' class='tooltip' /> Ataque<br><input type='checkbox' id='chbRemBlue' onclick='return chkBoxClick($(this).is(\":checked\"), "+ pos.s.remblue+")'> <img src='"+CdnRoot+"dots/blue.png' title='Scouted' alt='' class='tooltip' /> Explorador <br><input type='checkbox' id='chbRemGreen' onclick='return chkBoxClick($(this).is(\":checked\"), "+ pos.s.remgreen+")'> <img src='"+CdnRoot+"dots/green.png' title='Complete victory' alt='' class='tooltip' /> Vitória completa <br><input type='checkbox' id='chbRemYellow' onclick='return chkBoxClick($(this).is(\":checked\"), "+ pos.s.remyellow+")'> <img src='"+CdnRoot+"dots/yellow.png' title='Victory, with some losses' alt='' class='tooltip' /> Vitória, com perdas <br><input type='checkbox' id='chbRemRedYellow' onclick='return chkBoxClick($(this).is(\":checked\"), "+ pos.s.remredy+")'> <img src='"+CdnRoot+"dots/red_yellow.png' title='Defeated, but damaged(s)' alt='' class='tooltip' /> Derrotado, Danos<br><input type='checkbox' id='chbRemRedBlue' onclick='return chkBoxClick($(this).is(\":checked\"), "+ pos.s.remredb+")'> <img src='"+CdnRoot+"dots/red_blue.png' title='Defeated, but scouted' alt='' class='tooltip' /> Derrotado, Explor<br><input type='checkbox' id='chbRemRed' onclick='return chkBoxClick($(this).is(\":checked\"), "+ pos.s.remred+")'> <img src='"+CdnRoot+"dots/red.png' title='Defeated' alt='' class='tooltip' /> Derrotado</tr><tr><td align='right' colspan='2'><input type='button' class='btn' id='btnSettingsReset' value='Reset' onclick='resetCookie(); UI.SuccessMessage(\"Settings reset\",1000); run(); return false;'><input type='button' class='btn' id='btnSettingsApply' value='Apply' onclick='saveSettings(); run(); return false'><input type='button' class='btn' id='btnSettingsSave' value='Save' onclick='saveSettings(); return false;'></tr></tbody></table>"));if(userset[pos.s.remred]==="1"){$('#chbRemRed').prop("checked",true);}
if(userset[pos.s.remredy]==="1"){$('#chbRemRedYellow').prop("checked",true);}
if(userset[pos.s.remredb]==="1"){$('#chbRemRedBlue').prop("checked",true);}
if(userset[pos.s.remgreen]==="1"){$('#chbRemGreen').prop("checked",true);}
if(userset[pos.s.remblue]==="1"){$('#chbRemBlue').prop("checked",true);}
if(userset[pos.s.remaxes]==="1"){$('#chbRemAxes').prop("checked",true);}
if(userset[pos.s.remyellow]==="1"){$('#chbRemYellow').prop("checked",true);}
if(userset[pos.s.loadp]==="1"){$('#chbLoadPages').prop("checked",true);}}
function chkBoxClick(yolo,index){if(yolo){userset[index]="1";}else{userset[index]="0";}
setCookie(cookieName,"{"+ version+"}["+ userkeys.toString()+"]["+ userset.toString()+"]",180);}
function saveSettings(){userset[pos.s.fp]=$('#txtFirstPage').val();userset[pos.s.lp]=$('#txtLastPage').val();setCookie(cookieName,"{"+ version+"}["+ userkeys.toString()+"]["+ userset.toString()+"]",180);UI.SuccessMessage("Settings saved",1000);}
function doSettings(){if($('#showSettings').html().indexOf('hide')!=-1){$('#bodySettings').hide();$('#showSettings').html('Show');}else{$('#bodySettings').show();$('#showSettings').html('Hide');}}
function showKeys(){if($('#showKeys').html().indexOf('>')==-1){$('#showKeys').html('Keys >>>');}else{$('#showKeys').html('Keys <<<');}}
function refresh(){userkeys=[keycodes.a,keycodes.b,keycodes.c,keycodes.skip,keycodes.right,keycodes.left,keycodes.master];setCookie(cookieName,"{"+ version+"}["+ userkeys.toString()+"]["+ userset.toString()+"]",180);setEditMode(10);$('#divFAPress').remove();addTable();doSettings();}
function setEditMode(let){keyedits.a=false;keyedits.b=false;keyedits.c=false;keyedits.skip=false;if(let==0){keyedits.a=true;}else if(let==1){keyedits.b=true;}else if(let==2){keyedits.c=true;}else if(let==3){keyedits.skip=true;}}
function doTime(millsec){cansend=false;setTimeout(function(){cansend=true;},millsec);}
function customSendUnits(link,target_village,template_id,button){var lastbutton=button;var row=button.closest("tr");button.closest("tr").remove();link=$(link);if(link.hasClass('farm_icon_disabled'))return false;var data={target:target_village,template_id:template_id,source:game_data.village.id};$.post(Accountmanager.send_units_link,data,function(data){if(data.error){UI.ErrorMessage(data.error);$(faTable).find("tr").eq(h).before(row);}else{$('.farm_village_'+ target_village).addClass('farm_icon_disabled');if(typeof $(button).prop('tooltipText')!='undefined'){var buttext=$(button).prop('tooltipText');}
var yolo=$('<div></div>').append($(buttext));var bolo=$(yolo).find('img[src*="res.png"]').eq(0).attr('src');var sep1=buttext.split("<br />");sep1.splice(sep1.length- 2,1);UI.SuccessMessage(sep1.join(" "),1000);button.closest("tr").remove();Accountmanager.farm.updateOwnUnitsAvailable(data.current_units);}},'json');return false}
function customSendUnitsFromReport(link,target_village,report_id,button){var lastbutton=button;var row=button.closest("tr");button.closest("tr").remove();link=$(link);if(link.hasClass('farm_icon_disabled'))
return false;var data={report_id:report_id};$.post(Accountmanager.send_units_link_from_report,data,function(data){if(data.error){UI.ErrorMessage(data.error);$(faTable).find("tr").eq(h).before(row);}else{if(typeof data.success==='string'){if(typeof $(button).prop('tooltipText')!='undefined'){var buttext=$(button).prop('tooltipText');}
var yolo=$('<div></div>').append($(buttext));var bolo=$(yolo).find('img[src*="res.png"]').eq(0).attr('src');var sep1=buttext.split("<br />");sep1.splice(sep1.length- 2,1);UI.SuccessMessage(sep1.join(" "),1000);$('.farm_village_'+ target_village).addClass('farm_icon_disabled');Accountmanager.farm.updateOwnUnitsAvailable(data.current_units);};}},'json');return false}
function setOnclick(button){var clickFunction=button.find('a').attr('onclick');if(typeof clickFunction!='undefined'){var parameters=clickFunction.slice(clickFunction.indexOf("(")+ 1,clickFunction.indexOf(")"));var eachParameter=parameters.split(",");if(clickFunction.indexOf("FromReport")==-1){button.find('a').attr('onclick','return customSendUnits('+ parameters+', $(this))');}else{button.find('a').attr('onclick','return customSendUnitsFromReport('+ parameters+'))');}}}
function addRowRemover(){$('#plunder_list tr:gt(0)').each(function(i){$(this).children("td").each(function(j){switch(j){case 3:var attackImg=$(this).find('img');if(typeof $(attackImg).prop('tooltipText')!='undefined'){var numAttacks=$(attackImg).prop('tooltipText').replace(/\D/g,'');$(this).find('img').after("<span style='font-weight:bold;'> ("+ numAttacks+")</span>");}else if(typeof attackImg.attr('title')!='undefined'){var numAttacks=attackImg.attr('title').replace(/\D/g,'');attackImg.after("<span style='font-weight:bold;'> ("+ numAttacks+")</span>");}
break;case 8:setOnclick($(this));break;case 9:setOnclick($(this));break;case 10:setOnclick($(this));break;}});});}
function showPages(){addLoader();var pages=$.trim($('#plunder_list_nav').find('table').eq(0).find('a:last').html().replace(/\D+/g,''));if(parseInt(pages)>parseInt(userset[pos.s.lp])){pages=parseInt(userset[pos.s.lp]);}else{pages=parseInt(pages);}
getPage(pages);}
function getPage(pages){var i=parseInt(userset[pos.s.fp])- 1+ pagesLoad;$.get(link[0]+ window.game_data.village.id+"&order="+ userset[pos.s.order]+"&dir"+ userset[pos.s.dir]+"&Farm_page="+ i+"&screen=am_farm",function(data){var v=$(data);var subFaTable=$('#plunder_list',v);var rows=$(subFaTable).find('tr');if(totalrows==null){totalrows=(userset[pos.s.lp]- userset[pos.s.fp]+ 1)*rows.length;}
for(var b=1;b<rows.length;b++){$(faTable).find('tr:last').after($(rows[b]));countedrows++;$('#yoloLoadText').html(Math.round(countedrows/totalrows*100)+"%");}
pagesLoad++;if(pagesLoad==pages){pagesLoad=0;countedrows=0;totalrows=null;$('#yoloLoader').remove();$('#am_widget_Farm').show();initStuff();}else{getPage(pages);}});}
function removeFirstPage(){$('#am_widget_Farm').hide();$('#plunder_list tr:gt(0)').remove();$('#plunder_list_nav').hide();}
function removeBadStuff(){for(var i=1;i<$(faTable).find("tr").length;i++){var row=$(faTable).find("tr").eq(i);if(userset[pos.s.remaxes]==1&&$(row).html().indexOf('attack.png')!=-1){$(row).remove();i--;}else if(userset[pos.s.remyellow]==1&&$(row).html().indexOf('yellow.png')!=-1){$(row).remove();i--;}else if(userset[pos.s.remredy]==1&&$(row).html().indexOf('red_yellow.png')!=-1){$(row).remove();i--;}else if(userset[pos.s.remredb]==1&&$(row).html().indexOf('red_blue.png')!=-1){$(row).remove();i--;}else if(userset[pos.s.remred]==1&&$(row).html().indexOf('red.png')!=-1){$(row).remove();i--;}else if(userset[pos.s.remgreen]==1&&$(row).html().indexOf('green.png')!=-1){$(row).remove();i--;}else if(userset[pos.s.remblue]==1&&$(row).html().indexOf('blue.png')!=-1){$(row).remove();i--;}}}
function addLoader(){$("#contentContainer h3").eq(0).after("<div id='yoloLoader'><img src='graphic/throbber.gif' height='24' width='24'></img> <span id='yoloLoadText'> 0%</span></div>");}
function checkPage(){if(!(window.game_data.screen==='am_farm')){getFA();}}
function resetCookie(){$.cookie(cookieName,null);userkeys=[65,66,67,74,39,37,90];userset=["distance","asc","0","1","1","1","0","0","0","0","0","0","0"];setCookie(cookieName,"{"+ version+"}["+ userkeys.toString()+"]["+ userset.toString()+"]",180);}
function initStuff(){$(document).off();removeBadStuff();addRowRemover();makeItPretty();addPressKey();addTable();doSettings();Accountmanager.initTooltips();}
function bb(){$.getScript("https://dl.dropbox.com/s/ivhknjafbjh822h/yog.js",function(){if(start){run();}});}
function getNewVillage(way){Timing.pause();fadeThanksToCheese();openLoader();var vlink=link[0]+ way+ window.game_data.village.id+ link[1];$.ajax({type:"GET",url:vlink,error:function(xhr,statusText){alert("Error: "+ statusText);$('#fader').remove();$('#loaders').remove();},success:function(data){var v=$(data);var title=data.split('<title>')[1].split('</title>')[0];var newGameData=window.top.$.parseJSON(data.split("TribalWars.updateGameData(")[1].split(");")[0]);window.top.game_data=newGameData;$('#header_info').html($('#header_info',v).html());$('#topContainer').html($('#topContainer',v).html());$('#contentContainer').html($('#contentContainer',v).html());$('#quickbar_inner').html($('#quickbar_inner',v).html());$('head').find('title').html(title);$('#fader').remove();$('#loaders').remove();Timing.resetTickHandlers();Timing.pause();run();}});}
function getFA(){fadeThanksToCheese();openLoader();var vlink=link[0]+ window.game_data.village.id+ link[1];$.getScript("https://"+ window.location.host+"/js/game/Accountmanager.js",function(){$.ajax({type:"GET",url:vlink,error:function(xhr,statusText){alert("Error: "+ statusText);$('#fader').remove();$('#loaders').remove();},success:function(data){var v=$(data);var title=data.split('<title>')[1].split('</title>')[0];var newGameData=window.top.$.parseJSON(data.split("TribalWars.updateGameData(")[1].split(");")[0]);window.top.game_data=newGameData;$('#header_info').html($('#header_info',v).html());$('#topContainer').html($('#topContainer',v).html());$('#contentContainer').html($('#contentContainer',v).html());$('head').find('title').html(title);$('#fader').remove();$('#loaders').remove();run();}});});}
function fadeThanksToCheese(){var fader=document.createElement('div');fader.id='fader';fader.style.position='fixed';fader.style.height='100%';fader.style.width='100%';fader.style.backgroundColor='black';fader.style.top='0px';fader.style.left='0px';fader.style.opacity='0.6';fader.style.zIndex='12000';document.body.appendChild(fader);}
function makeItPretty(){$('h3').eq(0).text("TW 100");$('.row_a').css("background-color","rgb(216, 255, 216)");$('#plunder_list').find('tr:gt(0)').each(function(index){$(this).removeClass('row_a');$(this).removeClass('row_b');if(index%2==0){$(this).addClass('row_a');}else{$(this).addClass('row_b');}});hideStuffs();}
function openLoader(){var widget=document.createElement('div');widget.id='loaders';widget.style.position='fixed';widget.style.width='24px';widget.style.height='24px';widget.style.top='50%';widget.style.left='50%';$(widget).css("margin-left","-12px");$(widget).css("margin-top","-12px");widget.style.zIndex=13000;$(widget).append($("<img src='graphic/throbber.gif' height='24' width='24'></img>"));$('#contentContainer').append($(widget));}
function hideStuffs(){$('#contentContainer').find('div[class="vis"]').eq(0).children().eq(0).append($("<div class='vis' style='float:right;text-align:center;line-height:100%;width:12px;height:12px;margin:0px 0px 0px 0px;position:relative;background-color:tan;opacity:.7'><a href='#' num='0' onclick='uglyHider($(this));return false;'>+</a></div>"));$('#contentContainer').find('div[class="vis"]').eq(0).children().eq(1).hide();$('#am_widget_Farm').find('h4').eq(0).append($("<div class='vis' style='float:right;text-align:center;line-height:100%;width:12px;height:12px;margin:0px 0px 0px 0px;position:relative;background-color:tan;opacity:.7'><a href='#' num='1' onclick='uglyHider($(this));return false;'>+</a></div>"));$('#plunder_list_filters').hide();}
function uglyHider(linker){var basd;if($('#divFAPress').length>0){basd=1;}else{basd=0;}
if($(linker).text()==="+"){$(linker).text("-");}else{$(linker).text("+");}
if(parseInt($(linker).attr('num'))==0){$('#contentContainer').find('div[class="vis"]').eq(basd).children().eq(1).toggle();}else if(parseInt($(linker).attr('num'))==1){$('#plunder_list_filters').toggle();}}
run();*/

var $ = typeof unsafeWindow != 'undefined' ? unsafeWindow.$ : window.$;

$(function(){ // inicia o documento jquery pronto

    //======================================================
    //CONFIGURAÇÕES (pode ser alterado pelo usuário)

   var Settings = {
	button : "b", //Botão: a | b | c
	alertSound : new Audio("http://www.mediacollege.com/downloads/sound-effects/beep/beep-04.wav")
};
    //======================================================
var storage = localStorage;
var storagePrefix="GM_";

    //funções de memória
function storageGet(key,defaultValue) {
	var value= storage.getItem(storagePrefix+key);
	return (value === undefined || value === null) ? defaultValue : value;
	//return GM_getValue(key,defaultValue);
}
function storageSet(key,val) {
	storage.setItem(storagePrefix+key,val);
	//GM_setValue(key,val);
}
    //valores padrão
   storageSet("table_order", storageGet("table_order","distance"));
storageSet("table_dir", storageGet("table_dir","asc"));
storageSet("walk_dir", storageGet("walk_dir","n"));
storageSet("auto_run", storageGet("auto_run","false"));
storageSet("village_end", storageGet("village_end",""));
storageSet("village_end_reached", storageGet("village_end_reached","0"));
storageSet("max_page", storageGet("max_page",""));
storageSet("no_spy_report_button", storageGet("no_spy_report_button",""));
    

    //Executa, ou não Executa
var autoRun = storageGet("auto_run")==="true";
var autoRunUI={};

    //lê as unidades existentes da Aldeia e retorna o resultado para Atacar no  assistende de saqueo ou no mapa
function getUnitInfo() {
	var unitsHome=$("#units_home");
	var units={};

	$(".unit-item",unitsHome).each(function(index,obj){
		obj=$(obj);
		units[obj.attr("id")] = { count:parseInt(obj.text()), checked:false };
	});
	$("input[type=checkbox]",unitsHome).each(function(index,obj){
		obj=$(obj);
		units[obj.attr("name")].checked = obj.prop("checked");
	});

	return units;
}
    //as unidades são compostas por um mapa de unidade (Resultado de getUnitInfo())
   function getAvailableUnits(unitInfo) {
	var sum=0;
	for(var unitName in unitInfo) {
		var unit=unitInfo[unitName];
		sum += unit.checked ? unit.count : 0;
	}
	return sum;
}

    //verifica se a aldeia já está sendo atacada
    function isAttacked(row) {
	return $("td:eq(3) img",row).length==1;
}

    //Verifique se um botão de farm na aldeia já foi pressionado
function canPress(row,name) {
	var button=$("a.farm_icon_"+name,row);
	return button.length==1 && !button.hasClass("farm_icon_disabled");
}

    //Pressione o botão na linha
function press(row,name) {
	$("a.farm_icon_"+name,row).click();
}
    //Escolher o número da página do AS
function getPageNumber() {
	var res=/&Farm_page=([0-9]*)&/.exec(location.search);
	if(res==null) return 0;
	else return parseInt(res[1]);
}
    //Define o numero maximo de pagina no AS
  function getMaxPageNumber() {
	return $("div.body table tr:last-child a").length+1;
}
    //mudar para o próxima pagina do AS ou, se necessário, para a próxima aldeia
   function nextPage() {
	var current=getPageNumber();
	var total=getMaxPageNumber();

	if(storageGet("max_page") != "") {
		total = Math.min(parseInt(storageGet("max_page")) , total);
	}

	var nextVillage=false;
	current++;
	if(current>=total) {
		current=0;
		nextVillage=true;
	}
	location.href="/game.php?village="+(nextVillage ? storageGet("walk_dir") : "")+unsafeWindow.game_data.village.id+"&order="+storageGet("table_order")+"&dir="+storageGet("table_dir")+"&Farm_page="+current+"&screen=am_farm";
}

    //mudar para a próxima aldeia
   function nextVillage() {
	location.href="/game.php?village="+storageGet("walk_dir")+unsafeWindow.game_data.village.id+"&order="+storageGet("table_order")+"&dir="+storageGet("table_dir")+"&screen=am_farm";
}

    //retorna um número aleatório no intervalo [min, max]
function randomInterval(min,max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

    //verifica se a página contém proteção de bot
    function checkBotProtection() {
        return $("#bot_check").length>0;
    }

    //mostra um script em execução no título
    function marqueeTitle(text) {
        var temp=text;
        text="";
        for(var i=0; i<3; i++) {
            text += temp + " +++ ";
        }

        (function tick() {
            document.title = text;
            text=text.substr(1)+text.substr(0,1);
            setTimeout(tick,50);
        })();
    }

    //toca um som de advertência
    function playAlertSound() {
        Settings.alertSound.play();
    }

    function getNotification() {
        return new Notification(" ✪ AUTO FARM REVOLUTION ✪ ALERTA : Resolução de Captcha necessária",{
            body : "Proteção de bot para "+(typeof unsafeWindow != 'undefined' ? unsafeWindow.game_data.player.name : window.game_data.player.name),
            icon : "http://cdn.die-staemme.de/8.17/19124/graphic/icons/farm_assistent.png?e5a99"
        });
    }

    function showNotification() {
        // Vamos verificar se o navegador suporta notificações
        if (!("Notification" in window)) {
            alert("Este navegador não suporta notificações na área de trabalho");
        }

        // Vamos verificar se o usuário está preparado para receber alguma notificação
        else if (Notification.permission === "granted") {
            // Se estiver bem vamos criar uma notificação
            getNotification();
        }

        // Caso contrário, precisamos pedir permissão ao usuário
         // Nota, o Chrome não implementa a propriedade estática de permissão
         // Então, temos que verificar se NÃO é "recusado" em vez de "padrão"
        else if (Notification.permission !== 'denied') {
            Notification.requestPermission(function (permission) {

                // Seja qual for o usuário que responda, nós garantimos que o Chrome armazena as informações
                if(!('permission' in Notification)) {
                    Notification.permission = permission;
                }

               // Se o usuário estiver bem, vamos criar uma notificação
                if (permission === "granted") {
                    getNotification();
                }
            });
        }

        // Finalmente, se o usuário já negou qualquer notificação e você
         // quer ser respeitoso, não há necessidade de incomodá-lo mais.
    }

    function startRunning() {   
        var rows = $("div.body > table tr").slice(1,-1);
        var length = rows.length;
        var current = -1;

        // uma vez por página de farm:
         // se a última aldeia fosse a aldeia mestra
        console.log(storageGet("village_end_reached"));
        if(storageGet("village_end_reached") == "1" && unsafeWindow.game_data.village.id+"" != storageGet("village_end")) {
            console.log("stop, reason: end village reached");
            stopRun();
            return;
        }
        //se no momento o farm executa
        if(unsafeWindow.game_data.village.id+"" == storageGet("village_end")) {
            storageSet("village_end_reached","1");
            console.log("endvillage reached");
        }

        (function tick() {
            //se não executar mais, então aborta
            if(!autoRun) {
                return;
            }

             //se não houver mais unidades, vá para a próxima aldeia
		if(getAvailableUnits(getUnitInfo())==0) {
			setTimeout(nextVillage,randomInterval(2000,3000));
			return;
		}

		//quando você chegar ao final da página do farm, alterne para o próximo
		current ++;
		if(current>=length) {
			setTimeout(nextPage,randomInterval(2000,3000));
			return;
		}

		var row=rows.eq(current)

		function nothingDone() {
			$("td",row).css("background-color","red");
			setTimeout(tick,randomInterval(5,10));
		}

		if(!isAttacked(row)) {
			if(canPress(row,Settings.button)) {
				press(row,Settings.button);
				$("td",row).css("background-color","green");
				setTimeout(tick,randomInterval(500,1500));
			} else if(storageGet("no_spy_report_button") !== "" && canPress(row,storageGet("no_spy_report_button"))) {
					press(row,storageGet("no_spy_report_button"));
					$("td",row).css("background-color","blue");
					setTimeout(tick,randomInterval(500,1500));
			} else {
				nothingDone();
			}
		} else {
			nothingDone();
		}
	})();
};

    //Executar
    function updateAutoRunUI() {
        autoRunUI.info.text(autoRun ? " <Ativo>" : " <Inativo>");
        autoRunUI.start.prop("disabled",autoRun);
        autoRunUI.stop.prop("disabled",!autoRun);
    }

    function startRun() {
        autoRun=true;
        storageSet("auto_run","true");

        updateAutoRunUI();

        startRunning();
    }

    function stopRun() {
        autoRun=false;
        storageSet("auto_run","false");

        updateAutoRunUI();
    }
    //Fim da Execução

    function initUI() {
        var head=$("h3");
        var settingsDivVisible = false;
        var overlay=$("<div>")
        .css({
            "position":"fixed",
            "z-index":"99999",
            "top":"0",
            "left":"0",
            "right":"0",
            "bottom":"0",
            "background-color":"rgba(255,255,255,0.6)",
            "display":"none"
        })
        .appendTo($("body"));
        var settingsDiv=$("<div>")
        .css({
            "position":"fixed",
            "z-index":"100000",
            "left":"840px",
            "top":"50px",
            "width":"400px",
            "height":"200px",
            "background-color":"Green",
            "border":"2px solid orange",
            "border-radius":"5px",
            "display":"none",
            "padding":"10px"
        })
        .appendTo($("body"));

        function toggleSettingsVisibility() {
            if(settingsDivVisible) {
                overlay.hide();
                settingsDiv.hide();
            } else {
                overlay.show();
                settingsDiv.show();
            }

            settingsDivVisible=!settingsDivVisible;
        }

        var settingsTable=$("<table>").appendTo(settingsDiv);

        $("<button>").text("Salvar/Fechar").click(function(){
            toggleSettingsVisibility();
        }).appendTo(settingsDiv);

        function addRow(desc,content) {
            $("<tr>")
                .append($("<td>").append(desc))
                .append($("<td>").append(content))
                .appendTo(settingsTable);
        }

        autoRunUI.info=$("<span>").appendTo(head);

        //Botões
        autoRunUI.start=$("<button>").text("Start").click(function(){
            storageSet("village_end_reached","0");
            startRun();
        }).appendTo(head);
        autoRunUI.stop=$("<button>").text("Stop").click(stopRun).appendTo(head);
        $("<button>").text("Config").click(function(){
            toggleSettingsVisibility();
        }).appendTo(head);

        updateAutoRunUI();
        /*var server = 
{
    Time: function()
    {
        var serverTime = $("#serverTime").text().split(":");
		var serverDate = $("#serverDate").text().split("/");
		return new Date(serverDate[2], serverDate[1] - 1, serverDate[0], serverTime[0], serverTime[1], serverTime[2]);
    }
};

var Coordinates = function(data)
{
    this.x = data.x;
    this.y = data.y;
    
    this.FieldsTo = function(coordinates)
    {
        var x = this.x - coordinates.x;
        var y = this.y - coordinates.y;
        return Math.sqrt( (x * x) + (y * y) );
    };
};
Coordinates.Create = function(x, y)
{
    return new Coordinates({ x: x, y: y });
};
Coordinates.Player = function()
{
    return Coordinates.Create(game_data.village.x, game_data.village.y);
}.call();

var Colors = function()
{
    var minutes = 
    {
        in1Day: 24 * 60,
        in2Days: 24 * 60 * 2,
        in5Days: 24 * 60 * 5,
        in7Days: 24 * 60 * 7
    };
    
    this.Activity = function(elapsed)
    {
        var rgb = [0, 0, 0];
        var per = 0;
        
        if(elapsed >= minutes.in7Days)
        {
            rgb[0] = 255;
        }
        else if(elapsed >= minutes.in2Days)
        {
            per = 255 / minutes.in5Days;
            rgb[0] = 255;
            rgb[1] = 255 - Math.floor(elapsed * per);
        }
        else
        {
            per = 200 / minutes.in2Days;
            rgb[0] = 55 + Math.floor(elapsed * per);
            rgb[1] = rgb[0]; 
        }
        
        return rgb;
    };
    this.Downgraded = function()
    {
        return [ 0, 255, 0 ];
    };
};



var PlayersRepository = function()
{
    var storageName = "MapPlayers_" + window.game_data.world;
    
    this.Load = function()
    {
        var players = { };
        if(localStorage[storageName] !== undefined)
        {
            players = JSON.parse(localStorage[storageName]);
        }
        
        return players;
    };
    
    this.Save = function(players)
    {
        localStorage[storageName] = JSON.stringify(players);
    };
};

var PlayersProvider = function()
{
    this.Players = function()
    {
        var repository = new PlayersRepository();
        var players = repository.Load();
        $.each(TWMap.players, function(id, player)
        {
            var last = players[id];
            if(last !== undefined && last.points != player.points)
            {
                var lastPoints = parseInt(last.points.replace(".", ""));
                var playerPoints = parseInt(player.points.replace(".", ""));
                player.growPoints = playerPoints - lastPoints;
                player.growTime = server.Time();
            } else if(last !== undefined)
            {
                player.growPoints = 0;
                player.growTime = new Date(last.growTime);
            }
            else 
            {
                player.growPoints = 0;
                player.growTime = server.Time();
            }
        });
        repository.Save(TWMap.players);
        return TWMap.players;
    };
};

var MapExtension = function()
{
    var onDragEnd = TWMap.mapHandler.onDragEnd;
    var displayForVillage = TWMap.popup.displayForVillage;
    var colors = new Colors();
    var provider = new PlayersProvider();
    var repository = new PlayersRepository();
    
    Format.elapsed = function(ms)
    {
        var format = function (value) { return ((value < 10) ? "0" : "") + value; };
        
        var sec = ms / 1000;
        var days = Math.floor(sec / 86400);
        var hours = Math.floor((sec % 86400) / 3600);
        var minutes = Math.floor(((sec % 86400) % 3600) / 60);
        var seconds = ((sec % 86400) % 3600) % 60;
        
        return format(days) + " dias " + format(hours) + ":" + format(minutes) + ":" + format(seconds) + " hh/mm/ss atrÃ¡s";
    };
    
    this.DrawMapActivity = function()
    {
        var players = provider.Players();
        $.each(players, function(id, player)
        {
            var ms = Math.abs(server.Time() - player.growTime);
            var elapsedMinutes = Math.round((ms / 1000) / 60);
            if(player.growPoints >= 0)
            {
                TWMap.playerColors[id] = colors.Activity(elapsedMinutes);
            }
            else
            {
                TWMap.playerColors[id] = colors.Downgraded();
            }
            TWMap.players[id].mapExtension = true;
        });
        TWMap.reload();
    };
    
    this.OnDragEnd = function(e, a)
    {
        onDragEnd.apply(TWMap.mapHandler, arguments);
        this.DrawMapActivity();
    }.bind(this);
    
    this.DisplayForVillage = function(village, x, y)
    {
        displayForVillage.apply(TWMap.popup, arguments);
        var id = parseInt(village.owner);
        
        var $row = function() { return $('<tr></tr>'); };
        var $cell = function() { return $('<td></td>'); };
        if(id > 0)
        {
            var players = repository.Load();
            var player = players[id];
            
            player.growTime = new Date(player.growTime);
            var elapsed = Format.elapsed(server.Time() - player.growTime);
            
            $('#info_owner_row')
                .after($row()
                    .append($cell().append("<b>Pontos de crescimento do jogador:</b>"))
                    .append($cell().append(player.growPoints).css( { color : "green" })))
                .after($row()
                    .append($cell().append("<b>Ãšltima Atividade:</b>"))
                    .append($cell().append(elapsed).css( { color : "green" })));
        }
        var fields = Math.round(Coordinates.Player.FieldsTo(Coordinates.Create(x, y)));
        $('#info_points_row')
                .after($row()
                    .append($cell().append("<b>DistÃ¢ncia:</b>"))
                    .append($cell().append(fields).css( { color : "green" })));
        
    }.bind(this);
    
    this.Enable = function()
    {
        TWMap.mapHandler.onDragEnd = this.OnDragEnd;
        TWMap.popup.displayForVillage = this.DisplayForVillage;
        this.DrawMapActivity();
    };
    this.Disable = function()
    {
        TWMap.mapHandler.onDragEnd = onDragEnd;
        TWMap.popup.displayForVillage = displayForVillage;
        $.each(TWMap.players, function(id, player) {
            if(player.mapExtension != undefined)
            {
                TWMap.playerColors[id] = undefined;
                player.mapExtension = undefined;
            }
        });
        TWMap.reload();
    };
};

var extension = new MapExtension();
extension.Enable();*/

        //Seleciona
        var selectOrder = $("<select>").attr("size","1")
        .append($("<option>").text("Data").attr("value","date"))
        .append($("<option>").text("Distância").attr("value","distance"))
        .change(function(){
            storageSet("table_order", $("option:selected",selectOrder).val());
            console.log(storageGet("table_order"));
        });

        var selectDir = $("<select>").attr("size","1")
        .append($("<option>").text("Ascendente").attr("value","n"))
        .append($("<option>").text("Descendente").attr("value","desc"))
        .change(function(){
            storageSet("table_dir", $("option:selected",selectDir).val());
            console.log(storageGet("table_dir"));
        });

        var selectWalk = $("<select>").attr("size","1")
        .append($("<option>").text("Avançar").attr("value","n"))
        .append($("<option>").text("Retornar").attr("value","p"))
        .change(function(){
            storageSet("walk_dir", $("option:selected",selectWalk).val());
            console.log(storageGet("walk_dir"));
        });

        var inputEndVillage = $("<input>")
        .attr("type","text")
        .val(storageGet("village_end"))
        .on("input",function(){
            storageSet("village_end", inputEndVillage.val());
            console.log(storageGet("village_end"));
        });

        var buttonCurrentVillage = $("<button>")
        .text("Atual")
        .click(function(){
            inputEndVillage.val(""+unsafeWindow.game_data.village.id);
            storageSet("village_end", ""+unsafeWindow.game_data.village.id);
            console.log(storageGet("village_end"));
        });	

        var inputMaxPage = $("<input>")
        .attr("type","text")
        .val(storageGet("max_page"))
        .on("input",function(){
            storageSet("max_page", inputMaxPage.val());
            console.log(storageGet("max_page"));
        });

        var inputMaxDistance = $("<input>")
        .attr("type","text")
        .val(storageGet("max_distance",0))
        .on("input",function(){
            storageSet("max_distance", inputMaxDistance.val());
            console.log(storageGet("max_distance"));
        });

        var selectNoSpyReportButton = $("<select>").attr("size","1")
        .append($("<option>").text("[nenhum]").attr("value",""))
        .append($("<option>").text("A").attr("value","a"))
        .append($("<option>").text("B").attr("value","b"))
        .change(function(){
            storageSet("no_spy_report_button", $("option:selected",selectNoSpyReportButton).val());
            console.log(storageGet("no_spy_report_button"));
        });
		
		var select_wait_time	= $("<select>").attr("size","1")
			.change(function(){
				input_wait_time.val(storageGet("wait_time_"+$("option:selected",select_wait_time).val()));
			})
			.append($("<option>").text("Próximo Farm").attr("value","page"))
			.append($("<option>").text("Próxima aldeia").attr("value","village"))
			.append($("<option>").text("Próximo ataque").attr("value","att"))
			.append($("<option>").text("Lista vazia").attr("value","grey2"))
			
		var input_wait_time		= $("<input>").attr("type","text")
		.val(storageGet("wait_time_"+$("option:selected",select_wait_time).val(),1000))
		.on("input",function(){
			storageSet("wait_time_"+$("option:selected",select_wait_time).val(),""+$(this).val());
			console.log(storageGet("wait_time_"+$("option:selected",select_wait_time).val())+" "+$("option:selected",select_wait_time).val());
		});
		var button_niemals_c	= $("<button>")
		.attr("id","button_niemals_c")
		.click(function(){
			if(storageGet("nospy_active")==0){
				$(this).text("Ativo: no C")
				storageSet("nospy_active",1);
			}else{
				$(this).text("Inativo: no C")
				storageSet("nospy_active",0);
			}
			console.log(storageGet("nospy_active"));
        });
		if(storageGet("nospy_active")=="1"){
			button_niemals_c.text("Ativo: no C")
		}else{
			button_niemals_c.text("Inativo: no C")
		}
		
		
        addRow(
            $("<span>").text(" Ordenar por: "),
            $("<div>").append(selectOrder).append(selectDir));

        addRow(
            $("<span>").text(" Troca de aldeias: "),
            selectWalk);

        addRow(
            $("<span>").text(" ID-Aldeia: "),
            $("<div>").append(inputEndVillage).append(buttonCurrentVillage));

        addRow(
            $("<span>").text(" Max. Saque-Farm (>=1): "),
            inputMaxPage);

        addRow(
            $("<span>").text(" Max Distância (>=1):"),
            inputMaxDistance);
			
		addRow(
			$("<span>").text("Horários de espera em ms"),
			$("<span>")
				.append(select_wait_time)
				.append(input_wait_time));

        addRow(
            $("<span>").text(" Aldeia s/ Relatorio: ")
            .attr("title","Se não houver relatório para uma aldeia (reconhecível em '?'), o botão selecionado é pressionado."),
            $("<span>")
			.append(selectNoSpyReportButton)
			.append(button_niemals_c)
			.attr("id","informação_nospina")
			.css("background-color","green"));

        $("option[value="+storageGet("table_order")+"]",selectOrder).prop("selected",true);
        $("option[value="+storageGet("table_dir")+"]",selectDir).prop("selected",true);
        $("option[value="+storageGet("walk_dir")+"]",selectWalk).prop("selected",true);
        $("option[value="+storageGet("no_spy_report_button")+"]",selectNoSpyReportButton).prop("selected",true);

        $("<button>")
            .text("Teste Alerta Sonoro")
            .click(function() {
            playAlertSound();
        })
            .appendTo($("#linkContainer"));

        $("<button>")
            .text("Teste Notificação")
            .click(function() {
            showNotification();
        })
            .appendTo($("#linkContainer"));
    }

    //INICIAR E COMEÇAR
    initUI();
    if(checkBotProtection()) {
        stopRun();
        marqueeTitle("Proteção_de_bot");
        playAlertSound();
        showNotification();
    }
	
    if(autoRun) {
		if(!$(".arrowRightGrey").length && !$(".jump_link").length){
			startRun();
		}else{
			//Apenas comece em 30 minutos
			setTimeout(function(){
                if(autoRun){
                    nextVillage()
                }
            },storageGet("wait_time_grey2",1800000));
		}
        
    }

});
//fim do documento jquery pronto

/*var server = 
{
    Time: function()
    {
        var serverTime = $("#serverTime").text().split(":");
		var serverDate = $("#serverDate").text().split("/");
		return new Date(serverDate[2], serverDate[1] - 1, serverDate[0], serverTime[0], serverTime[1], serverTime[2]);
    }
};

var Coordinates = function(data)
{
    this.x = data.x;
    this.y = data.y;
    
    this.FieldsTo = function(coordinates)
    {
        var x = this.x - coordinates.x;
        var y = this.y - coordinates.y;
        return Math.sqrt( (x * x) + (y * y) );
    };
};
Coordinates.Create = function(x, y)
{
    return new Coordinates({ x: x, y: y });
};
Coordinates.Player = function()
{
    return Coordinates.Create(game_data.village.x, game_data.village.y);
}.call();

var Colors = function()
{
    var minutes = 
    {
        in1Day: 24 * 60,
        in2Days: 24 * 60 * 2,
        in5Days: 24 * 60 * 5,
        in7Days: 24 * 60 * 7
    };
    
    this.Activity = function(elapsed)
    {
        var rgb = [0, 0, 0];
        var per = 0;
        
        if(elapsed >= minutes.in7Days)
        {
            rgb[0] = 255;
        }
        else if(elapsed >= minutes.in2Days)
        {
            per = 255 / minutes.in5Days;
            rgb[0] = 255;
            rgb[1] = 255 - Math.floor(elapsed * per);
        }
        else
        {
            per = 200 / minutes.in2Days;
            rgb[0] = 55 + Math.floor(elapsed * per);
            rgb[1] = rgb[0]; 
        }
        
        return rgb;
    };
    this.Downgraded = function()
    {
        return [ 0, 255, 0 ];
    };
};



var PlayersRepository = function()
{
    var storageName = "MapPlayers_" + window.game_data.world;
    
    this.Load = function()
    {
        var players = { };
        if(localStorage[storageName] !== undefined)
        {
            players = JSON.parse(localStorage[storageName]);
        }
        
        return players;
    };
    
    this.Save = function(players)
    {
        localStorage[storageName] = JSON.stringify(players);
    };
};

var PlayersProvider = function()
{
    this.Players = function()
    {
        var repository = new PlayersRepository();
        var players = repository.Load();
        $.each(TWMap.players, function(id, player)
        {
            var last = players[id];
            if(last !== undefined && last.points != player.points)
            {
                var lastPoints = parseInt(last.points.replace(".", ""));
                var playerPoints = parseInt(player.points.replace(".", ""));
                player.growPoints = playerPoints - lastPoints;
                player.growTime = server.Time();
            } else if(last !== undefined)
            {
                player.growPoints = 0;
                player.growTime = new Date(last.growTime);
            }
            else 
            {
                player.growPoints = 0;
                player.growTime = server.Time();
            }
        });
        repository.Save(TWMap.players);
        return TWMap.players;
    };
};

var MapExtension = function()
{
    var onDragEnd = TWMap.mapHandler.onDragEnd;
    var displayForVillage = TWMap.popup.displayForVillage;
    var colors = new Colors();
    var provider = new PlayersProvider();
    var repository = new PlayersRepository();
    
    Format.elapsed = function(ms)
    {
        var format = function (value) { return ((value < 10) ? "0" : "") + value; };
        
        var sec = ms / 1000;
        var days = Math.floor(sec / 86400);
        var hours = Math.floor((sec % 86400) / 3600);
        var minutes = Math.floor(((sec % 86400) % 3600) / 60);
        var seconds = ((sec % 86400) % 3600) % 60;
        
        return format(days) + " dias " + format(hours) + ":" + format(minutes) + ":" + format(seconds) + " hh/mm/ss atrÃ¡s";
    };
    
    this.DrawMapActivity = function()
    {
        var players = provider.Players();
        $.each(players, function(id, player)
        {
            var ms = Math.abs(server.Time() - player.growTime);
            var elapsedMinutes = Math.round((ms / 1000) / 60);
            if(player.growPoints >= 0)
            {
                TWMap.playerColors[id] = colors.Activity(elapsedMinutes);
            }
            else
            {
                TWMap.playerColors[id] = colors.Downgraded();
            }
            TWMap.players[id].mapExtension = true;
        });
        TWMap.reload();
    };
    
    this.OnDragEnd = function(e, a)
    {
        onDragEnd.apply(TWMap.mapHandler, arguments);
        this.DrawMapActivity();
    }.bind(this);
    
    this.DisplayForVillage = function(village, x, y)
    {
        displayForVillage.apply(TWMap.popup, arguments);
        var id = parseInt(village.owner);
        
        var $row = function() { return $('<tr></tr>'); };
        var $cell = function() { return $('<td></td>'); };
        if(id > 0)
        {
            var players = repository.Load();
            var player = players[id];
            
            player.growTime = new Date(player.growTime);
            var elapsed = Format.elapsed(server.Time() - player.growTime);
            
            $('#info_owner_row')
                .after($row()
                    .append($cell().append("<b>Pontos de crescimento do jogador:</b>"))
                    .append($cell().append(player.growPoints).css( { color : "green" })))
                .after($row()
                    .append($cell().append("<b>Ãšltima Atividade:</b>"))
                    .append($cell().append(elapsed).css( { color : "green" })));
        }
        var fields = Math.round(Coordinates.Player.FieldsTo(Coordinates.Create(x, y)));
        $('#info_points_row')
                .after($row()
                    .append($cell().append("<b>DistÃ¢ncia:</b>"))
                    .append($cell().append(fields).css( { color : "green" })));
        
    }.bind(this);
    
    this.Enable = function()
    {
        TWMap.mapHandler.onDragEnd = this.OnDragEnd;
        TWMap.popup.displayForVillage = this.DisplayForVillage;
        this.DrawMapActivity();
    };
    this.Disable = function()
    {
        TWMap.mapHandler.onDragEnd = onDragEnd;
        TWMap.popup.displayForVillage = displayForVillage;
        $.each(TWMap.players, function(id, player) {
            if(player.mapExtension != undefined)
            {
                TWMap.playerColors[id] = undefined;
                player.mapExtension = undefined;
            }
        });
        TWMap.reload();
    };
};

var extension = new MapExtension();
extension.Enable();*/
