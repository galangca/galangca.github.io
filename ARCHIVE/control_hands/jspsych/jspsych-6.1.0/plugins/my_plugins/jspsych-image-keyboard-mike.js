/**
 * jspsych-image-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 * 
 * Adapted by Mike Galang (2021). This new plugin will listen for key releases while showing one image, and after a key release will show another image after so customizable delay.
 *
 **/


 jsPsych.plugins["image-keyboard-mike"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('image-keyboard-response', 'stimulus', 'image');

  plugin.info = {
    name: 'image-keyboard-response',
    description: '',
    parameters: {
      fixation: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      stimulus: {
        type: jsPsych.plugins.parameterType.IMAGE,
        pretty_name: 'Stimulus',
        default: undefined,
        description: 'The image to be displayed'
      },
      stimulus_height: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image height',
        default: null,
        description: 'Set the image height in pixels'
      },
      stimulus_width: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Image width',
        default: null,
        description: 'Set the image width in pixels'
      },
      maintain_aspect_ratio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Maintain aspect ratio',
        default: true,
        description: 'Maintain the aspect ratio after setting width or height'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: null,
        description: 'Any content here will be displayed below the stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: null,
        description: 'How long to hide the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: null,
        description: 'How long to show trial before it ends.'
      },
      fixation_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Fixation duration',
        default: null,
        description: 'How long to show the first image after the participant action.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // display stimulus
    var html = '<img src="'+trial.fixation+'" id="jspsych-image-keyboard-mike-stimulus" style="';
    if(trial.fixation_height !== null){
      html += 'height:'+trial.fixation_height+'px; '
      if(trial.fixation_width == null && trial.maintain_aspect_ratio){
        html += 'width: auto; ';
      }
    }
    if(trial.fixation_width !== null){
      html += 'width:'+trial.fixation_width+'px; '
      if(trial.fixation_height == null && trial.maintain_aspect_ratio){
        html += 'height: auto; ';
      }
    }
    html +='"></img><br>';

    // add prompt
    if (trial.prompt !== null){
      html += trial.prompt;
    }

    // render
    display_element.innerHTML = html;

    // store response
    var response = {
      rt: null,
      key: null
    };

    // function to end trial when it is time - really customized to make this work. 
    var end_trial = function() {
      jsPsych.pluginAPI.setTimeout(
        function() {
          document.getElementById("jspsych-image-keyboard-mike-stimulus").src = trial.stimulus;
          jsPsych.pluginAPI.clearAllTimeouts();  
          document.removeEventListener("keyup", my_response, false);      
          var trial_data = {
            "rt": response.rt,
            "stimulus": trial.stimulus,
            "key_press": response.key
          };      
          //display_element.innerHTML = '';      
          jsPsych.finishTrial(trial_data)}, trial.fixation_duration);
    };
    
    // function to handle responses by the subject

    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      
      //display_element.querySelector('#jspsych-fixation-image-keyboard-release-stimulus').className += ' responded';

      // only record the first response
      
      if (response.key == null) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };
        
    // reponse detection function
    // NOTE: keyCode is deprecated --> change to e.key or e.code (https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode)
    // NOTE: probably best to do both (https://medium.com/@uistephen/keyboardevent-key-for-cross-browser-key-press-check-61dbad0a067a)

    function my_response(e){
      my_key = jsPsych.pluginAPI.convertKeyCharacterToKeyCode(e.key) || e.keyCode; 
      for(var i=0; i < trial.choices.length; i++){            
        if(my_key == trial.choices[i]){
          var key_time = performance.now(); // console.log(key_time - start_time);
          after_response({
            key: my_key,
            rt: key_time - start_time
          });
          break;
        }     
      }
    };

    // wait for response
        
    var start_time = performance.now();
    document.addEventListener("keyup", my_response, false);

  };
  return plugin;
})();