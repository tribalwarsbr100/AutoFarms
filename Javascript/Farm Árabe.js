/*
A = 8
B = 9
C = 10
*/
/*
(Math.random() * xxx) + yyy));
*/
var type = 8;
var speed = 6500;
setInterval(
function(){
$('#plunder_list tr:eq(1) td:eq('+ type +') a').click();
$('#plunder_list tr:eq(1)').remove();
},Math.ceil( (Math.random() * 201) + 201 ));
setTimeout(
function(){
if ( $('#village_switch_right').length === 0){
location.reload();
}else{
location.href = $('#village_switch_right').attr('href');
}
}, speed);
