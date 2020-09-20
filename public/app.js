var color = $('.selected').css('background-color');
var $canvas = $('canvas');
var context = $canvas[0].getContext('2d');
var lastEvent;
var isMouseDown = false;
var socket = io.connect();
var lineEmit = 'canvas line';

function standardizeEvent(e) {
  if (/^touch/.test(e.type) && e.originalEvent.touches.length == 1) {
    var touchEvent = e.originalEvent.touches[0];
    e = { pageX: touchEvent.pageX, pageY: touchEvent.pageY };
  }
  return typeof e.offsetX === 'undefined'
    ? {
        offsetX: e.pageX - $canvas.offset().left,
        offsetY: e.pageY - $canvas.offset().top,
      }
    : { offsetX: e.offsetX, offsetY: e.offsetY };
}

function drawLine(line) {
  context.beginPath();
  context.moveTo(line.start.x, line.start.y);
  context.lineTo(line.end.x, line.end.y);
  context.strokeStyle = line.color;
  context.stroke();
}

socket.on(lineEmit, function (line) {
  drawLine(line);
});

$('ul').on('click', 'li', function () {
  $(this).addClass('selected').siblings().removeClass('selected');
  color = $(this).css('background-color');
});

function mouseEnd() {
  isMouseDown = false;
}

$canvas
  .on('mousedown touchstart', function (e) {
    e.preventDefault();
    lastEvent = standardizeEvent(e);
    isMouseDown = true;
  })
  .on('mousemove touchmove', function (e) {
    e.preventDefault();
    var event = standardizeEvent(e);
    if (isMouseDown) {
      var line = {
        start: { x: lastEvent.offsetX, y: lastEvent.offsetY },
        end: { x: event.offsetX, y: event.offsetY },
        color: color,
      };

      // console.log('Got: ' + line.start.x + ' ' + line.start.y);
      drawLine(line);
      socket.emit(lineEmit, line);
      lastEvent = standardizeEvent(e);
    }
  })
  .on('mouseup touchend', mouseEnd)
  .on('mouseleave touchcancel', mouseEnd);

function changeColor() {
  var r = $('#red').val();
  var g = $('#green').val();
  var b = $('#blue').val();
  $('#newColor').css('background', 'rgb(' + r + ',' + g + ',' + b + ')');
}

$('input[type=range]').on('input', changeColor);

$('#revealColorSelect').click(function () {
  changeColor();
  $('#colorSelect').toggle();
});

$('#addNewColor').click(function () {
  var $li = $('<li />');
  $li.css('background-color', $('#newColor').css('background-color'));
  $('ul').append($li);
  $li.trigger('click');
});

document.addEventListener('DOMContentLoaded', function () {
  socket.on('clearit', function () {
    context.clearRect(0, 0, 1100, 400);
    //  console.log('client clearit');
  });
});
function clearit() {
  socket.emit('clearit', true);
}
