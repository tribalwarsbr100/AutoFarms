(function() {
  var global = typeof unsafeWindow !== 'undefined' ? unsafeWindow : window;

  global.TW100FWE_CONFIG_HIGHLIGHT_ROW = global.DSFWE_CONFIG_HIGHLIGHT_ROW || true;
  global.TW100FWE_CONFIG_HIGHLIGHT_ROW_COLOR = global.DSFWE_CONFIG_HIGHLIGHT_ROW_COLOR || '#1abc9c';
  global.TW100FWE_CONFIG_FARM_PAGE = global.DSFWE_CONFIG_FARM_PAGE || true;
  global.TW100FWE_CONFIG_FARM_ITEMS_PER_RUN = global.DSFWE_CONFIG_FARM_ITEMS_PER_RUN || 1;
  global.TW100FWE_CONFIG_FARM_PER_ITEM_THRESHOLD = global.DSFWE_CONFIG_FARM_PER_ITEM_THRESHOLD || 205;
  global.TW100FWE_CONFIG_PLUNDER_LIST_TOP = global.DSFWE_CONFIG_PLUNDER_LIST_TOP || true;

  function createBrLessDry($) {
    if (!$) {
      return;
    }

    function enableHighlightRow() {
      var $plunderList = $('#plunder_list');
      var $previous;

      $plunderList.find('tr').hover(function() {
        var $current = $(this);

        if ($previous) {
          $previous.find('td').css({ backgroundColor: '' });
        }

        $current.find('td').css({ backgroundColor: global.TW100FWE_CONFIG_HIGHLIGHT_ROW_COLOR });
        $previous = $current;
      });
    }

    function enableFarmPage() {
      var $plunderList = $('#plunder_list');
      var $farmAllA;
      var $farmAllB;
      var $farmAllC;

      $plunderList.find('tr:first').before([
        '<tr class="farm-enhancement">',
        '  <td colspan="8"></td>',
        '  <td>',
        '    <a class="farm_icon farm_icon_a" id="farm_all_a"></a>',
        '  </td>',
        '  <td>',
        '    <a class="farm_icon farm_icon_b" id="farm_all_b"></a>',
        '  </td>',
        '  <td>',
        '    <a class="farm_icon farm_icon_c" id="farm_all_c"></a>',
        '  </td>',
        '  <td></td>',
        '</tr>'
      ].join(''));

      $farmAllA = $('#farm_all_a');
      $farmAllB = $('#farm_all_b');
      $farmAllC = $('#farm_all_c');

      function createFarmHandler(iconName) {
        return function documentHandler() {
          var start = 0;
          var end = global.TW100FWE_CONFIG_FARM_ITEMS_PER_RUN;
          var items = $plunderList.find('tr:not(.farm-enhancement) td a.farm_icon_' + iconName);

          function handler() {
            var affected = items.slice(start, end);
            window.Accountmanager.farm.last_click = null;

            affected.trigger('click');

            start += global.TW100FWE_CONFIG_FARM_ITEMS_PER_RUN;
            end += global.TW100FWE_CONFIG_FARM_ITEMS_PER_RUN;

            if (items.length >= end) {
              setTimeout(handler, global.TW100FWE_CONFIG_FARM_PER_ITEM_THRESHOLD);
            }
          }

          handler();
        };
      }

      $farmAllA.on('click', createFarmHandler('a'));
      $farmAllB.on('click', createFarmHandler('b'));
      $farmAllC.on('click', createFarmHandler('c'));
    }

    function generateTopPlunderList() {
      var $plunderList = $('#plunder_list');
      var navContent = $('#plunder_list_nav')
        .html()
        .replace('id="plunder_list_nav"', 'id="plunder_list_nav_top"')
      ;

      $plunderList.before(navContent);
    }

    $(document).ready(function handleDocumentReady() {
      if (global.TW100FWE_CONFIG_HIGHLIGHT_ROW) {
        enableHighlightRow();
      }

      if (global.TW100FWE_CONFIG_FARM_PAGE) {
        enableFarmPage();
      }

      if (global.TW100FWE_CONFIG_PLUNDER_LIST_TOP) {
        generateTopPlunderList();
      }
    });
  }

  createBrLessDry(global.$);
})();
