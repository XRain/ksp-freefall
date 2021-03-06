window.j = {};
window.j["calcResult"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (data) {
buf.push("<div><p>Результат - " + (jade.escape((jade_interp = data.statusTitle) == null ? '' : jade_interp)) + "</p><p>" + (jade.escape((jade_interp = data.statusMsg) == null ? '' : jade_interp)) + "<input id=\"calcAlt\"" + (jade.attr("value", '' + (data.alt) + '', true, false)) + " type=\"text\" readonly=\"readonly\" class=\"hidden short\"/><input id=\"calcTotalBurned\"" + (jade.attr("value", '' + (data.totalBurned) + '', true, false)) + " type=\"text\" readonly=\"readonly\" class=\"hidden short\"/><br/>Высота от поверхности:<input id=\"calcSurfaceAlt\"" + (jade.attr("value", '' + (data.realAlt) + '', true, false)) + " type=\"text\" readonly=\"readonly\" class=\"short\"/>м.<br/>Скорость:<input id=\"calcSpeed\"" + (jade.attr("value", '' + (data.speed) + '', true, false)) + " type=\"text\" readonly=\"readonly\" class=\"short\"/>м/сек.<input id=\"calcTime\"" + (jade.attr("value", '' + (data.time) + '', true, false)) + " type=\"text\" readonly=\"readonly\" class=\"hidden short\"/></p></div><div><input id=\"nextComment\" placeholder=\"Примечание\"/></div><button id=\"add\">Добавить в план</button>");}.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined));;return buf.join("");
}
window.j["calcStat"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (data, init) {
buf.push("<p class=\"calc-conditions\">Рассчет для высоты " + (jade.escape((jade_interp = init.alt) == null ? '' : jade_interp)) + " метров<br/>Начальная скорость:<input" + (jade.attr("value", '' + (init.speed) + '', true, false)) + " type=\"text\" readonly=\"readonly\"/>м/сек.<br/>Лимит времени:<input" + (jade.attr("value", '' + (init.timeLimit) + '', true, false)) + " type=\"text\" readonly=\"readonly\"/>сек.<br/>Торможение:<input id=\"calcDrag\"" + (jade.attr("value", '' + (data.drag) + '', true, false)) + " type=\"text\" readonly=\"readonly\"/>%.<br/>Ускорение свободного падения:<br/><input" + (jade.attr("value", '' + (data.startG) + '', true, false)) + " type=\"text\" readonly=\"readonly\" class=\"short\"/>м/сек. в начальной точке,<input" + (jade.attr("value", '' + (data.g) + '', true, false)) + " type=\"text\" readonly=\"readonly\" class=\"short\"/>м/сек. в конечной точке</p>");}.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined,"init" in locals_for_with?locals_for_with.init:typeof init!=="undefined"?init:undefined));;return buf.join("");
}
window.j["planNode"] = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (data) {
buf.push("<li class=\"plan-node\"><b>Время:</b><input" + (jade.attr("value", '' + (data.lastTime) + '', true, false)) + " name=\"last-time\" type=\"text\" readonly=\"readonly\" class=\"short flight-time\"/>Интервал:<input" + (jade.attr("value", '' + (data.time) + '', true, false)) + " name=\"time\" type=\"text\" readonly=\"readonly\" class=\"short\"/>сек.<p class=\"notes\">" + (jade.escape((jade_interp = data.misc.note) == null ? '' : jade_interp)) + "</p><p>Высота:<input" + (jade.attr("value", '' + (data.alt) + '', true, false)) + " name=\"alt\" type=\"text\" readonly=\"readonly\" class=\"hidden short\"/><input" + (jade.attr("value", '' + (data.fuelConsumed) + '', true, false)) + " name=\"fuel-consumed\" type=\"text\" readonly=\"readonly\" class=\"hidden short\"/><input" + (jade.attr("value", '' + (data.surfaceAlt) + '', true, false)) + " name=\"surface-alt\" type=\"text\" readonly=\"readonly\" class=\"short\"/></p><p>Скорость:<input" + (jade.attr("value", '' + (data.speed) + '', true, false)) + " name=\"speed\" type=\"text\" readonly=\"readonly\" class=\"short\"/></p><b class=\"nodeDrag\">Торможение:</b><input name=\"drag\" type=\"text\" class=\"short\"/>% на<input name=\"dragTime\" type=\"text\" class=\"short\"/>сек<br/><button class=\"remove\">Удалить</button><button class=\"sim\">Рассчитать</button><button class=\"set\">Сохранить</button></li>");}.call(this,"data" in locals_for_with?locals_for_with.data:typeof data!=="undefined"?data:undefined));;return buf.join("");
}
