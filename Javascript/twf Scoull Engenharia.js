var twf = {
    init: function() {
        twf.helper.init();
        twf.data.init();
        twf.reports.init();
        twf.attacks.init();
        twf.helper.log("Todos os sistemas estão prontos.", twf.helper.MESSAGE_SUCCES);
        $('#buttons').children().prop('disabled', false).removeClass('btn-disabled');
        if (twf.data.settings.reportFarmer) {
            twf.attacks.attackButton.prop('disabled', true).addClass('btn-disabled');
            twf.helper.log("Você habilitou o Report Farmer. Pressione o botão \"Leia relatórios\" - para continuar ou desative o Report Farmer.", twf.helper.MESSAGE_WARNING);
        }
    },
    /*
    Temos dois ataques diferentes: baseado em modelo geral e baseado em relatórios

    Para o relatório baseado, fazemos o seguinte: raspe todos os relatórios (<X horas atrás) @ init
    Para cada relatório, mantenha todas as informações em algum objeto (ordená-lo pela distância para a atual lavagem, no init, e apenas comece a atacar, se possível)
    LocalStorage armazene-os com seus coords como id: salve o seguinte: wall, resource poits, storage, oculting, lastReportAttack / ScoutTime, barb
    (De esconder e armazenar você pode calcular o máximo de coisas inesquecíveis)

    Sempre que um ataque atacar, atualizamos as mensagens e carregamos a próxima.
    Se não houver escoteiros disponíveis para o ataque, assumimos 0 res esquerda (talvez altere isso para algum heurístico (por exemplo) esperado gs - haul?)

    (talvez acompanhe quais aldeias já estamos atacando, pois quando usamos várias fazendas ou quando reorganizamos suas coisas com base em
    alguma heurística)
    Em seguida, ordenamos as aldeias em termos de eficiência, levando em consideração a função prevista (atual, minas, armazenamento, timeSinceScout, tempo de viagem)
    e eficiência de tempo (por exemplo, res / hour)
    nós descontamos com o passar do tempo desde o escuteiro, então desperdiçamos pequenas tropas por lançamentos sem sucesso. Nós também enviamos uma quantidade mínima de luzes, com base na parede
    Isso também deve ser levado em conta, porque desperdiçar muitas luzes na pequena fazenda, mas a parede alta é uma merda



    reports: {
        "123|654": {
            buildings: {
                wall: 0,
                iron: 5,
                clay: 5,
                wood: 5,
                warehouse: 10,
                hiding: 3,
            },
            isBarb: true,
            lastAttack: Date(xx),
            lastScout: Date(xx),
            lostTroops: true,
            currentlyUnderAttack: false (//update in attack module, then set false when receiving report),
            resLeft: 0
        }
    }
    functions

    loadOldReportData()
    readReport()
    saveReport()
    expectedRes(resLastReport, MineLevels, StorageLevel, HidingLevel, timeSinceLastReport, travelTime/coords)
    calcDistance()
    orderVillages(someHeuristic, where currentlyUnderAttack discounts very hard e.g. /1000)
    onFrameLoaded();
    getReportsOnPage();

    */

    // só começamos a leitura automática desde o momento em que o startattack é executado
    // se não analisamos os relatórios de antemão, com o erro e pedimos análises
    reports: {
        firstRunFinished: false,
        currentlyReading: false,// flag para verificar se está lendo agora.
        allowAutomaticReading: false,
        reportFrame: null, // contém o quadro
        lastRun: null, // hora de início da corrida anterior
        thisRun: null,// hora de início da corrida atual
        currentPage: 1, // página atual do reportList (1-indexed)
        data: {},
        reportsToRead: [],
        init: function() {
            $("#start_reports").click(twf.reports.startReading);
            $("#stop_reports").click(twf.reports.stopReading);
            console.log(this.lastRun);

            twf.reports.loadOldReportData();

            twf.reports.reportParserUrl = "/game.php?village=" + game_data.village.id + "&screen=report&mode=attack&group_id=-1&view=";
            twf.reports.reportListUrl = "/game.php?village=" + game_data.village.id + "&screen=report&mode=attack&group_id=-1&from=";

            twf.reports.reportFrame = twf.helper.createHiddenFrame(twf.reports.reportListUrl + "0", twf.reports.onFrameLoaded, "report_parser_hidden_frame");

            this.lastRun = new Date(twf.data.loadWorldLevel('reports_lastRun'));
            twf.helper.log("Informe o módulo do Farm pronto.", twf.helper.MESSAGE_SUCCES);
        },
        startReading: function() {
            // não faça nada se estamos ocupados
            if (twf.reports.currentlyReading) {
                twf.helper.log("Já está lendo. Não começando de novo.", twf.helper.MESSAGE_WARNING);
                return;
            }
            // esta é uma substituição manual, então remova o temporizador
            if (twf.data.timers.reportPollTimer) {
                clearTimeout(twf.data.timers.reportPollTimer);
                twf.data.timers.reportPollTimer = null;
                console.debug("Removido reportPollTimer desde o inícioReading");
            }

            // handle buttons
            $("#start_reports").hide();
            $("#stop_reports").show();

            // reset vars
            twf.reports.currentlyReading = true;
            twf.reports.currentPage = 1;
            twf.reportsToRead = [];

            twf.reports.thisRun = twf.helper.getServerTime(twf.reports.reportFrame);

            // recarregue a página de modo que ligue o fogo
            twf.helper.spinner.show();
            twf.reports.reportFrame.attr('src', twf.reports.reportListUrl + "0");
        },
        stopReading: function() {
            // lidar com botões
            $("#start_reports").show();
            $("#stop_reports").hide();

            // desligue a leitura atual
            twf.reports.currentlyReading = false;

            // verifique se devemos habilitar os ataques
            if (twf.reports.firstRunFinished) {
                twf.attacks.attackButton.removeClass("btn-disabled").prop("disabled", false);
            }

            // atualize lastRun e guarde-o se terminarmos a execução
            if (twf.reports.thisRun && twf.reports.firstRunFinished) {
                twf.reports.lastRun = twf.reports.thisRun;
                twf.data.storeWorldLevel('reports_lastRun', twf.reports.lastRun);
            }

            twf.reports.updateReportStats(); // configure-o para "Concluído."
        },
        onFrameLoaded: function() {
            try {
                twf.helper.spinner.fadeOut();
                twf.helper.checkBotProtection();
                twf.reports.updateReportStats(false, false);

                if (twf.reports.currentlyReading) {
                    if (twf.reports.reportFrame[0].contentWindow.location.search.indexOf('view') == -1) {
                        // estamos na lista
                        let maxPage = twf.reports.getMaxPage();
                        if (twf.reports.currentPage <= maxPage) {
                            // páginas restantes, atualizar estatísticas e interpretar
                            twf.reports.updateReportStats(true, maxPage);
                            twf.reports.handleList();
                        } else if (twf.reports.reportsToRead.length > 0) {
                            // Estamos na última página e temos relatórios para ler!
                            twf.helper.spinner.show();
                            twf.helper.log("Relatórios legíveis de carregamento concluído...", twf.helper.MESSAGE_SUCCES);
                            console.debug("Última página da lista de relatórios -> indo para ver um relatório!");
                            twf.reports.reportFrame.attr('src', twf.reports.reportParserUrl + twf.reports.reportsToRead.shift());
                        } else {
                            // última página e nenhum relatório encontrado! (também pode não haver nenhum relatório)
                            twf.helper.log("Nenhum relatório útil encontrado. Suspeito...", twf.helper.MESSAGE_WARNING);
                            twf.reports.firstRunFinished = true;
                            twf.reports.stopReading();
                        }

                    } else {
                        // estamos em um relatório
                        twf.reports.handleReport();
                    }
                }
            } catch (error) {
                twf.helper.stopEverything();
                console.error(error);
                alert("BOT PROTECTION? " + error);
            }

        },
        parseAndStore: function() {
            // TODO CHECK SE ESTÁ EM ARMAZENAMENTO
            let coords = twf.reports.reportFrame.contents().find('span.quickedit-label').text().trim().match(/\d{1,3}\|\d{1,3}/g);
            coords = coords[coords.length - 1];

            // Tempo de chegada

            let arrival = twf.reports.reportFrame.contents().find('.small.grey').parent().text().trim().split(" ");
            arrival[0] = arrival[0].split(".").reverse().join("-"); //corrige a data
            arrival[1] = arrival[1].replace(/:([^:]*)$/, "." + '$1'); //corrige o tempo (substitua o último: com .)
            arrival = new Date("20" + arrival[0] + "T" + arrival[1] + "Z"); // define a data

            if (twf.reports.data[coords] && twf.reports.data[coords].scoutBuilding && arrival <= twf.reports.data[coords].scoutBuilding) {
                // Se já examinamos os edifícios aqui e esse relatório é mais antigo do que os nossos relatórios de construção mais recentes
                // não temos nada para ganhar com isso, para que possamos ignorá-lo
                console.debug("Ignorar" + coords + " porque temos dados de construção mais frescos. Atual:" + arrival.toUTCString() + ", em db:" + twf.reports.data[coords].scoutBuilding.toUTCString());
                return;
            }

            // sorte

            let luck = parseFloat(twf.reports.reportFrame.contents().find('.nobg b').text().trim().replace("%", ""));

            // enviar de
            let sentFromId = parseInt(twf.reports.reportFrame.contents().find('[data-id].village_anchor').eq(0).attr('data-id'));
            let sentFromCoords = twf.reports.reportFrame.contents().find('[data-id].village_anchor').eq(0).text().trim().match(/\d{1,3}\|\d{1,3}/g);
            sentFromCoords = sentFromCoords[sentFromCoords.length - 1];

            // unidades enviadas e perdidas
            let unitsSent = {};
            let unitsDied = {};
            for (let i in twf.data.unitTypes) { // eu sou uma string, wtf
                unitsSent[twf.data.unitTypes[i]] = parseInt(twf.reports.reportFrame.contents().find('#attack_info_att_units .unit-item').eq(i).text().trim());
                unitsDied[twf.data.unitTypes[i]] = parseInt(twf.reports.reportFrame.contents().find('#attack_info_att_units .unit-item').eq(twf.data.unitTypes.length + parseInt(i)).text().trim());
            }

            // é jogador
            let isPlayer = twf.reports.reportFrame.contents().find('#attack_info_def th').eq(1).text().trim() != "---";

            let enemyHome = null;
            let enemyDied = null;

            // se pelo menos na tropa sobreviveram, temos dados sobre suas tropas
            for (let i in unitsSent) {
                if (unitsSent[i] != unitsDied[i]) {
                    // temos pelo menos uma tropa sobrevivente
                    // instancia objects
                    enemyHome = {};
                    enemyDied = {};

                    // analisa suas unidades
                    // isso ignora a milícia
                    for (let i in twf.data.unitTypes) { // eu sou uma string, wtf
                        enemyHome[twf.data.unitTypes[i]] = parseInt(twf.reports.reportFrame.contents().find('#attack_info_def_units .unit-item').eq(i).text().trim());
                        // note o comprimento + 1 (porque ignoramos a multidão)
                        enemyDied[twf.data.unitTypes[i]] = parseInt(twf.reports.reportFrame.contents().find('#attack_info_def_units .unit-item').eq(twf.data.unitTypes.length + 1 + parseInt(i)).text().trim());
                    }
                    break;
                }
            }

            // resultados

            let resTaken = twf.reports.reportFrame.contents().find('#attack_results tr td').eq(1).text().trim().split("/");
            let maxResTaken = parseInt(resTaken[1]);
            resTaken = parseInt(resTaken[0]);
            // acompanhe o nível que exploramos
            let scoutLevel = 0;
            // res left (if no data == null)
            let resLeft = null;
            // edifícios scouted (no data -> null)
            let buildingData = null;
            // tropas fora da aldeia
            let enemyAway = null;
            // informação do spy
            if (twf.reports.reportFrame.contents().find("#attack_spy_resources").length > 0) {
                // nós exploramos recursos
                scoutLevel = 1;
                let resArray = twf.reports.reportFrame.contents().find('#attack_spy_resources .nowrap').text().trim().split(" ");
                for (let i in resArray) {
                    let p = parseInt(resArray[i]);
                    if (!isNaN(p)) {
                        resLeft += p;
                    }
                }
            } else if (resTaken < maxResTaken) {
                // se não tivéssemos transporte completo, podemos assumir que não resta mais restos
                resLeft = 0;
            } else {
                // se tivéssemos um curso completo, não temos informações, então, signifique com -1
                resLeft = -1;
            }
            if (twf.reports.reportFrame.contents().find('#attack_spy_building_data').length > 0) {
                // nós exploramos edifícios
                scoutLevel = 2;
                // Init BuildingData
                buildingData = {};
                // analise-os para mostrar
                let parsedData = JSON.parse(twf.reports.reportFrame.contents().find('#attack_spy_building_data').val());
                // analise-os em uma nova matriz
                for (let i in parsedData) {
                    // para todos os dados que temos, guarde-os em buildingdata como edifício: nível
                    buildingData[parsedData[i].id] = parseInt(parsedData[i].level);
                }
                // então corre sobre todos os edifícios e ajuste-os para 0 se eles ainda não existem
                for (let i in twf.data.buildingTypes) {
                    if (buildingData[twf.data.buildingTypes[i]] == undefined) {
                        buildingData[twf.data.buildingTypes[i]] = 0;
                    }
                }
            }
            if (twf.reports.reportFrame.contents().find('#attack_spy_away').length > 0) {
                // temos dados sobre tropas fora
                scoutLevel = 3;
                // Init inimigo
                enemyAway = {};
                for (let i in twf.data.unitTypes) {// eu sou uma string, wtf
                    enemyAway[twf.data.unitTypes[i]] = parseInt(twf.reports.reportFrame.contents().find('#attack_spy_away .unit-item').eq(i).text().trim());
                }
            }
            // interpretamos tudo o que existe,
            // agora armazene-o

            // primeiro recupere o relatório antigo (para substituí-lo)
            let report = {};
            if (twf.reports.data[coords]) {
                report = twf.reports.data[coords];
            }
            report['lastAttack'] = arrival;
            report['luck'] = luck;
            report['sentFromId'] = sentFromId;
            report['sentFromCoords'] = sentFromCoords;
            report['isPlayer'] = isPlayer;
            report['unitsSent'] = unitsSent;
            report['unitsDied'] = unitsDied;
            if (enemyHome) {
                report['enemyHome'] = enemyHome;
                report['enemyDied'] = enemyDied;
            }
            // não economize resTaken e maxResTaken porque podemos inferir tudo o que precisamos saber de resLeft
            // relatório ['resTaken'] = resTaken;
            // relatório ['maxResTaken'] = maxResTaken;
            report['resLeft'] = resLeft; //-1 não significa dados
            if (buildingData) {
                report['buildingData'] = buildingData;
            }
            if (enemyAway) {
                report['enemyAway'] = enemyAway;
            }

            // armazenar quando o último batedor foi
            if (scoutLevel) {
                if (scoutLevel >= 1) {
                    report['scoutRes'] = arrival;
                }
                if (scoutLevel >= 2) {
                    report['scoutBuilding'] = arrival;
                }
                if (scoutLevel >= 3) {
                    report['scoutAway'] = arrival;
                }
            }

            // armazenar no objeto de dados
            twf.reports.data[coords] = report;

            // store in localstorage
            twf.data.storeWorldLevel('reports', twf.reports.data);
            console.debug(report);

            // done
        },
        handleReport: function() {
            twf.helper.spinner.fadeOut();

            if (twf.reports.reportsToRead.length > 0) {
                twf.reports.parseAndStore();
                twf.helper.spinner.show();
                twf.reports.reportFrame.attr('src', twf.reports.reportParserUrl + twf.reports.reportsToRead.shift());
            } else {
                twf.helper.log("Feito relatórios de leitura!", twf.helper.MESSAGE_SUCCES);
                twf.reports.firstRunFinished = true;
                twf.reports.stopReading()
            }

        },
        getMaxPage: function() {
            let t = twf.reports.reportFrame.contents().find('.paged-nav-item:last');
            if (t) {
                // found atleast one page
                t = t.text().trim(); //yields "[xx]"
                t = parseInt(t.substring(1, t.length - 1));
            } else {
                // no extra pages found
                t = 1;
            }
            return t;
        },
        // primeiro argumento -> verdadeiro se ainda estiver na lista, o maxPage é a página máxima
        updateReportStats: function(pages, maxPage) {
            if (!twf.reports.currentlyReading && twf.reports.firstRunFinished) {
                //não lendo e terminou
                $("#reports_left").html("<b>Feito!</b>");
            } else if (!twf.reports.currentlyReading) {
                $("#reports_left").text("Waiting...");
            } else if (pages) {
                // carregando relatórios
                $("#reports_left").text("page " + twf.reports.currentPage + "/" + maxPage);
            } else {
                // lendo relatórios
                $("#reports_left").text(twf.reports.reportsToRead.length + " reports left");
            }
        },
        handleList: function() {
            let finished = false;
            twf.reports.reportFrame.contents().find('#report_list tr td:nth-of-type(3)').each(function(i, e) {
                // recuperar alguma informação
                let coords = $(e).siblings().find('.quickedit-label').text().match(/\d{1,3}\|\d{1,3}/g);
                coords = coords[coords.length - 1];

                let id = $(e).siblings().find("[data-id]").attr('data-id');

                let receivedAt = twf.reports.getReportTimeInList($(e).text());
                let now = twf.helper.getServerTime(twf.reports.reportFrame);
                // agora> recebido, porque o recebimento foi reduzido a minutos completos (e.g. 18:26:12.123 -> 18:26)

                // Lemos um relatório se tiver menos de 24 horas E não temos um escoteiro mais recente
                // porque se tivermos um scout mais recente não há nada a saber
                // no entanto, se tivermos um ataque mais recente, mas não scout, ainda podemos receber informações de construção
                if (now - receivedAt >= 1000 * 60 * 60 * twf.data.settings.reportMaxReadAge) {
                    // mais de 24 -> podemos parar imediatamente
                    console.debug("Ignorar " + coords + " recebido em " + receivedAt.toUTCString() + " Porque > " + twf.data.settings.reportMaxReadAge + " hours.");
                    finished = true;
                    return false; //break out of each-loop
                } else if (twf.reports.lastRun && twf.reports.lastRun - receivedAt >= 1000 * 60) {
                    // the report was already caught in the last run
                    console.debug("ignorar " + coords + " recebido em " + receivedAt.toUTCString() + " porque a capturamos pela última vez. (Início da última execução:" + twf.reports.lastRun.toUTCString() + ")");
                    finished = true;
                    return false;
                } else if (twf.reports.data[coords] && twf.reports.data[coords].scoutBuilding && receivedAt /*+ 60 * 1000*/ <= twf.reports.data[coords].scoutBuilding) {
                    // do jeito que é agora: ignoramos se dois ataques chegaram no mesmo minuto, o que nunca deve acontecer.
                    // o caminho abaixo adiciona muitos relatórios que são inúteis

                    // o relatório foi recebido em algum lugar no minuto em que o relatório de escuta anterior foi recebido
                    // tornamos um minuto mais fresco, porque o recebimento é arredondado para os minutos completos, enquanto o outro é exato
                    // não que isso importe tanto
                    console.debug("ignorar " + coords + " recebido em  " + receivedAt.toUTCString() + " O último explorador de construção é mais recente (" + twf.reports.data[coords].scoutBuilding.toUTCString() + ")");
                } else {
                    console.debug("Última_corrida: " + (twf.reports.lastRun ? twf.reports.lastRun.toUTCString() : "--nenhuma corrida--") + ". Recebido: " + receivedAt.toUTCString());
                    //console.debug("twf.reports.lastRun ("+ twf.reports.lastRun +") && twf.reports.lastRun> = receivedAt + 1000 * 5 == "+ (twf.reports.lastRun> = receivedAt + 1000 * 5) + "(receivedAt + 1000 * 5:" + (receivedAt.getTime () + 1000 * 5));
                    //console.debug("Adding "+ coords +" recebido em "+ receivedAt.toUTCString () +". Diferença de tempo (h): "+ ((now-receivedAt) / 1000/60/60));
                    // temos um relatório válido, então adicione-o
                    twf.reports.reportsToRead.push(id);
                }

            });
            // adicionamos todos os relatórios e talvez tenhamos terminado porque não restavam relatórios recentes
            // se acabamos, começamos a interpretá-los
            if (finished) {
                twf.helper.spinner.show();
                twf.helper.log("Relatórios legíveis de carregamento concluído...", twf.helper.MESSAGE_SUCCES);
                twf.reports.reportFrame.attr('src', twf.reports.reportParserUrl + twf.reports.reportsToRead.shift());
            } else { // Relatórios legíveis de carregamento concluído
                twf.helper.spinner.show();
                twf.reports.currentPage = twf.reports.currentPage + 1;
                console.debug("Passando para a próxima página: " + twf.reports.currentPage);
                twf.reports.reportFrame.attr('src', twf.reports.reportListUrl + (twf.reports.currentPage - 1) * 12); //12 relatórios por página 1-indexed
            }
        },
        getReportTimeInList(text) {
            let dateTime = text.split(" ");
            let dateString = "20" + dateTime[0].split(".").reverse().join("-"); //Deve render algo como 2018-05-06
            return new Date(dateString + "T" + dateTime[1] + "Z");
        },
        loadOldReportData: function() {
            let tempReports = twf.data.loadWorldLevel('reports');
            if (tempReports) {
                // analisar datas como objects
                for (let i in tempReports) {
                    if (tempReports[i].scoutRes) {
                        tempReports[i].scoutRes = new Date(tempReports[i].scoutRes);
                    }
                    if (tempReports[i].scoutBuilding) {
                        tempReports[i].scoutBuilding = new Date(tempReports[i].scoutBuilding);
                    }
                    if (tempReports[i].scoutAway) {
                        tempReports[i].scoutAway = new Date(tempReports[i].scoutAway);
                    }
                    if (tempReports[i].lastAttack) {
                        tempReports[i].lastAttack = new Date(tempReports[i].lastAttack);
                    }

                }
                twf.helper.log("Relatórios carregados com sucesso.", twf.helper.MESSAGE_SUCCES);
                twf.reports.data = tempReports;
            } else {
                twf.helper.log("Falha ao carregar relatórios. Talvez ainda não?", twf.helper.MESSAGE_WARNING);
            }
        },
        // assumeRes = valor de res esperamos que haja. Isso sobrescreve o que está no relatório
         // assumeBuildings = nível de armazenamento, esconderijo, madeira, argila e ferro que esperamos. Isso substitui o relatório se ele existir
         // se você não quiser assumir nada, verifique se está no relatório e passa falso (NÃO falso-y, falso real)
        expectedRes: function(coords, unit, serverTime, assumeRes, assumeBuildings) {
            let lastReport = twf.reports.data[coords];

            let distance = twf.helper.getDistance(game_data.village.coord, coords);
            let travelTimeInHours = twf.helper.getTravelTimeInMinutes(distance, unit) / 60;
            let timePassedInHours = (serverTime.getTime() - lastReport.lastAttack.getTime()) / (1000 * 60 * 60);

           //console.debug(coords + ". Distância:" + distância + ". Tempo de viagem:" + travelTimeInHours + ". Tempo desde ataque:" + timePassedInHours ");
            let maxStorage = null;
            let maxHide = null
            let resOver = null;
            let resPerHour = null;

            if (assumeBuildings !== false) {
                console.debug("Assumindo edifícios!");
                maxStorage = twf.helper.getMaxStorage(assumeBuildings.storage);
                maxHide = twf.helper.getMaxHiding(assumeBuildings.hide);
                resPerHour = twf.helper.getResPerHour(assumeBuildings.wood) + twf.helper.getResPerHour(assumeBuildings.clay) + twf.helper.getResPerHour(assumeBuildings.iron);
            } else {
                maxStorage = twf.helper.getMaxStorage(lastReport.buildingData.storage);
                maxHide = twf.helper.getMaxHiding(lastReport.buildingData.hide);
                resPerHour = twf.helper.getResPerHour(lastReport.buildingData.wood) + twf.helper.getResPerHour(lastReport.buildingData.clay) + twf.helper.getResPerHour(lastReport.buildingData.iron);
            }

            //console.debug("maxStorage: " + maxStorage + ". maxHide: " + maxHide + ". resPerHour: " + resPerHour);
            if (assumeRes !== false) {
                console.debug("Supondo que  res left")
                resOver = assumeRes;
            } else {
                resOver = lastReport.resLeft;
            }


            let maxLoot = maxStorage - maxHide;
            let tempRes = Math.min(resOver + (timePassedInHours + travelTimeInHours) * resPerHour, twf.data.settings.reportMaxUseAge * resPerHour);

            let expectedRes = Math.min(maxLoot, tempRes)

            //console.debug("Expected res for " + coords + "@" + unit + ": " + expectedRes);

            if (twf.data.settings.discountTime && twf.data.settings.discountFactor != 1) {
                expectedRes = expectedRes / (Math.pow(twf.data.settings.discountFactor, timePassedInHours + travelTimeInHours));
            }

            //console.debug("Expected discounted res for " + coords + "@" + unit + ": " + expectedRes);

            return expectedRes;

        },
        lostAllTroops: function(coords) {
            // note that spies do not die (usually)
            // if they have not died, we have all information
            // if they have, we know to send just one
            if (twf.reports.data[coords]) {
                for (let troop in twf.reports.data[coords].unitsSent) {
                    if (twf.reports.data[coords].unitsSent[troop] != twf.reports.data[coords].unitsDied[troop]) {
                        return false;
                    }
                }
                return true;
            } else {
                return null;
            }
        }
    },
    data: {
        settings: {
            minPollAttack: 0,
            minPollReport: 0,
            //minPoll: 300, // minimum polling time -> prevent detecetion
            //temp
            reportMaxUseAge: 6,
            reportMaxReadAge: 1,
            // end of temp
            resetToFirst: true,
            waitForTroops: true,
            attackPlayers: false,
            pollLate: true,
            pollLateSeconds: 60,
            autoStop: true,
            autoStopMinutes: 120,
            autoStopTimer: 0,
            discountTime: false,
            discountFactor: 1.07, //per hour
            reportFarmer: false
        },
        timers: {
            autoStopTimer: null,
            attackPollTimer: null,
            reportPollTimer: null,
        },
        worldSettings: {
            speed: 1,
            unitSpeed: 1,
            knight: true,
            archer: true,
        },
        travelTime: {
            spear: 18,
            sword: 22,
            axe: 18,
            archer: 18,
            spy: 9,
            light: 10,
            marcher: 10,
            heavy: 11,
            ram: 30,
            catapult: 30,
            snob: 35,
            knight: 10
        },
        carryCapacity: {
            spear: 25,
            sword: 15,
            axe: 10,
            archer: 10,
            spy: 0,
            light: 80,
            marcher: 50,
            heavy: 50,
            ram: 0,
            catapult: 0,
            snob: 0,
            knight: 100
        },
        unitTypes: ["spear", "sword", "axe", "archer", "spy", "light", "marcher", "heavy", "ram", "catapult", "snob", "knight", ],
        buildingTypes: ["main", "hide", "market", "storage", "stable", "smith", "barracks", "place", "wall", "iron", "clay", "wood", "farm", "church", "watchtower", "statue", "garage", "snob"],
        minLightPerWall: [1, 4, 32, 87, 170, 281],
        init: function() {
            this.getAndSaveWorldSettings();
            this.loadSettings();

            if (this.settings.autoStop) {
                twf.data.timers.autoStopTimer = window.setTimeout(twf.attacks.stopAttack, twf.data.settings.autoStopMinutes * 60 * 1000);
                twf.helper.log("Autostop comprometido. Parando em " + twf.data.settings.autoStopMinutes + " minutos!", twf.helper.MESSAGE_DEFAULT);
            }

            if (!this.settings.reportFarmer) {
                $('td.reports_left').hide();
            }

            twf.helper.log("Módulo de dados pronto.", twf.helper.MESSAGE_SUCCES);
        },
        saveSettings: function() {
            //também valida
            twf.data.settings.resetToFirst = $('#reset_to_first').is(':verificado');
            twf.data.settings.waitForTroops = $('#wait_for_troops').is(':verificado');
            twf.data.settings.attackPlayers = $('#attack_players').is(':verificado');
            twf.data.settings.autoStop = $('#autostop').is(':verificado');
            twf.data.settings.pollLate = $('#poll_late').is(':verificado');
            twf.data.settings.discountTime = $('#discount_time').is(':verificado');
            twf.data.settings.reportFarmer = $('#report_farmer').is(':verificado');


            //values (take first number as value)
            twf.data.settings.autoStopMinutes = parseInt($('#autostop_minutes').val().match(/\d+/)[0]);
            twf.data.settings.pollLateSeconds = parseInt($('#poll_late_seconds').val().match(/\d+/)[0]);
            twf.data.settings.discountFactor = parseFloat($('#discount_factor').val().match(/^[12](\.\d{1,2})*/)[0]); // matches 1, 1.1,1.2, etc
            twf.data.settings.reportMaxReadAge = parseInt($('#report_max_read_age').val().match(/\d+/)[0]);
            twf.data.settings.reportMaxUseAge = parseInt($('#report_max_use_age').val().match(/\d+/)[0]);

            // TEMP -> TODO ADD TO CONFIG
            twf.data.settings.minPollAttack = twf.data.settings.minPollAttack;
            twf.data.settings.minPollReport = twf.data.settings.minPollReport;
            // END TEMP

            twf.data.storeGlobal('settings', twf.data.settings);
            twf.helper.log("Configurações salvas!", twf.helper.MESSAGE_SUCCES);

            // rerun autoStop
            if (twf.data.settings.autoStop) {
                window.clearTimeout(twf.data.timers.autoStopTimer);
                twf.data.timers.autoStopTimer = window.setTimeout(twf.attacks.stopAttack, twf.data.settings.autoStopMinutes * 60 * 1000);
                twf.helper.log("Autostop comprometido. Parando em " + twf.data.settings.autoStopMinutes + " minutos!", twf.helper.MESSAGE_DEFAULT);
            }

            // show reports progress
            if (twf.data.settings.reportFarmer) {
                twf.reports.loadOldReportData();
                $('td.reports_left').show();
                if (twf.reports.firstRunFinished) {
                    twf.attacks.attackButton.removeClass('btn-disabled').prop('disabled', false);
                } else {
                    twf.attacks.attackButton.addClass('btn-disabled').prop('disabled', true);
                    twf.helper.log("Você habilitou o Report Farmer. Pressione o botão \"Ler relatórios\" - para continuar ou desative o Report Farmer. ", twf.helper.MESSAGE_WARNING);
                }
            } else {
                twf.attacks.attackButton.removeClass('btn-disabled').prop('disabled', false);
                $('td.reports_left').hide();
            }


            $('#settings_popup').hide();
        },
        loadSettings: function() {
            let tempSettings = twf.data.loadGlobal('settings');
            // only load if global settings are saved
            if (tempSettings) {
                twf.data.settings = tempSettings;
                twf.helper.log("Configurações de bot obtidas com sucesso.", twf.helper.MESSAGE_SUCCES);
            } else {
                twf.helper.log("Falha ao recuperar as configurações do bot. Usando padrões.", twf.helper.MESSAGE_ERROR);
            }

        },
        getAndSaveWorldSettings: function() {
            let tempWorldSettings = this.loadWorldLevel("worldSettings");
            if (!tempWorldSettings) {
                let configUrl = '/interface.php?func=get_config';
                //no world settings -> load and save them
                $.ajax({
                    url: configUrl,
                }).fail(function() {
                    twf.helper.log("Falha ao recuperar configurações mundiais! Usando padrões.", twf.helper.MESSAGE_ERROR);
                }).done(function(result) {
                    twf.data.worldSettings.speed = parseFloat($(result).find('speed').text());
                    twf.data.worldSettings.unitSpeed = parseFloat($(result).find('unit_speed').text());
                    twf.data.worldSettings.archer = $(result).find('archer').text() ? true : false;
                    twf.data.worldSettings.knight = $(result).find('knight').text() ? true : false;
                    twf.data.storeWorldLevel("worldSettings", twf.data.worldSettings);
                    twf.helper.log("Configurações do mundo obtidas com sucesso remotamente.", twf.helper.MESSAGE_SUCCES);
                })
            } else {
                twf.helper.log("Configurações mundiais bem sucedidas.", twf.helper.MESSAGE_SUCCES);
                twf.data.worldSettings = tempWorldSettings;
            }

        },
        // store and load localstorage data at various levels
        storeTownLevel: function(key, value) {
            localStorage.setItem("twf_" + game_data.world + "_" + game_data.village.id + "_" + key, JSON.stringify(value));
        },
        loadTownLevel: function(key) {
            return JSON.parse(localStorage.getItem("twf_" + game_data.world + "_" + game_data.village.id + "_" + key));
        },
        storeWorldLevel: function(key, value) {
            localStorage.setItem("twf_" + game_data.world + "_" + key, JSON.stringify(value));
        },
        loadWorldLevel: function(key) {
            return JSON.parse(localStorage.getItem("twf_" + game_data.world + "_" + key));
        },
        storeGlobal: function(key, value) {
            localStorage.setItem("twf_" + key, JSON.stringify(value));
        },
        loadGlobal: function(key) {
            return JSON.parse(localStorage.getItem("twf_" + key));
        }
    },
    attacks: {
        attacking: false,
        continueAttack: true,
        attackTemplates: {},
        currentAttackTemplateTimestamp: null,
        unitsPerAttack: {},
        villageString: "",
        villageArray: [],
        currentVillage: null,
        hiddenFrame: null, //todo init
        hiddenFrameUrl: null,
        init: function() {
            this.hiddenFrameUrl = '/game.php?village=' + game_data.village.id + '&screen=place';
            this.hiddenFrame = twf.helper.createHiddenFrame(this.hiddenFrameUrl, this.onFrameLoaded, "attack_hidden_frame");

            this.attackButton = $('#attackButton').click(this.attack); // this one is disabled in general init if reportFarmer is true
            this.sAttackButton = $('#sAttackButton').click(this.stopAttack).hide();
            this.rAttackButton = $('#resetAttack').click(this.resetAttack);
            this.cAttackButton = $('#cAttackButton').click(function() {
                twf.helper.showAttackTemplate();
            });

            this.loadAttackTemplates();
            this.loadAttack();

            twf.helper.log("Módulo de ataque pronto.", twf.helper.MESSAGE_SUCCES);
        },
        reportSendUnits: function(coords) {
            console.debug("Relatório de relatórioSendUnits for " + coords);
            console.debug("Actual coords: " + twf.attacks.villageArray[twf.attacks.attackTemplates[twf.attacks.currentAttackTemplateTimestamp].position]);
            let frame = twf.attacks.hiddenFrame;
            // reportfarming
            let serverTime = twf.helper.getServerTime(frame);

            // we have data and it isn't too old
            // console.log("servertime:" + serverTime.toUTCString() + " --- lastAttack: " + twf.reports.data[coords].lastAttack.toUTCString() );
            // rewrite this because it prevents using available wall levels
            // basically only check use this for expectedResources. We can fake it by setting that value to the exact amount that we to farm (e.g. maxUnits = minUnits)
            if (twf.reports.data[coords]) {
                if (twf.reports.lostAllTroops(coords)) {
                    //todo handle this
                    // e.g. some algorithm to guess the wall level?
                }
                // we have report
                let slowestUnit = null;
                // find slowest unit
                for (let unit in twf.attacks.unitsPerAttack) {
                    if (twf.attacks.unitsPerAttack[unit] > 0 && (twf.data.travelTime[unit] > twf.data.travelTime[slowestUnit] || slowestUnit == null)) {
                        slowestUnit = unit;
                    }
                }

                let expectedRes = null;
                let minLight = null;
                if (twf.reports.data[coords].scoutBuilding) {
                    expectedRes = twf.reports.expectedRes(coords, slowestUnit, serverTime, false, false);
                    minLight = twf.data.minLightPerWall[twf.reports.data[coords].buildingData.wall];

                } else if (twf.reports.data[coords].resLeft != -1) {
                    // we have resources scouted
                    // just a guess
                    let buildings = {
                        wall: 1,
                        storage: 3,
                        hide: 3,
                        iron: 3,
                        clay: 3,
                        wood: 3
                    }
                    // if we assumed level 1 or 0 and we lost all troops, our guess was incorrect (or it was spiked or something)
                    // so adjust the wall level
                    if (twf.reports.lostAllTroops(coords)) {
                        buildings.wall = buildings.wall + 1;
                    }
                    expectedRes = twf.reports.expectedRes(coords, slowestUnit, serverTime, false, buildings);
                    minLight = twf.data.minLightPerWall[buildings.wall];
                } else if (twf.reports.data[coords].resLeft == -1) {
                    // we had a full haul
                    let buildings = {
                        wall: 1,
                        storage: 3,
                        hide: 3,
                        iron: 3,
                        clay: 3,
                        wood: 3
                    }
                    // if we assumed level 1 or 0 and we lost all troops, our guess was incorrect (or it was spiked or something)
                    if (twf.reports.lostAllTroops(coords)) {
                        buildings.wall = buildings.wall + 1;
                    }
                    let assumedRes = 50;
                    expectedRes = twf.reports.expectedRes(coords, slowestUnit, serverTime, assumedRes, buildings);
                    minLight = twf.data.minLightPerWall[buildings.wall];
                }
                // if we cannot base expected res on how long ago the attack was sent (because it is longer than x ago)
                // just set expectesRes = 0, so we send the standard amount but based on the wall as well
                // we do not have to do this for wall, since that is already used if it is available and otherwise it's assumed
                if (serverTime - twf.reports.data[coords].lastAttack > 1000 * 60 * 60 * twf.data.settings.reportMaxUseAge) {
                    expectedRes = 0;
                    console.debug("Relatorio mais antigo do que " + twf.data.settings.reportMaxUseAge + "h, então esperado = 0.");
                }
                for (let unitType in twf.attacks.unitsPerAttack) {
                    if (twf.attacks.continueAttack) {
                        // skip if not in list to send
                        if (twf.attacks.unitsPerAttack[unitType] == 0) {
                            continue;
                        }
                        let unitsLeft = frame.contents().find('#units_entry_all_' + unitType).html();
                        unitsLeft = parseInt(unitsLeft.substring(1, unitsLeft.length - 1));

                        let fullHaulUnits = Math.ceil(expectedRes / twf.data.carryCapacity[unitType]);
                        //console.debug("Expected: " + expectedRes + ". Carry (" + unitType + "): " + twf.data.carryCapacity[unitType] + ". fullHaul: " + fullHaulUnits);
                        let minUnits = twf.attacks.unitsPerAttack[unitType];

                        if (unitType == "light") {
                            // if light, adjust for wall
                            minUnits = Math.max(minUnits, minLight);
                        }
                        if (unitType == "spy") {
                            // if spy, just send the minimum (i.e. overwrite whatever we calculated)
                            fullHaulUnits = twf.attacks.unitsPerAttack[unitType];
                        }


                        // dont waste an extra attack on an attack
                        if (minUnits > fullHaulUnits + 5 && minUnits > 10) {
                            twf.helper.log("Não enviando ataque para " + coords + ". Min " + unitType + " = " + minUnits + " enquanto nós precisamos apenas " + fullHaulUnits + " para um transporte completo.", twf.helper.MESSAGE_WARNING);
                            //twf.attacks.continueAttack = false; // to prevent trying to send
                            // does not work
                            twf.attacks.ignoreVillage();
                            console.debug("Iniciou ignoreVillage de dentro do reportSendUnits");
                            return false;
                        }
                        // not enough units
                        else if (minUnits > unitsLeft) {
                            if (unitType == "spy" && twf.attacks.attackTemplates[twf.attacks.currentAttackTemplateTimestamp].ignoreScouts) {
                                //console.debug("No spies. Trying to send...");
                                twf.attacks.continueAttack = true;
                                continue;
                            } else if (twf.data.settings.waitForTroops) {
                                twf.helper.log("Não é suficiente" + unitType + ". Esperando tropas", twf.helper.MESSAGE_DEFAULT);
                            } else {
                                twf.helper.log('Não há unidades suficientes de tipo: ' + unitType, twf.helper.MESSAGE_ERROR);
                                twf.helper.stopEverything();
                            }
                            twf.attacks.continueAttack = false;
                            return true; // we did not skip a village
                        }
                        // we have as many as we want,
                        else if (fullHaulUnits <= unitsLeft) {
                            console.debug("Set " + unitType + " para " + Math.max(minUnits, fullHaulUnits) + " (disponível " + unitsLeft + ", minimum: " + minUnits + ")");
                            frame.contents().find('#unit_input_' + unitType).val(Math.max(minUnits, fullHaulUnits));
                            twf.attacks.continueAttack = true;
                        } else {
                            console.debug("Configuração " + unitType + " to " + unitsLeft + " (Preferido mas incapaz: " + fullHaulUnits + ")");
                            frame.contents().find('#unit_input_' + unitType).val(unitsLeft);
                            twf.attacks.continueAttack = true;
                        }
                    }
                }
                console.debug("Unidades de entrada feitas. twf.attacks.continueAttack = " + twf.attacks.continueAttack);
                return true; // we did not skip a village
            } else {
                // no report
                // todo check wall level and all units lost, else send just a scout?

                // we have no report data or it is too old -> normal attacks
                // maybe change to scout and settings and stuff
                console.debug("Sem dados, mudando para a Farm manual.");
                twf.attacks.normalSendUnits(coords);
                return true;
                // no report, force scout? skip?
                // degrade to standard farming
            }

        },
        // handles inputting and checking of available units
        normalSendUnits: function(coord) {
            for (let unitType in twf.attacks.unitsPerAttack) {
                if (twf.attacks.continueAttack) {
                    twf.attacks.continueAttack = twf.attacks.sendUnit(unitType, coord);
                }
            }
        },
        sendUnit: function(unitType, coords) {
            let unitsToSend = this.unitsPerAttack;;
            let frame = this.hiddenFrame;
            if (unitsToSend[unitType] == 0) {
                return true;
            }

            let unitsLeft = frame.contents().find('#units_entry_all_' + unitType).html();
            unitsLeft = parseInt(unitsLeft.substring(1, unitsLeft.length - 1));
            // can also use [data-all-count]

            // normal farming
            if (unitsLeft >= unitsToSend[unitType]) {
                frame.contents().find('#unit_input_' + unitType).val(unitsToSend[unitType]);
                return true
                // if we are allowed to skip spies, skip them!
            } else if (unitType == "spy" && twf.attacks.attackTemplates[twf.attacks.currentAttackTemplateTimestamp].ignoreScouts) {
                twf.helper.log("Não há espiões suficientes. Tentando enviar sem espiões.", twf.helper.MESSAGE_DEFAULT);
                return true;
            } else {
                if (twf.data.settings.waitForTroops) {
                    twf.helper.log('Não há unidades suficientes de tipo: ' + unitType + ', esperando que alguns voltem!', twf.helper.MESSAGE_DEFAULT);
                } else {
                    twf.helper.log('Não há unidades suficientes de tipo: ' + unitType, twf.helper.MESSAGE_ERROR);
                    this.stopAttack();
                }
                return false
            }
        },
        attack: function() {
            console.debug("Ataques iniciados. Ataque");
            twf.attacks.attackButton.hide();
            twf.attacks.sAttackButton.show();

            let coord = twf.attacks.villageArray[twf.attacks.getPosition()];
            twf.attacks.continueAttack = true;
            let noSkippedVil = true;
            // fill in units if available
            if (!twf.data.settings.reportFarmer) {
                twf.attacks.normalSendUnits(coord);
            } else {
                // this needs all checks
                // e.g. wall level, did all troops die, etc, etc
                if (twf.reports.data[coord] && twf.reports.data[coord].buildingData && twf.reports.data[coord].buildingData.wall >= twf.data.minLightPerWall.length) {
                    console.debug("Ignore " + coords + " because wall too high.");
                    return twf.attacks.ignoreVillage();
                    // does this work?
                }
                // allow report reading if we are botting
                if (twf.data.settings.waitForTroops) {
                    twf.reports.allowAutomaticReading = true;
                }

                noSkippedVil = twf.attacks.reportSendUnits(coord);
            }
            if (twf.attacks.continueAttack && noSkippedVil) {
                console.debug("Em ataques. Ataque, antes de pressionar #target_attack");
                twf.attacks.hiddenFrame.contents().find('.target-input-field.target-input-autocomplete.ui-autocomplete-input').val(coord);
                twf.attacks.hiddenFrame.contents().find('#target_attack').click();
                twf.attacks.attacking = true;
                twf.helper.spinner.show();
                twf.helper.log("Atacando [" + coord + "]!", twf.helper.MESSAGE_SUCCES);
                return true;
                // not enough units but botting, so wait
            } else if (twf.data.settings.waitForTroops && noSkippedVil) {
                if (!twf.data.timers.attackPollTimer) {
                    // if we haven't got a timer, run it

                    // this finds the time of the first returning attacks
                    let rows = twf.attacks.hiddenFrame.contents().find('[data-command-type="return"], [data-command-type="cancel"]').parents('.command-row');
                    if (rows.length > 0) {
                        let time = rows.eq(rows.length - 1).find('[data-endtime]').html().split(":");
                        time[0] = twf.helper.leadingZero(time[0]);

                        let secondsToArrival = 3600 * parseInt(time[0]) + 60 * parseInt(time[1]) + parseInt(time[2]) + 1;

                        // create a variance variable (triangular?) distributed [-earlyTime, lateTime],
                        let pollVariance = 0;
                        if (twf.data.settings.pollLate) {
                            pollVariance += twf.helper.getRandomSecondsBetween(twf.data.settings.minPollAttack, twf.data.settings.minPollAttack + twf.data.settings.pollLateSeconds);
                        }

                        let timeToCheck = Math.floor((secondsToArrival + pollVariance + 1));
                        let s = timeToCheck % 60;
                        let m = Math.floor((timeToCheck / 60) % 60);
                        let h = Math.floor((timeToCheck / 3600));

                        twf.data.timers.attackPollTimer = window.setTimeout(twf.attacks.poll, timeToCheck * 1000);
                        twf.helper.log("Arrival in: " + time.join(":") + ". Checking in: " + h + ":" + twf.helper.leadingZero(m) + ":" + twf.helper.leadingZero(s), twf.helper.MESSAGE_DEFAULT);
                    } else {
                        var waitTime = 60;
                        twf.data.timers.attackPollTimer = window.setTimeout(twf.attacks.poll, waitTime * 1000);
                        twf.helper.log("Não há chegadas :(. Verificar " + waitTime + " segundos.");
                    }
                }
            }
        },
        poll: function() {
            twf.data.timers.attackPollTimer = null;
            twf.attacks.continueAttack = true;
            twf.attacks.attacking = true;
            twf.attacks.hiddenFrame.attr('src', twf.attacks.hiddenFrame.attr('src'));
        },
        // also stops timer
        stopAttack: function() {
            twf.attacks.attackButton.show();
            twf.attacks.sAttackButton.hide();
            twf.attacks.attacking = false;
            twf.attacks.continueAttack = false;
            if (twf.data.timers.attackPollTimer) { //remove polling timer
                window.clearTimeout(twf.data.timers.attackPollTimer);
                twf.data.timers.attackPollTimer = null;
            }
            if (twf.attacks.getPosition() >= twf.attacks.villageArray.length) {
                twf.helper.log("Ciclo finalizado. Trocar para a primeira aldeia.", twf.helper.MESSAGE_DEFAULT);
                twf.attacks.resetAttack(true);
            }
            if (twf.data.timers.reportPollTimer) {
                window.clearTimeout(twf.data.timers.reportPollTimer);
                twf.data.timers.reportPollTimer = null;
            }
            twf.reports.allowAutomaticReading = false;
            twf.helper.log("O Bot foi interrompido.", twf.helper.MESSAGE_DEFAULT);
        },
        resetAttack: function(skipLog) {
            if (!skipLog) {
                twf.helper.log("Trocar para a primeira aldeia.", twf.helper.MESSAGE_DEFAULT);
            }
            twf.attacks.attackTemplates[twf.attacks.currentAttackTemplateTimestamp].position = 0;
            $('#attacked_villages').text(twf.attacks.getPosition() + 1 + "/" + twf.attacks.villageArray.length);
            twf.data.storeTownLevel('attackTemplates', twf.attacks.attackTemplates, true)
        },
        onFrameLoaded: function() {
            console.debug("Entered attacks.onFrameLoaded");
            try {
                twf.helper.spinner.fadeOut();
                twf.helper.checkBotProtection(this.hiddenFrame);

                // check on which screen we are and do something accordingly
                // confirm attack screen
                let confirmAttack = twf.attacks.hiddenFrame.contents().find("#troop_confirm_go");
                let error = twf.attacks.hiddenFrame.contents().find('.error_box');
                // we are attacking a player
                let isPlayerEn = twf.attacks.hiddenFrame.contents().find('table.vis td:contains("Player:")');
                let isPlayerNl = twf.attacks.hiddenFrame.contents().find('table.vis td:contains("Speler:")');
                if (error && error.length > 0) {
                    let coords = twf.attacks.villageArray[twf.attacks.getPosition()];
                    twf.helper.log("Error: " + error.html() + " --- Continuar para proxima aldeias (ignorado [" + coords + "])", twf.helper.MESSAGE_ERROR);
                    return twf.attacks.ignoreVillage();
                }
                if ((isPlayerEn.length > 0 || isPlayerNl.length > 0) && !twf.data.settings.attackPlayers) {
                    let coords = twf.attacks.villageArray[twf.attacks.getPosition()];
                    twf.helper.log("O proprietário é um jogador! Continuar para proxima aldeias (ignorado  [" + coords + "])", twf.helper.MESSAGE_ERROR);
                    return twf.attacks.ignoreVillage();
                }
                // select troop screen
                if (confirmAttack.size() == 0) {

                    //============= BEGIN REPORT READING
                    // basically, if we are in place, also extract next arriving attack and set a timer
                    // TODO MAYBE CHANGE THIS TO JUST DO IT AT THE SAME TIME AS SENDING ATTACKS
                    if (twf.data.settings.reportFarmer && twf.reports.allowAutomaticReading && twf.data.timers.reportPollTimer == null && !twf.reports.currentlyReading) {
                        // automatically read report
                        if (twf.attacks.hiddenFrame.contents().find('[data-command-type="attack"]').length > 0) {
                            let rows = twf.attacks.hiddenFrame.contents().find('[data-command-type="attack"]').parents('.command-row');
                            let time = rows.eq(rows.length - 1).find('[data-endtime]').html().split(":");
                            time[0] = twf.helper.leadingZero(time[0]);

                            let secondsToArrival = 3600 * parseInt(time[0]) + 60 * parseInt(time[1]) + parseInt(time[2]) + 1;

                            // create a variance variable (triangular?) distributed [-earlyTime, lateTime],
                            let pollVariance = 0;

                            if (twf.data.settings.pollLate) {
                                pollVariance += twf.helper.getRandomSecondsBetween(twf.data.settings.minPollReport, twf.data.settings.minPollReport + twf.data.settings.pollLateSeconds * 5);
                            }

                            let timeToCheck = Math.floor((secondsToArrival + pollVariance + 1));
                            let s = timeToCheck % 60;
                            let m = Math.floor((timeToCheck / 60) % 60);
                            let h = Math.floor((timeToCheck / 3600));

                            twf.data.timers.reportPollTimer = window.setTimeout(function() {
                                twf.data.timers.reportPollTimer = null;
                                twf.reports.startReading();
                            }, timeToCheck * 1000);
                            twf.helper.log("Ataque chegando em: " + time.join(":") + ". Relatórios de leitura: " + h + ":" + twf.helper.leadingZero(m) + ":" + twf.helper.leadingZero(s), twf.helper.MESSAGE_DEFAULT);
                        }
                    }
                    // ========== END REPORT READING

                    twf.attacks.loadAttack(twf.attacks.currentAttackTemplateTimestamp);
                    twf.attacks.showAttack();
                    if (twf.attacks.attacking && twf.attacks.continueAttack) {
                        twf.attacks.attack();
                    }
                } else {
                    console.debug("Confirmar ataque para " + twf.attacks.villageArray[twf.attacks.getPosition()]);
                    //update attack information and click confirm
                    twf.attacks.attackTemplates[twf.attacks.currentAttackTemplateTimestamp].position = twf.attacks.getPosition() + 1;
                    if (twf.attacks.getPosition() >= twf.attacks.villageArray.length) {
                        if (twf.data.settings.resetToFirst) {
                            twf.attacks.resetAttack()
                        } else {
                            twf.attacks.stopAttack()
                        }
                    }
                    twf.data.storeTownLevel('attackTemplates', twf.attacks.attackTemplates);
                    twf.helper.spinner.show();
                    confirmAttack.click();
                }
            } catch (error) {
                //console.error(error);
                //twf.helper.stopEverything();
                console.error(error);
                alert("BOT PROTECTION?\n" + new Date() + "\n" + error);
            }
        },
        // shows the currently loaded attack in the panel and bind clicking on it
        showAttack: function() {
            $("#attackUnits").html("");
            for (let i in this.unitsPerAttack) {
                if (this.unitsPerAttack[i] > 0) {
                    var unitsAvailable = this.hiddenFrame.contents().find('#units_entry_all_' + i).html() || "???";
                    var unitsText = i + ': ' + this.unitsPerAttack[i] + ' (' + unitsAvailable.trim().substring(1, unitsAvailable.length - 1) + ')';
                    $('<img />').attr('src', 'https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_' + i + '.png').attr('title', unitsText).attr('alt', unitsAvailable).appendTo($('#attackUnits')).click(function(event) {
                        twf.helper.showAttackTemplate(twf.attacks.currentAttackTemplateTimestamp);
                        $('#template_popup #unit_input_' + i).focus().select();
                    });
                    $('<span />').html('(' + this.unitsPerAttack[i] + ') ').css({
                        'color': '#000'
                    }).appendTo($("#attackUnits"));
                }
            }
        },
        // loads an attack from a template to prepare it for take0off
        loadAttack: function(timestamp) {
            // no templates -> error
            if (!this.attackTemplates) {
                //twf.helper.log("No attack templates available!", twf.helper.MESSAGE_WARNING);
                return;
            }
            // no ts -> load first one
            if (!timestamp) {
                timestamp = Object.keys(this.attackTemplates)[0];
            }
            // else load the one given
            this.currentAttackTemplateTimestamp = timestamp;
            let attack = this.attackTemplates[timestamp];
            $("#attackName").html(attack.name);
            for (let i in twf.data.unitTypes) {

                this.unitsPerAttack[twf.data.unitTypes[i]] = attack.units[twf.data.unitTypes[i]];
                //console.log(this.unitsPerAttack)
            }
            this.villageString = attack.coords.join(" ");
            this.villageArray = attack.coords;
            this.villageArray = twf.helper.sortByDistance(this.villageArray, game_data.village.coord);
            this.showAttack();
            $('#attacked_villages').text(this.getPosition() + 1 + "/" + this.villageArray.length);
            return attack;
        },
        // fills the list of attack templates
        populateTemplateList: function() {
            $("#attackList").children().remove();
            for (let timestamp in this.attackTemplates) {
                let row = $('<tr/>').appendTo($("#attackList"));
                $('<td title="Carregue este ataque" />').html('L').bind('click', {
                    attack: timestamp
                }, function(event) {
                    twf.attacks.loadAttack(event.data.attack);
                }).css({
                    'border': '1px solid #0F0',
                    'width': '10px',
                    'cursor': 'pointer',
                    'color': '#0F0',
                    'background-color': '#000'
                }).appendTo(row);
                $('<td>' + this.attackTemplates[timestamp].name + '</td>').appendTo(row);
                $('<td title="Remova esse ataque (NÃO PODE SER DESTACADO)" />').html('X').bind('click', {
                    attack: timestamp
                }, function(event) {
                    if (confirm("Você tem certeza que deseja remover'" + twf.attacks.attackTemplates[event.data.attack].name + "'?")) {
                        twf.attacks.removeAttackTemplate(event.data.attack);
                    }
                }).css({
                    'border': '1px solid #f00',
                    'width': '10px',
                    'cursor': 'pointer',
                    'color': '#f00',
                    'background-color': '#000'
                }).appendTo(row);
            }
        },
        // saves an attack template and reloads the templatelist
        saveAttackTemplate: function() {
            // check if data is valid
            if (!$("#unit_input_name").val() || $("#unit_input_coords").val().match(/[\d{3}\|\d{3}\s]+/) === null) {
                $(".quest-summary").css("background-color", "red");
                $(".quest-summary")[0].innerHTML = "Certifique-se de preencher os caracteres e nomear corretamente e tente novamente!";
                return false;
            }
            // fill table of units
            let unitsToSend = {};
            for (let i in twf.data.unitTypes) {
                unitsToSend[twf.data.unitTypes[i]] = parseInt($("#unit_input_" + twf.data.unitTypes[i]).val()) || 0;
            }
            //clear coords from empty values
            let tempCoords1 = $("#unit_input_coords").val().trim().split(" ");
            let tempCoords2 = [];
            for (let i in tempCoords1) {
                if (tempCoords1[i]) {
                    tempCoords2.push(tempCoords1[i]);
                }
            }
            // fill template
            let template = {
                name: $("#unit_input_name").val(),
                units: unitsToSend,
                coords: tempCoords2,
                position: $("#unit_input_position").val(),
                ignoreScouts: $('#ignore_scouts').is(":checked"),
            }
            // save
            if (!twf.attacks.attackTemplates) { // no attacktemplates so it is reset to null when loading
                // so we have to instantiate it now
                twf.attacks.attackTemplates = {};
            }
            twf.attacks.attackTemplates[$("#unit_input_timestamp").val()] = template;
            twf.data.storeTownLevel("attackTemplates", this.attackTemplates);
            twf.helper.log("Salvo o novo modelo de ataque: " + template.name, twf.helper.MESSAGE_SUCCES);
            this.populateTemplateList();
            this.loadAttack($("#unit_input_timestamp").val());
            $("#template_popup").hide();
        },
        // removes an attack template from storage and reloads the templatelist
        removeAttackTemplate: function(timestamp) {
            delete this.attackTemplates[timestamp]
            if (this.currentAttackTemplateTimestamp == timestamp) {
                this.loadAttack();
            }
            twf.data.storeTownLevel("attackTemplates", this.attackTemplates);
            this.populateTemplateList();
        },
        // loads all attack templates from storage
        loadAttackTemplates: function() {
            this.attackTemplates = twf.data.loadTownLevel("attackTemplates");
            this.populateTemplateList();
            if (this.attackTemplates) {
                let l = Object.keys(this.attackTemplates).length;
                twf.helper.log("Loaded " + l + " attack template" + ((l > 1) ? "s." : "."), twf.helper.MESSAGE_SUCCES);
            } else {
                twf.helper.log("Nenhum modelo de ataque a ser carregado.<b> Create one first! </b>", twf.helper.MESSAGE_WARNING);
            }
        },
        // returns the current village to attack (persistent throughout runs)
        getPosition: function() {
            return parseInt(this.attackTemplates[this.currentAttackTemplateTimestamp].position);
        },
        ignoreVillage: function() {
            console.group("ignoreVillage");
            // before update
            console.log("BEFORE UPDATE");
            console.log("attackTemplates: ", this.attackTemplates);
            console.log("url: ", this.hiddenFrame[0].src);
            console.log("villageArray: ", this.villageArray);
            console.log("attTemplate timestamp: ", this.currentAttackTemplateTimestamp);
            console.log("attTemplate[timestamp].pos: ", this.attackTemplates[this.currentAttackTemplateTimestamp].position);
            console.log("getPosition: ", this.getPosition());
            console.log("currentCoords: ", this.villageArray[this.getPosition()]);

            this.attackTemplates[this.currentAttackTemplateTimestamp].position = this.getPosition() + 1;

            console.log("===========================");
            console.log("AFTER UPDATE");
            console.log("attackTemplates: ", this.attackTemplates);
            console.log("url: ", this.hiddenFrame[0].src);
            console.log("villageArray: ", this.villageArray);
            console.log("attTemplate timestamp: ", this.currentAttackTemplateTimestamp);
            console.log("attTemplate[timestamp].pos: ", this.attackTemplates[this.currentAttackTemplateTimestamp].position);
            console.log("getPosition", this.getPosition());
            console.log("currentCoords: ", this.villageArray[this.getPosition()]);
            //console.error("IGNORED A VILLAGE, BUT STILL PRESS OKAY");
            //console.error("Village to be ignored: " + this.villageArray[this.attackTemplates[this.currentAttackTemplateTimestamp].position - 1] + ". Village to continue with: " + this.villageArray[this.attackTemplates[this.currentAttackTemplateTimestamp].position]);
            if (this.getPosition() >= this.villageArray.length) {
                if (twf.data.settings.resetToFirst) {
                    this.resetAttack();
                } else {
                    this.stopAttack();
                }
            }

            twf.data.storeTownLevel('attackTemplates', twf.attacks.attackTemplates);
            console.log("===========================");
            console.log("BEFORE REFRESH");
            console.log("url: ", this.hiddenFrame[0].src);
            console.log("url New : ", this.hiddenFrameUrl);
            console.groupEnd();
            this.hiddenFrame.attr('src', this.hiddenFrameUrl);
            console.log("Returning true in ignoreVillage()");
            return true;
        }
    },
    helper: {
        MESSAGE_ERROR: 0,
        MESSAGE_SUCCES: 1,
        MESSAGE_DEFAULT: 2,
        MESSAGE_WARNING: 3,
        splash: null,
        stickyPanel: false,
        panelInTransit: false,
        panelOut: false,
        init: function() {
            //append all html snippets and set their click events
            $("head").append(twf.html.css);
            $(twf.html.templatePopup).appendTo('body').hide();
            $(twf.html.settingsPopup).appendTo('body').hide();
            this.panel = $(twf.html.panel).appendTo('body').bind("mouseenter", twf.helper.panelMouseIn).bind("mouseleave", twf.helper.panelMouseOut);

            this.messages = $('#messages');
            this.spinner = $('#loading');

            $('#save_attack_template').click(function() {
                twf.attacks.saveAttackTemplate();
            });
            $('.close_template_button').click(function() {
                $('#template_popup').hide();
            })
            $('.close_settings_button').click(function() {
                $('#settings_popup').hide();
            })
            $('#save_settings').click(function() {
                twf.data.saveSettings();
            });
            $('#show_settings').click(function() {
                twf.helper.showSettings();
            });
            $("#wallbreaker").click(function() {
                twf.helper.log("Este módulo ainda não está terminado.", twf.helper.MESSAGE_ERROR);
            })

            $('#tack').click(this.toggleSticky).find('.on').hide();

            $('#attackUnits').attr('title', 'Clique nas imagens para editar o modelo');

            twf.helper.log("Módulo auxiliar pronto.", twf.helper.MESSAGE_SUCCES);
        },
        createHiddenFrame: function(url, onload, frameId) {
            return $('<iframe id="' + frameId + '" src="' + url + '" />').load(onload).css({
                width: '100px',
                height: '100px',
                position: 'absolute',
                left: '-1000px'
            }).appendTo('body').hide();
        },
        showSettings: function() {
            // checkboxes
            $('#reset_to_first').prop('checked', twf.data.settings.resetToFirst);
            $('#wait_for_troops').prop('checked', twf.data.settings.waitForTroops);
            $('#attack_players').prop('checked', twf.data.settings.resetToFirst);
            $('#autostop').prop('checked', twf.data.settings.autoStop);
            $('#poll_late').prop('checked', twf.data.settings.pollLate);
            $('#discount_time').prop('checked', twf.data.settings.discountTime);
            $('#report_farmer').prop('checked', twf.data.settings.reportFarmer);

            //values
            $('#autostop_minutes').val(twf.data.settings.autoStopMinutes);
            $('#poll_late_seconds').val(twf.data.settings.pollLateSeconds);
            $('#discount_factor').val(twf.data.settings.discountFactor == 1 ? twf.data.settings.discountFactor + ".00" : twf.data.settings.discountFactor);
            $("#report_max_read_age").val(twf.data.settings.reportMaxReadAge);
            $("#report_max_use_age").val(twf.data.settings.reportMaxUseAge);

            //show
            $('#settings_popup').show();
        },
        showAttackTemplate: function(timestamp) {
            // if timestamp, load old if exists
            if (timestamp && twf.attacks.attackTemplates.hasOwnProperty(timestamp)) {
                $("#template_popup #unit_input_timestamp").val(timestamp);
                $("#template_popup #unit_input_position").val(twf.attacks.attackTemplates[timestamp].position);
                $("#template_popup #unit_input_coords").val(twf.attacks.attackTemplates[timestamp].coords.join(" ").trim());
                $("#template_popup #unit_input_name").val(twf.attacks.attackTemplates[timestamp].name);
                for (let i in twf.data.unitTypes) {
                    $("#template_popup #unit_input_" + twf.data.unitTypes[i]).val(twf.attacks.attackTemplates[timestamp].units[twf.data.unitTypes[i]])
                }
                $('#ignore_scouts').prop('checked', twf.attacks.attackTemplates[timestamp].ignoreScouts);
            } else {
                $("#template_popup #unit_input_timestamp").val(+new Date());
                $("#template_popup #unit_input_position").val('0');
                $("#template_popup #unit_input_coords").val('');
                $("#template_popup #unit_input_name").val('');
                for (let i in twf.data.unitTypes) {
                    $("#template_popup #unit_input_" + twf.data.unitTypes[i]).val('')
                }
                $('#ignore_scouts').prop('checked', false);
            }
            $("#template_popup").show();
        },
        panelMouseIn: function() {
            if (!twf.helper.stickyPanel && !twf.helper.panelInTransit && !twf.helper.panelOut) {
                twf.helper.panelInTransit = true;
                twf.helper.panel.animate({
                    "right": "+=314px"
                }, "slow", function() {
                    twf.helper.panelInTransit = false;
                    twf.helper.panelOut = true;
                })
            }
        },
        panelMouseOut: function() {
            if (!twf.helper.stickyPanel && !twf.helper.panelInTransit && twf.helper.panelOut) {
                twf.helper.panelInTransit = true;
                twf.helper.panel.animate({
                    "right": "-=314px"
                }, "slow", function() {
                    twf.helper.panelInTransit = false;
                    twf.helper.panelOut = false;
                })
            }
        },
        toggleSticky: function() {
            twf.helper.stickyPanel = !twf.helper.stickyPanel;
            $('#tack').find('.on').toggle();
            $('#tack').find('.off').toggle();
        },
        sortByDistance: function(arr, me) {
            return arr.sort(function(a, b) {
                a = a.split("|");
                b = b.split("|");
                let from = me.split("|");
                let d1 = (a[0] - from[0]) * (a[0] - from[0]) + (a[1] - from[1]) * (a[1] - from[1]);
                let d2 = (b[0] - from[0]) * (b[0] - from[0]) + (b[1] - from[1]) * (b[1] - from[1]);
                return d1 - d2;
            });

        },
        getServerTime: function(frame) {
            let serverTime = frame.contents().find('#serverTime').text().split(":"); //[7; 14; 05] for example
            serverTime[0] = twf.helper.leadingZero(parseInt(serverTime[0])) // add leading zero to hour
            let serverDate = frame.contents().find('#serverDate').text().split("/").reverse().join("-");
            //console.debug(serverDate);
            // assume everything in UTC, but it does not matter since their timezone is always the same.
            return new Date(serverDate + "T" + serverTime.join(":") + "Z");
        },
        getResPerHour: function(level) {
            if (level == 0) {
                return 5;
            }
            return 30 * Math.pow(1.163118, level - 1);
        },
        getTravelTimeInMinutes: function(distance, unit) {
            return distance * twf.data.travelTime[unit] / twf.data.worldSettings.speed / twf.data.worldSettings.unitSpeed;
        },
        getDistance: function(opp, me) {
            let a = opp.split("|");
            let b = me.split("|");
            return Math.sqrt((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]));
        },
        getMaxStorage: function(level) {
            return Math.round(1000 * Math.pow(1.2294934, (level - 1)));
        },
        getMaxHiding: function(level) {
            return Math.round(150 * Math.pow((4 / 3), (level - 1)));
        },
        leadingZero: function(a) {
            return (a < 10) ? '0' + a : a;
        },
        getRandomSecondsBetween: function(low, high) {
            if (low >= high) {
                console.log("Valor errado para baixo, alto:" + [low, high]);
                return null;
            }
            return Math.random() * (high - low) + low;
        },
        checkBotProtection: function(frame) {
            if (!frame) return true;

            if (frame.contents().find(".g-recaptcha, #bot_check").length > 0 || $(".g-recaptcha, #bot_check").length > 0 || frame.contents().find("body").data("bot-protect")) {
                console.warn("BOT PROTECTION DETECTED!");
                this.stopEverything();
                alert("BOT PROTECTION DETECTED! --- " + new Date());
            }
        },
        stopEverything: function() {
            twf.attacks.stopAttack();
            twf.reports.stopReading();
            if (twf.data.timers.reportPollTimer) {
                clearTimeout(twf.data.timers.reportPollTimer);
                console.debug("Stopped reportPollTimer.");
            }
        },
        log: function(text, messageType) {
            let date = new Date();
            let message = '<i>' + twf.helper.leadingZero(date.getHours()) + ':' + twf.helper.leadingZero(date.getMinutes()) + ':' + twf.helper.leadingZero(date.getSeconds()) + ': </i>';
            switch (messageType) {
                case this.MESSAGE_ERROR:
                    message += '<span style="color: #F00;">' + text + '</span>';
                    break;
                case this.MESSAGE_SUCCES:
                    message += '<span style="color: #0F0;">' + text + '</span>';
                    break;
                case this.MESSAGE_WARNING:
                    message += '<span style="color:#FFA500;">' + text + '</span>';
                    break;
                default:
                    message += '<span style="color: #FFF;">' + text + '</span>';
                    break;
            }
            twf.helper.messages.append('<li>' + message + '</li>');
            twf.helper.messages.scrollTop(twf.helper.messages[0].scrollHeight);
        },
    },
    html: {
        templatePopup: '<div id="template_popup" class="popup_box_container"> <div class="popup_box show" id="popup_box_quest" style="width: 700px;"> <div class="popup_box_content"> <a class="popup_box_close close_template_button" href="#">&nbsp;</a> <div style="width: 700px"> <div style="background: no-repeat url(' + " '/graphic/paladin_new.png' " + ');"> <h3 style="margin: 0 3px 5px 120px;">Crie um modelo.</h3> <table align="right" style="margin-bottom: 5px;"> <tbody> <tr> <td class="quest-summary" style="width: 583px"> Crie um modelo aqui para usar no Farm automático. Se você ativou <em>Report Farming</ em> em <em>Configurações</ em>, note que os valores aqui são valores mínimos. Por Fim Lembra-se que na configuração deve ser inserido o nome do modelo a seu gosto, e deve ser posta as coordenadas quantas desejar.</td> </tr> </tbody> </table> <div class="quest-goal"> <table style="border:none;"> <tbody> <tr> <td valign="top"> <table class="vis" width="100%"> <tbody> <tr> <th>Infantry</th> </tr> <tr> <td class="nowrap "> <a href="#" class="unit_link" data-unit="spear"><img src="https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_spear.png" title="Spear" alt="" class=""></a> <input id="unit_input_spear" name="spear" type="text" style="width: 40px" tabindex="1" value="" class="unitsInput" data-all-count="39"></td> </tr> <tr> <td class="nowrap "> <a href="#" class="unit_link" data-unit="sword"><img src="https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_sword.png" title="Sword" alt="" class=""></a> <input id="unit_input_sword" name="sword" type="text" style="width: 40px" tabindex="2" value="" class="unitsInput" data-all-count="20"> </td> </tr> <tr> <td class="nowrap"> <a href="#" class="unit_link" data-unit="axe"><img src="https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_axe.png" title="Axe" alt="" class=""></a> <input id="unit_input_axe" name="axe" type="text" style="width: 40px" tabindex="3" value="" class="unitsInput" data-all-count="0"></td> </tr> <tr> <td class="nowrap"> <a href="#" class="unit_link" data-unit="archer"><img src="https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_archer.png" title="Archer" alt="" class=""></a> <input id="unit_input_archer" name="archer" type="text" style="width: 40px" tabindex="4" value="" class="unitsInput" data-all-count="0"> </td> </tr> </tbody> </table> </td> <td valign="top"> <table class="vis" width="100%"> <tbody> <tr> <th>Cavalry</th> </tr> <tr> <td class="nowrap "> <a href="#" class="unit_link" data-unit="spy"><img src="https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_spy.png" title="Spy" alt="" class=""></a> <input id="unit_input_spy" name="spy" type="text" style="width: 40px" tabindex="5" value="" class="unitsInput" data-all-count="4"></td> </tr> <tr> <td class="nowrap "> <a href="#" class="unit_link" data-unit="light"><img src="https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_light.png" title="LC" alt="" class=""></a> <input id="unit_input_light" name="light" type="text" style="width: 40px" tabindex="6" value="" class="unitsInput" data-all-count="13"> </td> </tr> <tr> <td class="nowrap "> <a href="#" class="unit_link" data-unit="marcher"><img src="https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_marcher.png" title="Marcher" alt="" class=""></a> <input id="unit_input_marcher" name="marcher" type="text" style="width: 40px" tabindex="7" value="" class="unitsInput" data-all-count="0"></td> </tr> <tr> <td class="nowrap "> <a href="#" class="unit_link" data-unit="heavy"><img src="https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_heavy.png" title="Heavy" alt="" class=""></a> <input id="unit_input_heavy" name="heavy" type="text" style="width: 40px" tabindex="8" value="" class="unitsInput" data-all-count="0"> </td> </tr> </tbody> </table> </td> <td valign="top"> <table class="vis" width="100%"> <tbody> <tr> <th>Cerco</th> </tr> <tr> <td class="nowrap "> <a href="#" class="unit_link" data-unit="ram"><img src="https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_ram.png" title="Ram" alt="" class=""></a> <input id="unit_input_ram" name="ram" type="text" style="width: 40px" tabindex="9" value="" class="unitsInput" data-all-count="0"> </td> </tr> <tr> <td class="nowrap "> <a href="#" class="unit_link" data-unit="catapult"><img src="https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_catapult.png" title="Catapult" alt="" class=""></a> <input id="unit_input_catapult" name="catapult" type="text" style="width: 40px" tabindex="10" value="" class="unitsInput" data-all-count="0"></td> </tr> </tbody> </table> </td> <td valign="top"> <table class="vis" width="100%"> <tbody> <tr> <th>Outras</th> </tr> <tr> <td class="nowrap "> <a href="#" class="unit_link" data-unit="knight"><img src="https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_knight.png" title="Knight" alt="" class=""></a> <input id="unit_input_knight" name="knight" type="text" style="width: 40px" tabindex="11" value="" class="unitsInput" data-all-count="0"> </td> </tr> <tr> <td class="nowrap "> <a href="#" class="unit_link" data-unit="snob"><img src="https://dsnl.innogamescdn.com/8.67/31807/graphic/unit/unit_snob.png" title="Snob" alt="" class=""></a> <input id="unit_input_snob" name="snob" type="text" style="width: 40px" tabindex="12" value="" class="unitsInput" data-all-count="0"> </td> </tr> </tbody> </table> </td> <td valign="top"> <table class="vis" width="100%"> <tbody> <tr> <th>Configurações</th> </tr> <tr> <td class="nowrap "> <input id="unit_input_name" name="name" type="text" style="width: 100%;" tabindex="13" value="" class="unitsInput" data-all-count="0" placeholder="Name"> </td> </tr> <tr> <td class="nowrap "> <input id="unit_input_coords" name="coords" type="text" style="width: 100%;" tabindex="13" value="" class="unitsInput" data-all-count="0"> </td> </tr> <tr> <td title="Envie ataques independentemente da quantidade de spys disponíveis." class="nowrap"> <input id="ignore_scouts" name="ignore_scouts" type="checkbox" /> <label for="ignore_scouts">Ignorar poucos spys</label> </td> </tr> </tbody> </table> <input type="hidden" id="unit_input_timestamp" value="" /> <input type="hidden" id="unit_input_position" value="" /> </td> </tr> </tbody> </table> </div> </div> <div align="center" style="padding: 10px;"> <a class="btn close_template_button" href="#">Fechar</a> <a class="btn" id="save_attack_template">Salvar e fechar</a> </div> </div> </div> </div> <div class="fader"></div> </div>',
        css: '<style type="text/css">#settings_table td{ padding: 0 5px 0 5px; }#panel { background-color: #000000; border: 0 none; box-shadow: 5px 5px 10px #999999; border-bottom-left-radius: 15px; border-top-left-radius: 15px; -webkit-border-bottom-left-radius: 15px; -moz-border-radius-bottomleft: 15px; -webkit-border-top-left-radius: 15px; -moz-border-radius-topleft: 15px; float: right; color: #ddd; font-size: 10px; line-height: 1.5em; margin-right: 0%; opacity: 0.95; padding: 15px; padding-top: 1px; position: fixed; top: 60px; right: -315px; text-align: left; width: 300px; z-index: 12000; } #attackName { margin: 0 } #buttons {} #buttons button { width: 144px; margin: 0 2px; text-align: center;} #buttons input[type "checkbox"] { margin: 5px 2px 0 0; } #buttons p { width: 145px } #buttons label { width: 129px; display: inline-block } #unitTable { background: #000; width: 300px; } #unitTable.vis td { background: #000; } #attackListWrapper { height: 90px; width: 310px; overflow-y: auto; } #attackList { width: 300px; margin-top: 10px; } #attackList tr { height: 10px; } #attackList tr: nth-child(odd) { background-color: #c0c0c0; color: #0c0c0c; } #attackUnits { cursor: pointer; } #rAttackListWrapper { /*height: 80px;*/ width: 310px; overflow-y: auto; } #rAttackList { width: 300px; margin-top: 10px; } #rAttackList tr { height: 10px; color: #f00; font-wheight: bold; } #rAttackList tr.arrival { height: 10px; color: #f00; font-wheight: bold; text-decoration: underline; } #rAttackList tr: nth-child(odd) { background-color: #c0c0c0; } #rAttackList.timer { width: 50px; } #tack { margin: 0; cursor: pointer; } #loading { position: absolute; right: 0; bottom: 0; } #messages { list-style: none; width: 310px; height: 200px; overflow: auto; padding: 0 } #messages.note {} #messages.nor { color: #0f0; } #messages.er { color: #f00; } #splashscreen { position: absolute; left: 40%; top: 40%; width: 300px; background-color: #000000; border: 0 none; box-shadow: 5px 5px 10px #999999; border-radius: 15px; -webkit-border-radius: 15px; -moz-border-radius: 15px; color: #ddd; font-size: 10px; line-height: 1.5em; opacity: 0.80; padding: 15px; text-align: left; z-index: 99999 } #splashscreen h1 {} #closer { position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; background: url("http://cdn2.tribalwars.net/graphic/index/grey-fade.png?01a9d"); z-index: 12000; } #captchaframe { position: absolute; left: 30%; top: 20%; width: 600px; background-color: #000000; border: 0 none; box-shadow: 5px 5px 10px #999999; border-radius: 15px; -webkit-border-radius: 15px; -moz-border-radius: 15px; color: #ddd; font-size: 10px; line-height: 1.5em; opacity: 0.80; padding: 15px; text-align: left; z-index: 99999 } #captchacloser { position: fixed; width: 100%; height: 100%; top: 0px; left: 0px; background: url("http://cdn2.tribalwars.net/graphic/index/grey-fade.png?01a9d"); z-index: 12000; } .timer {} .tooltip { display: none; position: absolute; left: -10px; background-color: #fff; color: #000; }</style>',
        panel: '<div id="panel"> <span id="tack"><img style="" src="https://openclipart.org/image/20px/svg_to_png/89059/394580430943859083405.png&disposition=attachment" class="off" height="20" /><img src="https://openclipart.org/image/20px/svg_to_png/33601/thumb%20tack%202%20plain.png&disposition=attachment" class="on" height="20" />Maker by Jari - by Carigan by Marcos v.s Marques</span> <div id="newContent"> <div id="loading"><img src="graphic/throbber.gif" title="Carregando algo, aguarde..." alt="Carregando algo, aguarde.." /></div> <ul id="messages"> <li>Layout inicializado</li> <li>Carregando as tropas disponíveis</li> </ul> <div id="attackListWrapper"> <table id="attackList"></table> </div> <div id="rAttackListWrapper"> <table id="rAttackList"></table> </div> <h3 id="attackName"></h3> <table id="unitTable"> <tbody> <tr> <td valign="top"> <table class="vis" width="100%"> <tbody> <tr> <td id="attackUnits" class="nowrap"><img src="http://cdn2.tribalwars.net/graphic/command/attack.png?0019c" title="Attacked villages" alt="Attacked villages" class="" /><input id="attackedVillages" name="attackedVillages" type="text" style="width: 40px" tabindex="10" value="" class="unitsInput" /><i style="color: #000;" id="amount_of_attackedVillages">Procurando...</i>&nbsp; </td> </tr> </tbody> </table> </td> </tr> <tr> <td valign="top"> <table class="vis" width="100%"> <tbody> <tr> <td style="color: black; width: 50%;" class="nowrap attacked_villages">Aldeias: <span id="attacked_villages">Procurando.</span></td> <td style="color: black; width: 50%;" class="nowrap reports_left">Relatórios: <span id="reports_left">Esperando dados.</span></td> </tr> </tbody> </table> </td> </tr> </tbody> </table> <div id="buttons"> <button class="btn btn-attack btn-disabled" id="attackButton" style="width: 296px; padding-right: 25px; padding-left: 25px;" disabled>Ataque</button> <button class="btn btn-cancel btn-disabled" id="sAttackButton" style="display:none; width: 296px; padding-right: 25px; padding-left: 25px;" disabled>Cancelar ataque</button> <button class="btn btn-recruit btn-disabled" id="cAttackButton" disabled>Novo ataque</button> <button class="btn btn-disabled" id="resetAttack" title="Redefinir o ataque para a primeira vila" disabled>Reiniciar contador</button> <button class="btn btn-research btn-disabled" id="show_settings" disabled>Configurações</button> <button class="btn btn-disabled" id="start_reports" disabled>Leia relatórios</button> <button class="btn btn-cancel btn-disabled" id="stop_reports" style="display:none;" disabled>Pare de ler</button> <button class="btn btn-pp btn-disabled" id="donate">Doação!</button> <button class="btn btn-disabled" id="wallbreaker">Muralha Ariet</button> </div> </div> </div> ',
        settingsPopup: '<div id="settings_popup" class="popup_box_container"> <div class="popup_box show" id="popup_box_quest" style="width: 700px;"> <div class="popup_box_content"> <a class="popup_box_close close_settings_button" href="#">&nbsp;</a> <div style="width: 700px"> <div style="background: no-repeat url(' + " '/graphic/paladin_new.png' " + ');"> <h3 style="margin: 0 3px 5px 120px;">Configurações globais</h3> <table align="right" style="margin-bottom: 5px;"> <tbody> <tr> <td class="quest-summary" style="width: 583px"> <p> Modifique várias configurações específicas do modelo aqui! Observe que usar este bot é compatível e nenhuma combinação de configurações é permitida. Dito isto, a combinação que é menos provável suscitar suspeitas consiste em não verificar nenhuma das caixas (talvez exceto <em> Atacar jogadores </em>) na coluna Configurações gerais. Especialmente <em> Redefinir para primeiro </em> e <em> Aguarde tropas </em> são muito similares a bot. </P> <p> Com a configuração <em> Poll Late </em>, você pode atrasar a atualização da página depois que as tropas chegaram por um valor aleatório. Isto é para fazer parecer menos bot-like. </p> <p><strong>Relatorio farmer</strong></p> <p>Isso tenta imitar a funcionalidade do assistente de fazenda, mas melhor! Selecione se deseja reduzir o tempo e por qual fator. Isso significa que, se for longo o último ataque, assumimos que há menos recursos do que no caso perfeito. Por exemplo, com um fator de desconto de 1,07, assumimos que, após 11 horas, apenas aproximadamente metade dos recursos esperados estará realmente lá.</p> </td> </tr> </tbody> </table> <div class="quest-goal"> <table style="border:none;" id="settings_table"> <tbody> <thead style="font-weight:bold;"> <tr> <td colspan="2">Geral</td> <td colspan="2">Bot</td> <td colspan="2">Relatorios</td> </tr> </thead> <tr> <td colspan="1" title="Repor para a primeira vila quando fora das aldeias alvo"><label for="reset_to_first">Redefinir primeiro</label></td> <td colspan="1" title="Repor para a primeira vila quando fora das aldeias alvo"><input type="checkbox" id="reset_to_first" name="reset_to_first" /></td> <td colspan="1" title="Segundos para atualizar tarde"><label for="poll_late_seconds">Max segundos</label></td> <td colspan="1" title="Segundos para atualizar tarde"><input style="width: 20px;" maxlength="3" type="text" id="poll_late_seconds" name="poll_late_seconds"/></td> <td colspan="1" title="Habilite o localizador de relatórios!"><label for="report_farmer">Relatorio Finder</label></td> <td colspan="1" title="Habilite o localizador de relatórios!"><input type="checkbox" id="report_farmer" name="report_farmer" /></td> </tr> <tr> <td colspan="1" title="Aguarde tropas se não estiverem disponíveis"><label for="wait_for_troops">Aguarde tropas</label></td> <td colspan="1" title="Aguarde tropas se não estiverem disponíveis"><input type="checkbox" id="wait_for_troops" name="wait_for_troops" /></td> <td colspan="1" title="Ao esperar por tropas, atualize-se tarde demais às vezes"><label for="poll_late">Poll late</label></td> <td colspan="1" title="Ao esperar por tropas, atualize-se tarde demais às vezes"><input type="checkbox" id="poll_late" name="poll_late" /></td> <td colspan="1" title="Ao calcular os recursos esperados, o desconto para o tempo até o transporte"><label for="discount_time">Tempo de desconto</label></td> <td colspan="1" title="Ao calcular os recursos esperados, o desconto para o tempo até o transporte"><input type="checkbox" id="discount_time" name="discount_time" /></td> </tr> <tr> <td colspan="1" title="Atacar aldeias de jogadores quando cultivar"><label for="attack_players">Atacar players</label></td> <td colspan="1" title="Atacar aldeias de jogadores quando cultivar"><input type="checkbox" id="attack_players" name="attack_players" /></td> <td></td> <td></td> <td colspan="1" title="Fator de desconto (entre 1 e 2). Formato:1.07"><label for="discount_factor">Fator de desconto</label></td> <td colspan="1" title="Fator de desconto (entre 1 e 2). Formato: 1.07"><input style="width: 20px;" maxlength="4" type="text" id="discount_factor" name="discount_factor"/></td> </tr> <tr> <td colspan="1" title="Pare automaticamente depois de alguns minutos"><label for="autostop">Parar Automatico</label></td> <td colspan="1" title="Automatically stop after some minutes"><input type="checkbox" id="autostop" name="autostop" /></td> <td></td> <td></td> <td colspan="1" title="Tempo máxima de um relatório para leitura (h)"><label for="report_max_read_age">Tempo máxima de leitura</label></td> <td colspan="1" title="Tempo máxima de um relatório para leitura(h)"><input style="width: 20px;" maxlength="3" type="text" id="report_max_read_age" name="report_max_read_age"/></td> </tr> <tr> <td colspan="1" title="Minutos para exec antes de parar"><label for="autostop_minutes">Minutos para exec</label></td> <td colspan="1" title="Minutos para exec antes de parar"><input style="width: 20px;" maxlength="3" type="text" id="autostop_minutes" name="autostop_minutes"/></td> <td></td> <td></td> <td colspan="1" title="Tempo máxima de um relatório para cálculos (h)"><label for="report_max_use_age">Máxima de Tempo</label></td> <td colspan="1" title="Tempo máxima de um relatório para cálculos (h)"><input style="width: 20px;" maxlength="3" type="text" id="report_max_use_age" name="report_max_read_age"/></td> <tr> </tr> </tbody> </table> </div> </div> <div align="center" style="padding: 10px;"> <a class="btn close_settings_button" href="#">Fechar</a> <a class="btn" id="save_settings">Salvar e fechar</a> </div> </div> </div> </div> <div class="fader"></div> </div>'
    }
};

twf.init();
