/* 
  jQuery Traffic Light plugin
  
  This plugin simplifies making multiple sequential Javascript calls, 
  with a GUI change to show success/failure.
  
  Example: you depend on a remote service (Facebook, Google, etc.) 
  and have to make several calls to a remote API to set up a new user 
  (pulling their info, pulling their friends' info, etc.).
  
  Step format:
    {
      selector: "#domSelectorToUpdate",
      url: "http://myURL" || function(resultsFromLastStep) { doStuff(); return "myURL" },
      [error: stepSpecificErrorHandler]
    }
  
*/

(function($, undefined) {
  $.widget("fn.trafficlight", {
    options: {
      steps: [],
      toDoClass:   "trafficlight-todo",
      doingClass:  "trafficlight-doing",
      doneClass:   "trafficlight-done",
      failedClass: "trafficlight-failed",
      autostart: true,
      startStep: 0,
      args: {},
      nextArgs: {}
    },
  
    _create: function() {
      var opts = this.options;

      this._validateSteps(opts.steps)._initLights();
    
      opts.currentStep = opts.startStep || 0;
    
      if (opts.autostart) {
        //this.start();
      }
    },
    
    _validateSteps: function(steps) {
      // make sure all steps have a selector and a URL string or fn
      steps = steps || this.options.steps;
      var length = steps.length, 
          step, errors = [];

      // it's okay to have 0 steps, in case they'll be dynamically added later
      for (var i = 0; (step = steps[i]) && i < length; i++) {
        if (!(step.selector && step.url)) {
          errors.push(i);
        }
      }

      if (errors.length > 0) {
        throw("TrafficLight: Step(s) " + errors.join(", ") + " were missing a selector or a URL string/function!");
      }
      
      return this;
    },
    
    _initLights: function() {
      // set all the nodes to the waiting class    
      var opts = this.options, steps = opts.steps, length = steps.length,
          toDo = opts.toDoClass, doing = opts.doingClass,
          done = opts.doneClass, failed = opts.failedClass;
        
      for (var i = 0; i < length; i++) {
        $(steps[i].selector).removeClass(doing).removeClass(done).removeClass(failed).addClass(toDo);
      }
    
      return this;
    },
  
    proceed: function(lastResults) {
      // advance to the next step
      var trafficlight = this.data("trafficlight"),
          settings = trafficlight.settings;
          stepIndex = settings.currentStep++,
          step = settings.steps[stepIndex],
          destination = step.url;  
    
      if (typeof(destination) === "function") {
        // if they've supplied a function, 
        destination = destination.apply(this, lastResults)
      }
    
      // update the DOM node
      $(step.selector).removeClass(settings.toDoClass).addClass(settings.doingClass);   
    }
  });
}(jQuery))