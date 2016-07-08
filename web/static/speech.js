var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var recognition = new SpeechRecognition();
recognition.grammars = new SpeechGrammarList();
var grammar = '#JSGF V1.0; grammar command; public <command> = buzz | buzz the door | buzz me in | okay enlight;';
//recognition.grammars.addFromString(grammar, 1);
recognition.interimResults = true;
recognition.lang = 'en-US';
recognition.maxAlternatives = 1;

var diagnostic = document.querySelector('.output');
var bg = document.querySelector('html');
var commands = []
function add_command(regex, func) {
    commands.push([new RegExp(regex), func]);
}

$(document).ready(function() {
    recognition.onresult = function(event) {
      // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
      // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
      // It has a getter so it can be accessed like an array
      // The first [0] returns the SpeechRecognitionResult at position 0.
      // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
      // These also have getters so they can be accessed like arrays.
      // The second [0] returns the SpeechRecognitionAlternative at position 0.
      // We then return the transcript property of the SpeechRecognitionAlternative object 
      for(var i = 0; i < event.results.length; i++) {
        var result = event.results[i][0];
        if(!recognition.result || recognition.result.confidence < (result.confidence + 0.2)) {
            var text = result.transcript.toLowerCase();
            recognition.result = {transcript:text, confidence:result.confidence};
            $("#speech-info>p").text(text);
        }
        console.log('Confidence: ' + result.confidence + ": " + result.transcript);
      }
    }

    recognition.onspeechend = function(event) {
      recognition.stop();
    }

    recognition.onnomatch = function(event) {
      diagnostic.textContent = 'I didnt recognise that color.';
    }

    recognition.onstart = function() {
      $(".btn.speech").addClass("listening");
      recognition.started = true;
      recognition.result = null;
    }

    recognition.onend = function() {
      $(".btn.speech").removeClass("listening");
      recognition.started = false;
      if(recognition.result) {
        console.log(recognition.result.transcript);
        commands.map(function(command) {
          var match = command[0].exec(recognition.result.transcript);
          if(match) {
            command[1](match);
          }
        })
      }
    }

    recognition.onerror = function(event) {
      $(".speech-info").text("Oops, I missed that");
    }
    $(".btn.speech").click(function() {
      if(!recognition.started)
        recognition.start();
      else
        recognition.stop();
    });
});
