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
      // optional arguments
      error: stepSpecificErrorHandler,
      success: stepSpecificSuccessHandler,
      args: stepSpecificArgsHash
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
    
    isPaused: false,
    results: [],
  
    _create: function() {
      var opts = this.options;

      this._validateSteps(opts.steps)._initLights();
    
      opts.currentStep = opts.startStep || 0;
    
      if (opts.autostart && opts.steps.length > 0) {
        this.start();
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
    
    pause: function() {
      this.paused = true;
    },
  
    start: function(startStep) {
      if (startStep) {
        this.options.currentStep = startStep;
      }
      
      this.paused = true;
      
      this._proceed();
    },
  
    _proceed: function() {
      // advance to the next step
      var options = this.options,
          currentStep = options.currentStep,
          stepDetails = options.steps[currentStep],
          destination, node, data;
      
      var lastResults = this.results[currentStep - 1];
      
      if (stepDetails) {
        destination = stepDetails.url;
        node = $(stepDetails.selector);
        step.data = $.extend({}, this.options.args || {}, this.options.nextArgs || {}, stepDetails.args || {});  
    
        if (typeof(destination) === "function") {
          // if they've supplied a function, call it
          destination = destination(lastResults, step);
        }
    
        // update the DOM node
        node.removeClass(options.toDoClass).removeClass(options.doneClass).removeClass(options.failedClass).addClass(options.doingClass);
      
        // now make the Ajax call
        jQuery.ajax(destination, {
          success: this._callSucceeded,
          error: this._callErrored,
          data: step.data,
          type: stepDetails.method || "get"
        })
      }
      else {
        throw("Trafficlight told to proceed to step " + currentStep + " but there are no details for it!")
      }
    },
    
    this._callSucceeded: function(data) {
      // a call succeeded!  trigger our success functions
      var options = this.options, step = options.steps[options.currentStep];
      var successData = {
        response: data,
        step: step
      };
      
      // store data and clean up temporary arguments
      this.results[step] = data;
      this.options.nextArgs = {};
      
      // update the DOM node
      $(step.selector).removeClass(options.toDoClass).removeClass(options.doingClass).removeClass(options.failedClass).addClass(options.doneClass);      
      
      if (typeof(step.success) === "function") {
        step.success(successData);
      }
      
      this._trigger("success", successData);

      // now, advance to the next step
      options.currentStep++;
      
      // and if we're not paused, proceed
      if (!this.paused) {
        this._proceed(data);
      }
    },
    
    this._callErrored: function(jqXHR, textStatus, errorThrown) {
      // error!  call the local and global error functions
      var options = this.options, step = options.steps[options.currentStep];
      var stepErrorResult, globalErrorResult;
      var errorData = {
        text: textStatus,
        exception: errorThrown,
        step: step
      };
      
      // call the step-specific and global error handlers
      if (typeof(step.error) === "function") {
        stepErrorResult = step.error(errorData)
      }
      globalErrorResult = this._trigger("error", errorData);
      
      // you can tell the plugin to retry after error by returning "retry"
      if (stepErrorResult === "retry" || globalErrorResult === "retry") {
        this._proceed();
      }
      else {
        // otherwise, we pause the app and mark it as failed
        this.paused = true;
        $(step.selector).removeClass(options.toDoClass).removeClass(options.doingClass).removeClass(options.doneClass).addClass(options.failedClass);      
      }
    }
  });
}(jQuery))