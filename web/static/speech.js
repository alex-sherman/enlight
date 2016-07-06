var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

var grammar = '#JSGF V1.0; grammar colors; public <color> = aqua | azure | beige | bisque | black | blue | brown | chocolate | coral | crimson | cyan | fuchsia | ghostwhite | gold | goldenrod | gray | green | indigo | ivory | khaki | lavender | lime | linen | magenta | maroon | moccasin | navy | olive | orange | orchid | peru | pink | plum | purple | red | salmon | sienna | silver | snow | tan | teal | thistle | tomato | turquoise | violet | white | yellow ;'
var recognition = new SpeechRecognition();
recognition.grammars = new SpeechGrammarList();
recognition.grammars.addFromString(grammar, 1);
recognition.continuous = true;
recognition.interimResults = true;
//recognition.continuous = false;
recognition.lang = 'en-US';
recognition.maxAlternatives = 1;

var diagnostic = document.querySelector('.output');
var bg = document.querySelector('html');
var commands = {}
function add_command(text, func) {
    var grammar = '#JSGF V1.0; grammar command; public <command> = ' + text + ';';
    recognition.grammars.addFromString(grammar, 1);
    commands[text] = func;
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
      var color = event.results[0][0].transcript;
      $(".speech-info").text(color);
      if(color in commands)
        commands[color]();
      console.log('Confidence: ' + event.results[0][0].confidence);
    }

    recognition.onspeechend = function() {
      recognition.stop();
    }

    recognition.onnomatch = function(event) {
      diagnostic.textContent = 'I didnt recognise that color.';
    }

    recognition.onerror = function(event) {
      $(".speech-info").text("Oops, I missed that");
    }
    $(".btn.speech").click(() => recognition.start());
});
