var settings = {
  format: "stacked",
  count: 60,
  allow_dupes: false,
  min: 0,
  max: 9
};

$(function() {
  var template = $(".template#" + settings.format + "-template");
  var content = $("#content");
  var min = settings.min;
  var max = settings.max;

  var range = max - min + 1;

  var count = range * range;

  function shuffle(a) {
    var i = a.length;
    var j = 0;
    var temp;

    while (i--) {
      j = Math.floor(Math.random() * (i +1 ));

      temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }

    return a;
  }

  var pairs = [];

  for (var i = min; i <= max; ++i) {
      for (var j = min; j <= max; ++j) {
        pairs.push([i,j]);
      }
  }

  pairs = shuffle(pairs);

  if (!settings.allow_dupes)
    settings.count = Math.min(count, settings.count);

  function processEquation() {
    var child = $("<div>")
      .addClass("row-6");

      var txt = template.text();

      var values = [];

      if (settings.allow_dupes) {
        for (var j = 0; j < 2; ++j) {
          var x = Math.floor(Math.random() * range) + min;
          values.push(x);
        }
      } else {
        values = pairs.pop();
      }

      var top = values[0];
      var bottom = values[1];

      txt = txt.replace("__TOP", top)
        .replace("__BOTTOM", bottom)
        .replace("__OPR", "+");

      child.html(txt);

      content.append(child);
  }

  for (var i = 0; i < settings.count; ++i) {
    processEquation(i);
  }
});
