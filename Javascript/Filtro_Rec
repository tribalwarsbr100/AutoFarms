if (!YOUTUBETW100)
        var YOUTUBETW100 = {};


var div = document.getElementById("am_widget_Farm");
var table = $('#plunder_list')[0];
var rows = table.getElementsByTagName("tr");



var savedMinRess, ressArray, ressInt, cells;



savedMinRess = localStorage.getItem("tm4rkus_savedMinRess");



cells = rows[0].getElementsByTagName("th");
var input = document.createElement("input");
input.size = 6;
input.value = savedMinRess;
input.style.marginRight = "5px";
cells[5].insertBefore(input, cells[5].getElementsByTagName("img")[0]);


input.addEventListener("keyup", filter, false);


function filter()
{
        savedMinRess = input.value;
        localStorage.setItem("tm4rkus_savedMinRess", savedMinRess);


        for (var i = 1; i < rows.length; i++)
        {
                cells = rows[i].getElementsByTagName("td");


                if (cells.length >= 10)
                {


                        var cellBackup = String(cells[5].innerHTML);
                        var res = $(cells[5])
                                .find('.res, .warn_90, .warn')
                                .get();
                        var ressInt = 0;
                        for (var r = 0; r < res.length; r++)
                        {
                                res[r] = Number($(res[r])
                                        .text()
                                        .replace('.', ''));
                                ressInt += res[r];
                        }
                        cells[5].innerHTML = cellBackup;


                        if (ressInt < input.value)
                        {
                                rows[i].style.display = "none";
                        }

                        else
                        {
                                rows[i].style.display = "";
                        }
                }
        }
}


filter();
