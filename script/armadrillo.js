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

  if (oData.operator.length <= 1) {
    oData.operator = [oData.operator];
  }

  var min = oData.min;
  var max = oData.max;

  var range = max - min + 1;

  var count = range * range;

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

  var allPairs = generateAllPairs(settings);

  function generateAllPairs(settings) {
    var p = {};
    if (settings.max - settings.min > 1000) return p;

    var ops = settings.operator;

    for (var i = 0; i < ops.length; ++i) {
      var op = ops[i];

      p[op] = shuffle(_genAllPairs(op, settings));

      function shuffle(a) {
        var b, c, d;
        for (d = a.length - 1; d > 0; d--) {
          b = Math.floor(Math.random() * (d + 1));
          c = a[d];
          a[d] = a[b];
          a[b] = c;
        }
        return a;
      }

      return p;
    }

    function _genAllPairs(op, settings) {
      var p = [];
      for (var i = settings.min; i <= settings.max; ++i) {
        for (var j = settings.min; j <= settings.max; ++j) {
          if (op === "-" && !settings.allow_negatives && i < j) continue;
          p.push([i, j]);
        }
      }

      return p;
    }
  }

  function generatePairs(o) {
    if (allPairs[o] != null) {
      if (allPairs[o].length > 0) {
        return allPairs[o].pop();
      } else {
        return [];
      }
    }
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
    var operator = settings.operator[Math.floor(Math.random() * settings.operator.length)];

    var child = $("<div>")
      //.addClass("cell large-2 medium-4 small-6");
      .addClass("row-6");

    var txt = template.text();

    var values = generatePairs(operator);

    var key = generateKey(operator, values);

    if (!settings.allow_dupes && seen[key] === true) {
      while (seen[key] === true) {
        values = generatePairs(operator);
        key = generateKey(operator, values);
      }
    }

    if (!key.endsWith(":"))
      seen[key] = true;

    var top = values[0];
    var bottom = values[1];

    if (top === undefined || bottom === undefined) return;

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
  return false;
}

$(function() {
  $(".hey-listen").on("change", redraw);
  redraw();
});
