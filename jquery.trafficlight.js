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
      ajaxOptions: {}
    },
    
    paused: false,
    errored: false,
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
        else {
          // add an args element
          step.args = step.args || {};
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
    
    reset: function() {
      this._initLights().options.currentStep = 0;
      return this;
    },
    
    pause: function() {
      this.paused = true;
      return this;
    },
  
    start: function(startStep) {
      if (startStep) {
        this.options.currentStep = startStep;
      }
      
      this.paused = this.errored = false;
      
      this._proceed();
      return this;
    },
  
    _proceed: function() {
      // advance to the next step
      var options = this.options,
          currentStep = options.currentStep || 0, 
          step = options.steps[currentStep],
          destination, node, data, jQoptions, that = this;
      
      var lastResults = this.results[currentStep - 1];
      
      if (step) {
        destination = step.url;
        node = $(step.selector);
        
        if (typeof(destination) === "function") {
          // if they've supplied a function, call it
          destination = destination(lastResults, step);
        }

        data = $.extend({}, this.options.args || {}, step.args || {});  
    
        // update the DOM node
        node.removeClass(options.toDoClass).removeClass(options.doneClass).removeClass(options.failedClass).addClass(options.doingClass);

        // now make the Ajax call
        // incorporating any additional ajax options provided
        jQoptions = $.extend({}, this.options.ajaxOptions || {}, {
          url: destination,
          data: data,
          type: step.method || "get",
          success: $.proxy(this._callSucceeded, this),
          error: function(jqXHR, textStatus, errorThrown) {
            that._callErrored.apply(that, [{
              jqXHR: jqXHR,
              text: textStatus,
              exception: errorThrown
            }])
          }
        })
        jQuery.ajax(jQoptions)
      }
      else {
        throw("Trafficlight told to proceed to step " + currentStep + " but there are no details for it!")
      }
    },
    
    _callSucceeded: function(data) {
      // a call succeeded!  trigger our success functions
      var options = this.options, step = options.steps[options.currentStep];
      var successData = {
        response: data,
        step: step,
        nextStep: options.steps[options.currentStep + 1]
      };
      
      // store data and clean up temporary arguments
      this.results[step] = data;
      
      // update the DOM node
      $(step.selector).removeClass(options.toDoClass).removeClass(options.doingClass).removeClass(options.failedClass).addClass(options.doneClass);      
      
      if (typeof(step.success) === "function") {
        step.success.apply(this.element, [successData]);
      }
      
      this._trigger("success", null, successData);

      // now, advance to the next step unless one of our success functions threw an error
      if (!this.errored) {
        options.currentStep++;
      }
      
      if (options.currentStep === options.steps.length) {
        // we're done!
        this._trigger("complete", null, successData);
      }
      else if (!this.paused) {
        // otherwise, if we're not paused, proceed
        this._proceed(data);
      }
    },
    
    error: function(textStatus, additionalDetails) {
      this._callErrored({text: textStatus, details: additionalDetails});
      return this;
    },
    
    _callErrored: function(errorData) {
      // error!  call the local and global error functions
      var options = this.options, step = options.steps[options.currentStep];
      var stepErrorResult, globalErrorResult;
      errorData.step = step;
      errorData.nexetStep = options.steps[options.currentStep];
      
      this.errored = true;
      
      // call the step-specific and global error handlers
      if (typeof(step.error) === "function") {
        stepErrorResult = step.error.apply(this.element, [errorData])
      }
      globalErrorResult = this._trigger("error", null, errorData);
      
      // you can tell the plugin to retry after error by returning "retry"
      if (stepErrorResult === "retry" || globalErrorResult === "retry") {
        this._proceed();
      }
      else {
        // otherwise, we pause the app and mark it as failed
        this.paused = true;
        $(step.selector).removeClass(options.toDoClass).removeClass(options.doingClass).removeClass(options.doneClass).addClass(options.failedClass);      
      }
    },
    
    // utilities
    
    // updateArgs: mass update for the args parameters
    // allows you to delete (by passing null/undefined for a key) as well as add
    updateArgs: function(newArgs) {
      $.extend(this.options.args, newArgs);
      return this;
    }
  });
}(jQuery))