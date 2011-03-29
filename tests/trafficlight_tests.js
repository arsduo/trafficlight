/* no need to test all the jQuery Widget Factory-provided methods */
/* we can just jump straight into testing our own code */


test("Traffliclight exists", function() {
  equal(typeof($("<div/>").trafficlight), "function");
})

module("Initialization with no arguments", {
  setup: function() {
    this.dom = $("<div/>");
    this.dom.trafficlight();
  }
})

test("it provides a default for steps", function() {
  deepEqual(this.dom.trafficlight("option", "steps"), []);
})

test("it provides a default for toDoClass", function() {
  equal(this.dom.trafficlight("option", "toDoClass"), "trafficlight-todo");
})

test("it provides a default for doingClass", function() {
  equal(this.dom.trafficlight("option", "doingClass"), "trafficlight-doing");
})

test("it provides a default for doneClass", function() {
  equal(this.dom.trafficlight("option", "doneClass"), "trafficlight-done");
})

test("it provides a default for failedClass", function() {
  equal(this.dom.trafficlight("option", "failedClass"), "trafficlight-failed");
})

test("it provides a default for autostart", function() {
  equal(this.dom.trafficlight("option", "autostart"), true);
})

test("it provides a default for startStep", function() {
  equal(this.dom.trafficlight("option", "startStep"), 0);
})

test("it provides a default for args", function() {
  deepEqual(this.dom.trafficlight("option", "args"), {});
})

test("it provides a default for nextArgs", function() {
  deepEqual(this.dom.trafficlight("option", "nextArgs"), {});
})

module("Tests for steps option", {
  setup: function() {
    this.dom = $("<div/>");
  }
})

test("it accepts 0-length step arrays", function() {
  ok(this.dom.trafficlight({steps: []}));
})

test("it accepts steps with a url string and a selector", function() {
  ok(this.dom.trafficlight({steps: [{url: "my URL", selector: "bar"}]})); 
})

test("it accepts steps with a url function and a selector", function() {
  ok(this.dom.trafficlight({steps: [{url: function() {}, selector: "bar"}]})); 
})

test("it doesn't execute/resolve the url fns immediately", function() {
  ok(this.dom.trafficlight({
    steps: [
      // this is second because of autostart
      {url: "foo", selector: "bar"},
      {url: function() { throw "Shouldn't be called" }, selector: "bar"}
    ]
  })); 
})

test("it rejects steps if they don't have a url", function() {
  raises(function() { this.dom.trafficlight({steps: [{url: undefined, selector: "bar"}]})}) 
})

test("it rejects steps if they don't have a url", function() {
  raises(function() { this.dom.trafficlight({steps: [{url: undefined, selector: "bar"}]})}) 
})