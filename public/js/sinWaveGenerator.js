var audioContext = null;
var meter = null;

// ToDo: Add stop function
// Event listener for the sound test start
document.getElementById('soundStart').onclick = function() {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContext();

  try {
    navigator.getUserMedia = 
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia;
    navigator.getUserMedia(
    {
      'audio': {
        'mandatory': {
          'googEchoCancellation': 'false',
          'googAutoGainControl': 'false',
          'googNoiseSuppression': 'false',
          'googHighpassFilter': 'false'
        },
        'optional': []
      },
    }, gotStream, didntGetStream);
  } catch (e) {
    alert('getUserMedia threw exception :' + e);
  }
}

// Could not get the audio stream, throw warning message
function didntGetStream() {
  alert('Stream generation failed.');
}

var mediaStreamSource = null;

// Successfully got the audio stream
function gotStream(stream) {
  mediaStreamSource = audioContext.createMediaStreamSource(stream);
  meter = createAudioMeter(audioContext);
  mediaStreamSource.connect(meter);

  function SineWaveGenerator(options) {
    $.extend(this, options || {});
    
    if(!this.el) { throw 'No Canvas Selected'; }
    this.ctx = this.el.getContext('2d');
    
    if(!this.waves.length) { throw 'No waves specified'; }
    
    this._resizeWidth();
    window.addEventListener('resize', this._resizeWidth.bind(this));
    this.resizeEvent();
    window.addEventListener('resize', this.resizeEvent.bind(this));
    
    if(typeof this.initialize === 'function') {
      this.initialize.call(this);
    }
    this.loop();
  }

  // Defaults if there are no waves set
  SineWaveGenerator.prototype.speed = 10;
  SineWaveGenerator.prototype.amplifyer = 500;
  SineWaveGenerator.prototype.wavelength = 50;
  SineWaveGenerator.prototype.segmentLength = 10;

  SineWaveGenerator.prototype.lineWidth = 2;
  SineWaveGenerator.prototype.strokeStyle  = 'rgba(255, 255, 255, 0.2)';

  SineWaveGenerator.prototype.resizeEvent = function() {};

  // fill the screen
  SineWaveGenerator.prototype._resizeWidth = function() {
    // Calculating the width of the container that is nesting the canvas
    var element = document.getElementsByTagName('main')[0];
    var computedStyle = getComputedStyle(element);

    elementHeight = element.clientHeight;
    elementWidth = element.clientWidth;

    elementHeight -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom);
    elementWidth -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight);

    // Setting the width of the canvas and waves
    this.dpr = window.devicePixelRatio || 1;
    
    this.width = this.el.width = elementWidth * this.dpr;
    this.height = this.el.height = elementHeight * this.dpr;
    this.el.style.width = elementWidth + 'px';
    this.el.style.height = elementHeight + 'px';
    
    this.waveWidth = this.width * 0.95;
    this.waveLeft = this.width * 0.025;
  }

  SineWaveGenerator.prototype.clear = function () {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  SineWaveGenerator.prototype.time = 0;

  SineWaveGenerator.prototype.update = function(time) {  
    this.time = this.time - 0.007;
    if(typeof time === 'undefined') {
      time = this.time;
    }

    var index = -1;
    var length = this.waves.length;

    while(++index < length) {
      var timeModifier = this.waves[index].timeModifier || 1;
      this.drawSine(time * timeModifier, this.waves[index]);
    }
    index = void 0;
    length = void 0;
  }

  // Constants
  var PI2 = Math.PI * 2;
  var HALFPI = Math.PI / 2;

  SineWaveGenerator.prototype.ease = function(percent, amplitude) {
    return amplitude * (Math.sin(percent * PI2 - HALFPI) + 1) * 0.5;
  }


  SineWaveGenerator.prototype.drawSine = function(time, options) {
    options = options || {};
    amplitude = meter.volume * options.amplifyer;
    wavelength = options.wavelength || this.wavelength;
    lineWidth = options.lineWidth || this.lineWidth;
    strokeStyle = options.strokeStyle || this.strokeStyle;
    segmentLength = options.segmentLength || this.segmentLength;
    
    var x = time;
    var y = 0;  
    var amp = meter.volume * options.amplifyer;
   
    // Center the waves
    var yAxis = this.height / 2; 
    
    // Styling the waves
    this.ctx.lineWidth = lineWidth * this.dpr;
    if(meter.volume > 0.25) {
      // ToDo: Add a funciton which starts a test for X seconds and checks if the volume is over a certain threshold and how often the mic is clipping. This will determin if the test is passed or failed
      this.ctx.strokeStyle = 'rgba(212, 21, 71, 0.5)';
    } else {
      this.ctx.strokeStyle = strokeStyle;
    }
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.beginPath();
    
    // Starting Line
    this.ctx.moveTo(0, yAxis);
    this.ctx.lineTo(this.waveLeft, yAxis);
    
    for(var i = 0; i < this.waveWidth; i += segmentLength) {
      x = (time * this.speed) + (-yAxis + i) / wavelength; 
      y = Math.sin(x); 
      
      // Easing the lines
      amp = this.ease(i / this.waveWidth, amplitude); 
      
      this.ctx.lineTo(i + this.waveLeft, amp * y + yAxis);
      
      amp = void 0;
    }
    
    // Ending Line
    this.ctx.lineTo(this.width, yAxis);
    
    // Creating the stroke
    this.ctx.stroke();
    
    // Clean up
    options = void 0;
    amplitude = void 0;
    wavelength = void 0;
    lineWidth = void 0;
    strokeStyle = void 0;
    segmentLength = void 0;
    x = void 0;
    y = void 0;
  } 

  SineWaveGenerator.prototype.loop = function() {
    this.clear();
    this.update();
    
    window.requestAnimationFrame(this.loop.bind(this));
  }

  // Setting the variables for the waves. amplifyer is needed to get the appropriate value for the waves
  new SineWaveGenerator({
    el: document.getElementById('waves'),
    
    speed: 8,
    waves: [
      {
        timeModifier: 1,
        lineWidth: 1,
        amplifyer: 2000,
        wavelength: 200,
        segmentLength: 20
      },
      {
        timeModifier: 1,
        lineWidth: 2,
        amplifyer: 3000,
        wavelength: 100
      },
      {
        timeModifier: 1,
        lineWidth: 1,
        amplifyer: 2500,
        wavelength: 50,
        segmentLength: 10
      },
      {
        timeModifier: 1,
        lineWidth: 0.5,
        amplifyer: 3600,
        wavelength: 100,
        segmentLength: 10
      }
    ],
    
    initialize: function (){

    },
    
    resizeEvent: function() {
      var gradient = this.ctx.createLinearGradient(0, 0, this.width, 0);
      gradient.addColorStop(0,'rgba(0, 0, 0, 0)');
      gradient.addColorStop(0.5,'rgba(255, 255, 255, 0.5)');
      gradient.addColorStop(1,'rgba(0, 0, 0, 0)');
      
      var index = -1;
      var length = this.waves.length;
      while(++index < length){
        this.waves[index].strokeStyle = gradient;
      }
      
      // Clean Up
      index = void 0;
      length = void 0;
      gradient = void 0;
    }
  });
}

// Calculating the sound level
function createAudioMeter(audioContext, clipLevel, averaging, clipLag) {
  var processor = audioContext.createScriptProcessor(512);
  processor.onaudioprocess = volumeAudioProcess;
  processor.volume = 0;
  processor.averaging = averaging || 0.95;

  processor.connect(audioContext.destination);

  processor.shutdown = function() {
    this.disconnect();
    this.onaudioprocess = null;
  };

  return processor;
}

// Volume audio processor
function volumeAudioProcess(e) {
  var buf = e.inputBuffer.getChannelData(0);
  var bufLength = buf.length;
  var sum = 0;
  var x;

  for(var i = 0; i < bufLength; i++) {
    x = buf[i];
    if (Math.abs(x) >= this.clipLevel) {
      this.clipping = true;
      this.lastClip = window.performance.now();
    }
    sum += x * x;
  }

  var rms =  Math.sqrt(sum / bufLength);

  this.volume = Math.max(rms, this.volume*this.averaging);
}
