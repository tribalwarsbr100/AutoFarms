var $ = typeof unsafeWindow != 'undefined' ? unsafeWindow.$ : window.$;

$(function() { // inicia o documento jquery pronto

    //======================================================
    //CONFIGURAÇÕES (pode ser alterado pelo usuário)

    var Settings = {
        button: "b", //Botão: a | b | c
        alertSound: new Audio("http://www.mediacollege.com/downloads/sound-effects/beep/beep-04.wav")
    };
    //======================================================
    var storage = localStorage;
    var storagePrefix = "GM_";

    //funções de memória
    function storageGet(key, defaultValue) {
        var value = storage.getItem(storagePrefix + key);
        return (value === undefined || value === null) ? defaultValue : value;
        //return GM_getValue(key,defaultValue);
    }

    function storageSet(key, val) {
        storage.setItem(storagePrefix + key, val);
        //GM_setValue(key,val);
    }
    //valores padrão
    storageSet("table_order", storageGet("table_order", "distance"));
    storageSet("table_dir", storageGet("table_dir", "asc"));
    storageSet("walk_dir", storageGet("walk_dir", "n"));
    storageSet("auto_run", storageGet("auto_run", "false"));
    storageSet("village_end", storageGet("village_end", ""));
    storageSet("village_end_reached", storageGet("village_end_reached", "0"));
    storageSet("max_page", storageGet("max_page", ""));
    storageSet("no_spy_report_button", storageGet("no_spy_report_button", ""));


    //Executa, ou não Executa
    var autoRun = storageGet("auto_run") === "true";
    var autoRunUI = {};

    //lê as unidades existentes da Aldeia e retorna o resultado para Atacar no  assistende de saqueo ou no mapa
    function getUnitInfo() {
        var unitsHome = $("#units_home");
        var units = {};

        $(".unit-item", unitsHome).each(function(index, obj) {
            obj = $(obj);
            units[obj.attr("id")] = {
                count: parseInt(obj.text()),
                checked: false
            };
        });
        $("input[type=checkbox]", unitsHome).each(function(index, obj) {
            obj = $(obj);
            units[obj.attr("name")].checked = obj.prop("checked");
        });

        return units;
    }
    //as unidades são compostas por um mapa de unidade (Resultado de getUnitInfo())
    function getAvailableUnits(unitInfo) {
        var sum = 0;
        for (var unitName in unitInfo) {
            var unit = unitInfo[unitName];
            sum += unit.checked ? unit.count : 0;
        }
        return sum;
    }

    //verifica se a aldeia já está sendo atacada
    function isAttacked(row) {
        return $("td:eq(3) img", row).length == 1;
    }

    //Verifique se um botão de farm na aldeia já foi pressionado
    function canPress(row, name) {
        var button = $("a.farm_icon_" + name, row);
        return button.length == 1 && !button.hasClass("farm_icon_disabled");
    }

    //Pressione o botão na linha
    function press(row, name) {
        $("a.farm_icon_" + name, row).click();
    }
    //Escolher o número da página do AS
    function getPageNumber() {
        var res = /&Farm_page=([0-9]*)&/.exec(location.search);
        if (res == null) return 0;
        else return parseInt(res[1]);
    }
    //Define o numero maximo de pagina no AS
    function getMaxPageNumber() {
        return $("div.body table tr:last-child a").length + 1;
    }
    //mudar para o próxima pagina do AS ou, se necessário, para a próxima aldeia
    function nextPage() {
        var current = getPageNumber();
        var total = getMaxPageNumber();

        if (storageGet("max_page") != "") {
            total = Math.min(parseInt(storageGet("max_page")), total);
        }

        var nextVillage = false;
        current++;
        if (current >= total) {
            current = 0;
            nextVillage = true;
        }
        location.href = "/game.php?village=" + (nextVillage ? storageGet("walk_dir") : "") + unsafeWindow.game_data.village.id + "&order=" + storageGet("table_order") + "&dir=" + storageGet("table_dir") + "&Farm_page=" + current + "&screen=am_farm";
    }

    //mudar para a próxima aldeia
    function nextVillage() {
        location.href = "/game.php?village=" + storageGet("walk_dir") + unsafeWindow.game_data.village.id + "&order=" + storageGet("table_order") + "&dir=" + storageGet("table_dir") + "&screen=am_farm";
    }

    //retorna um número aleatório no intervalo [min, max]
    function randomInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    //verifica se a página contém proteção de bot
    function checkBotProtection() {
        return $("#bot_check").length > 0;
    }

    //mostra um script em execução no título
    function marqueeTitle(text) {
        var temp = text;
        text = "";
        for (var i = 0; i < 3; i++) {
            text += temp + " +++ ";
        }

        (function tick() {
            document.title = text;
            text = text.substr(1) + text.substr(0, 1);
            setTimeout(tick, 50);
        })();
    }

    //toca um som de advertência
    function playAlertSound() {
        Settings.alertSound.play();
    }

    function getNotification() {
        return new Notification(" ✪ AUTO FARM REVOLUTION ✪ ALERTA : Resolução de Captcha necessária", {
            body: "Proteção de bot para " + (typeof unsafeWindow != 'undefined' ? unsafeWindow.game_data.player.name : window.game_data.player.name),
            icon: "http://cdn.die-staemme.de/8.17/19124/graphic/icons/farm_assistent.png?e5a99"
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
            Notification.requestPermission(function(permission) {

                // Seja qual for o usuário que responda, nós garantimos que o Chrome armazena as informações
                if (!('permission' in Notification)) {
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
        var rows = $("div.body > table tr").slice(1, -1);
        var length = rows.length;
        var current = -1;

        // uma vez por página de farm:
        // se a última aldeia fosse a aldeia mestra
        console.log(storageGet("village_end_reached"));
        if (storageGet("village_end_reached") == "1" && unsafeWindow.game_data.village.id + "" != storageGet("village_end")) {
            console.log("stop, reason: end village reached");
            stopRun();
            return;
        }
        //se no momento o farm executa
        if (unsafeWindow.game_data.village.id + "" == storageGet("village_end")) {
            storageSet("village_end_reached", "1");
            console.log("endvillage reached");
        }

        (function tick() {
            //se não executar mais, então aborta
            if (!autoRun) {
                return;
            }

            //se não houver mais unidades, vá para a próxima aldeia
            if (getAvailableUnits(getUnitInfo()) == 0) {
                setTimeout(nextVillage, randomInterval(2000, 3000));
                return;
            }

            //quando você chegar ao final da página do farm, alterne para o próximo
            current++;
            if (current >= length) {
                setTimeout(nextPage, randomInterval(2000, 3000));
                return;
            }

            var row = rows.eq(current)

            function nothingDone() {
                $("td", row).css("background-color", "red");
                setTimeout(tick, randomInterval(5, 10));
            }

            if (!isAttacked(row)) {
                if (canPress(row, Settings.button)) {
                    press(row, Settings.button);
                    $("td", row).css("background-color", "green");
                    setTimeout(tick, randomInterval(500, 1500));
                } else if (storageGet("no_spy_report_button") !== "" && canPress(row, storageGet("no_spy_report_button"))) {
                    press(row, storageGet("no_spy_report_button"));
                    $("td", row).css("background-color", "blue");
                    setTimeout(tick, randomInterval(500, 1500));
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
        autoRunUI.start.prop("disabled", autoRun);
        autoRunUI.stop.prop("disabled", !autoRun);
    }

    function startRun() {
        autoRun = true;
        storageSet("auto_run", "true");

        updateAutoRunUI();

        startRunning();
    }

    function stopRun() {
        autoRun = false;
        storageSet("auto_run", "false");

        updateAutoRunUI();
    }
    //Fim da Execução

    function initUI() {
        var head = $("h3");
        var settingsDivVisible = false;
        var overlay = $("<div>")
            .css({
                "position": "fixed",
                "z-index": "99999",
                "top": "0",
                "left": "0",
                "right": "0",
                "bottom": "0",
                "background-color": "rgba(255,255,255,0.6)",
                "display": "none"
            })
            .appendTo($("body"));
        var settingsDiv = $("<div>")
            .css({
                "position": "fixed",
                "z-index": "100000",
                "left": "840px",
                "top": "50px",
                "width": "400px",
                "height": "200px",
                "background-color": "Green",
                "border": "2px solid orange",
                "border-radius": "5px",
                "display": "none",
                "padding": "10px"
            })
            .appendTo($("body"));

        function toggleSettingsVisibility() {
            if (settingsDivVisible) {
                overlay.hide();
                settingsDiv.hide();
            } else {
                overlay.show();
                settingsDiv.show();
            }

            settingsDivVisible = !settingsDivVisible;
        }

        var settingsTable = $("<table>").appendTo(settingsDiv);

        $("<button>").text("Salvar/Fechar").click(function() {
            toggleSettingsVisibility();
        }).appendTo(settingsDiv);

        function addRow(desc, content) {
            $("<tr>")
                .append($("<td>").append(desc))
                .append($("<td>").append(content))
                .appendTo(settingsTable);
        }

        autoRunUI.info = $("<span>").appendTo(head);

        //Botões
        autoRunUI.start = $("<button>").text("Start").click(function() {
            storageSet("village_end_reached", "0");
            startRun();
        }).appendTo(head);
        autoRunUI.stop = $("<button>").text("Stop").click(stopRun).appendTo(head);
        $("<button>").text("Config").click(function() {
            toggleSettingsVisibility();
        }).appendTo(head);

        updateAutoRunUI();

        //Seleciona
        var selectOrder = $("<select>").attr("size", "1")
            .append($("<option>").text("Data").attr("value", "date"))
            .append($("<option>").text("Distância").attr("value", "distance"))
            .change(function() {
                storageSet("table_order", $("option:selected", selectOrder).val());
                console.log(storageGet("table_order"));
            });

        var selectDir = $("<select>").attr("size", "1")
            .append($("<option>").text("Ascendente").attr("value", "n"))
            .append($("<option>").text("Descendente").attr("value", "desc"))
            .change(function() {
                storageSet("table_dir", $("option:selected", selectDir).val());
                console.log(storageGet("table_dir"));
            });

        var selectWalk = $("<select>").attr("size", "1")
            .append($("<option>").text("Avançar").attr("value", "n"))
            .append($("<option>").text("Retornar").attr("value", "p"))
            .change(function() {
                storageSet("walk_dir", $("option:selected", selectWalk).val());
                console.log(storageGet("walk_dir"));
            });

        var inputEndVillage = $("<input>")
            .attr("type", "text")
            .val(storageGet("village_end"))
            .on("input", function() {
                storageSet("village_end", inputEndVillage.val());
                console.log(storageGet("village_end"));
            });

        var buttonCurrentVillage = $("<button>")
            .text("Atual")
            .click(function() {
                inputEndVillage.val("" + unsafeWindow.game_data.village.id);
                storageSet("village_end", "" + unsafeWindow.game_data.village.id);
                console.log(storageGet("village_end"));
            });

        var inputMaxPage = $("<input>")
            .attr("type", "text")
            .val(storageGet("max_page"))
            .on("input", function() {
                storageSet("max_page", inputMaxPage.val());
                console.log(storageGet("max_page"));
            });

        var inputMaxDistance = $("<input>")
            .attr("type", "text")
            .val(storageGet("max_distance", 0))
            .on("input", function() {
                storageSet("max_distance", inputMaxDistance.val());
                console.log(storageGet("max_distance"));
            });

        var selectNoSpyReportButton = $("<select>").attr("size", "1")
            .append($("<option>").text("[nenhum]").attr("value", ""))
            .append($("<option>").text("A").attr("value", "a"))
            .append($("<option>").text("B").attr("value", "b"))
            .change(function() {
                storageSet("no_spy_report_button", $("option:selected", selectNoSpyReportButton).val());
                console.log(storageGet("no_spy_report_button"));
            });

        var select_wait_time = $("<select>").attr("size", "1")
            .change(function() {
                input_wait_time.val(storageGet("wait_time_" + $("option:selected", select_wait_time).val()));
            })
            .append($("<option>").text("Próximo Farm").attr("value", "page"))
            .append($("<option>").text("Próxima aldeia").attr("value", "village"))
            .append($("<option>").text("Próximo ataque").attr("value", "att"))
            .append($("<option>").text("Lista vazia").attr("value", "grey2"))

        var input_wait_time = $("<input>").attr("type", "text")
            .val(storageGet("wait_time_" + $("option:selected", select_wait_time).val(), 1000))
            .on("input", function() {
                storageSet("wait_time_" + $("option:selected", select_wait_time).val(), "" + $(this).val());
                console.log(storageGet("wait_time_" + $("option:selected", select_wait_time).val()) + " " + $("option:selected", select_wait_time).val());
            });
        var button_niemals_c = $("<button>")
            .attr("id", "button_niemals_c")
            .click(function() {
                if (storageGet("nospy_active") == 0) {
                    $(this).text("Ativo: no C")
                    storageSet("nospy_active", 1);
                } else {
                    $(this).text("Inativo: no C")
                    storageSet("nospy_active", 0);
                }
                console.log(storageGet("nospy_active"));
            });
        if (storageGet("nospy_active") == "1") {
            button_niemals_c.text("Ativo: no C")
        } else {
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
            .attr("title", "Se não houver relatório para uma aldeia (reconhecível em '?'), o botão selecionado é pressionado."),
            $("<span>")
            .append(selectNoSpyReportButton)
            .append(button_niemals_c)
            .attr("id", "informação_nospina")
            .css("background-color", "green"));

        $("option[value=" + storageGet("table_order") + "]", selectOrder).prop("selected", true);
        $("option[value=" + storageGet("table_dir") + "]", selectDir).prop("selected", true);
        $("option[value=" + storageGet("walk_dir") + "]", selectWalk).prop("selected", true);
        $("option[value=" + storageGet("no_spy_report_button") + "]", selectNoSpyReportButton).prop("selected", true);

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
    if (checkBotProtection()) {
        stopRun();
        marqueeTitle("Proteção_de_bot");
        playAlertSound();
        showNotification();
    }

    if (autoRun) {
        if (!$(".arrowRightGrey").length && !$(".jump_link").length) {
            startRun();
        } else {
            //Apenas comece em 30 minutos
            setTimeout(function() {
                if (autoRun) {
                    nextVillage()
                }
            }, storageGet("wait_time_grey2", 1800000));
        }

    }

});

//fim do documento jquery pronto
