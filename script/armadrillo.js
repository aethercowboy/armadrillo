var seen = {};

function toggleConfig() {
  var config = $("#configure-content");
  config.toggle();
  return false;
}

function redraw() {
  seen = {};
  var form = $("#config-form");
  var sData = unescape(form.serialize());
  var aData = sData.split('&');
  var oData = {};

  $.each(aData, function(idx, val) {
    val = val.split('=');
    if (oData[val[0]]) {
      oData[val[0]] = [oData[val[0]], val[1]];
    } else {
      oData[val[0]] = val[1];
    }
  });

  var min = oData.min;
  var max = oData.max;

  console.log(min, max);

  var range = max - min + 1;

  console.log(range);

  var count = range * range;

  console.log(count);

  if (!oData.allow_dupes)
    oData.count = Math.min(count, oData.count);

  settings = oData;

  $.each(oData, function(name, val) {
    var $el = $('[name="' + name + '"]'),
      type = $el.attr('type');

    switch (type) {
      case 'checkbox':
        $el.attr('checked', 'checked');
        break;
      case 'radio':
        $el.filter('[value="' + val + '"]').attr('checked', 'checked');
        break;
      default:
        $el.val(val);
    }
  });

  var template = $(".template#" + settings.format + "-template");
  var content = $("#content");

  content.empty();

  function generatePairs(o) {
    var values = [];
    for (var j = 0; j < 2; ++j) {
      var v = Math.floor(Math.random() * range);
      var x = v + parseInt(min);
      values.push(x);
    }

    if (!settings.allow_negatives && o == "-") {
      values = values.sort().reverse();
    }

    return values;
  }

  function generateKey(o, vs) {
    return o + ":" + vs.join(":");
  }

  function processEquation() {
    var operator = settings.operator.length > 1 ?
      settings.operator[Math.floor(Math.random() * settings.operator.length)] :
      settings.operator;

    var child = $("<div>")
      //.addClass("cell large-2 medium-4 small-6");
      .addClass("row-6");

    var txt = template.text();

    var values = generatePairs(operator);

    var key = generateKey(operator, values);

    if (!settings.allow_dupes && seen[key] === true) {
      while (seen[key] === true) {
        values = generatePairs();
        key = generateKey(operator, values);
      }
    }

    seen[key] = true;

    var top = values[0];
    var bottom = values[1];

    txt = txt.replace("__TOP", top)
      .replace("__BOTTOM", bottom)
      .replace("__OPR", operator);

    child.html(txt);

    content.append(child);
  }

  for (var i = 0; i < settings.count; ++i) {
    processEquation(i);
  }

  MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
}

$(function() {
  $(".hey-listen").on("change", redraw);
  redraw();
});
