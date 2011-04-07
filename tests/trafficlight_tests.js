/* no need to test all the jQuery Widget Factory-provided methods */
/* we can just jump straight into testing our own code */

QUnit.specify("The trafficlight plugin", function() {
  var node;
  describe("trafficlight", function() {
    before(function() {
      node = $("<div/>");
    })
    
    after(function() {
      // always clear mockjax
      $.mockjaxClear();
    })

    it("exists as a jQuery function", function() {
      equal(typeof(node.trafficlight), "function");
    })

    describe("initialization", function() {
      describe("with no arguments", function() {
        before(function() {
          node.trafficlight();
        })

        it("provides a default for steps", function() {
          deepEqual(node.trafficlight("option", "steps"), []);
        })

        it("provides a default for toDoClass", function() {
          equal(node.trafficlight("option", "toDoClass"), "trafficlight-todo");
        })

        it("provides a default for doingClass", function() {
          equal(node.trafficlight("option", "doingClass"), "trafficlight-doing");
        })

        it("provides a default for doneClass", function() {
          equal(node.trafficlight("option", "doneClass"), "trafficlight-done");
        })

        it("provides a default for failedClass", function() {
          equal(node.trafficlight("option", "failedClass"), "trafficlight-failed");
        })

        it("provides a default for autostart", function() {
          equal(node.trafficlight("option", "autostart"), true);
        })

        it("provides a default for startStep", function() {
          equal(node.trafficlight("option", "startStep"), 0);
        })

        it("provides a default for args", function() {
          deepEqual(node.trafficlight("option", "args"), {});
        })

        it("provides a default for nextArgs", function() {
          deepEqual(node.trafficlight("option", "nextArgs"), {});
        })

        it("sets the current step to 0 if not provided", function() {
          strictEqual(node.trafficlight("option", "currentStep"), 0);
        })
      })

      describe("with options", function() {
        it("sets the current step to options.startStep if provided", function() {
          node.trafficlight({startStep: 3})
          strictEqual(node.trafficlight("option", "currentStep"), 3);
        })

        it("accepts 0-length step arrays", function() {
          ok(node.trafficlight({steps: []}));
        })

        it("accepts steps with a url string and a selector", function() {
          ok(node.trafficlight({steps: [{url: "my URL", selector: "bar"}]})); 
        })

        it("accepts steps with a url function and a selector", function() {
          ok(node.trafficlight({steps: [{url: function() {}, selector: "bar"}]})); 
        })

        it("doesn't execute/resolve the url fns immediately", function() {
          ok(node.trafficlight({
            steps: [
              // this is second because of autostart
              {url: "foo", selector: "bar"},
              {url: function() { throw "Shouldn't be called" }, selector: "bar"}
            ]
          })); 
        })

        it("rejects steps if they don't have a url", function() {
          raises(function() { node.trafficlight({steps: [{url: undefined, selector: "bar"}]})}) 
        })

        it("rejects steps if they don't have a url", function() {
          raises(function() { node.trafficlight({steps: [{url: "foof", selector: undefined}]})}) 
        })
      })
      
      describe("setting up the lights", function() {
        var badClasses = [
          'trafficlight-doing',
          'trafficlight-done',
          'trafficlight-failed'
        ]
        var nodes = [], toDoNode, otherClassNode, otherClass, steps = [];
        
        before(function() {
          // set up a new set of nodes each time
          $("body").append(node);

          for (var i = 0; i < badClasses.length; i++) {
            nodes[i] = $("<div id='node" + i + "' class='" + badClasses[i] + "'/>");
            node.append(nodes[i]);
            steps.push({selector: "#node" + i, url: "boo"});
          }
          toDoNode = $("<div id='toDoNode' class='trafficlight-todo' />");  
          nodes.push(toDoNode);
          steps.push({selector: "#toDoNode", url: "boo"});
          node.append(toDoNode);

          otherClass = "otherClass";
          otherClassNode = $("<div id='otherClassNode' class='" + otherClass + "' />");
          nodes.push(otherClassNode);
          steps.push({selector: "#otherClassNode", url: "boo"});
          node.append(otherClassNode);

          // finally, run the trafflight initializer
          node.trafficlight({steps: steps, autostart: false});
        })
        
        after(function() {
          node.remove();
        })

        it("removes all the other classes", function() {
          var classRegexp = new RegExp("(" + badClasses.join("|") + ")");
          for (var i = 0; i < nodes.length; i++) {
            ok(!nodes[i].attr("class").match(classRegexp), "Removes all classes from " + nodes[i].attr("id") + " (" + nodes[i].attr("class") + ")")
          }
        })

        it("adds the class if not present", function() {
          for (var i = 0; i < nodes.length; i++) {
            ok(nodes[i].attr("class").match(/trafficlight-todo/))
          }
        })

        it("doesn't remove other classes", function() {
          ok(otherClassNode.attr("class").match(new RegExp(otherClass)));
        })
      })

      describe("autostart", function() {
        var ajaxCalled, options;
                
        before(function() {
          options = {steps: [{url: "foo", selector: "bar"}]};
          
          // reset our ajax counter
          ajaxCalled = false;
          $.mockjax(function(settings) {
            ajaxCalled = true;
            return {
              url: "/path/to/my/service"
            };
          });
        });

        it("starts automatically if autostart is not provided", function() {
          delete options.autostart;
          node.trafficlight(options);
          ok(ajaxCalled);
        })

        it("starts automatically if autostart is true", function() {
          options.autostart = true;
          node.trafficlight(options);
          ok(ajaxCalled);
        })

        it("does not starts if autostart is false", function() {
          options.autostart = false;
          node.trafficlight(options);
          ok(!ajaxCalled);
        })
        
      })
    })
    
    
    
    describe(".start", function() {
      var ajaxCalled, options;
              
      before(function() {
        options = {steps: [{url: "foo", selector: "bar"}]};
        
        // reset our ajax counter
        ajaxCalled = false;
        $.mockjax(function(settings) {
          ajaxCalled = true;
          return {
            url: "/path/to/my/service"
          };
        });
      });
      
      it("clears the paused")
    })
    
  })
})