
SERVER_URL = "/";
//GALAXY_SERVER_URL = "http://172.20.1.159/galaxydev/api/";
GALAXY_SERVER_URL = "/galaxydev/api/";
GALAXY_API_WORKFLOWS = GALAXY_SERVER_URL + "workflows/";
GALAXY_API_TOOLS = GALAXY_SERVER_URL + "tools/"

GALAXY_GET_ALL_WORKFLOWS = GALAXY_API_WORKFLOWS + "?show_published=TRUE";

//http://172.20.1.159/galaxydev/api/tools/addValue/build
//http://172.20.1.159/galaxydev/api/workflows/03501d7626bd192f
//http://172.20.1.159/galaxydev/api/workflows/


$(function () {
  /****************************************************************************************
  * MODEL DECLARATION
  *****************************************************************************************/
  var Workflow = Backbone.Model.extend({
    defaults: {
      id: '',
      name: '',
      annotation: '',
      owner: '',
      steps: [],
      tags: []
    }
  });
  // Create a collection of users
  var WorkflowList = Backbone.Collection.extend({model: Workflow});
  var workflows = new WorkflowList([]);

  var WorkflowStep = Backbone.Model.extend({
    defaults: {
      id: '',
      name: '',
      help: '',
      inputs: []
    }
  });

  var Tool = Backbone.Model.extend({
    constructor : function ( attributes, options ) {
      var inputs = [];
      for(var i in attributes.inputs){
        inputs.push(new Input(attributes.inputs[i]));
      }
      delete attributes.inputs;

      Backbone.Model.apply( this, arguments );

      this.set("inputs", inputs);
    },
    defaults: {
      id: '',
      name: '',
      help: '',
      version: '',
      inputs: null
    }
  });
  // Create a collection of users
  var ToolsList = Backbone.Collection.extend({model: Tool});
  var tools = new ToolsList([]);

  var Input = Backbone.Model.extend({
    defaults: {
      label: '',
      name: '',
      type: '',
      optional: false,
      hidden: false,
      value: '',
      options: [],
    }
  });

  /****************************************************************************************
  * VIEW DECLARATION
  *****************************************************************************************/
  var WorkflowCardView = Backbone.View.extend({
    tagName: 'div',
    events: {
      'click button.runWorkflowButton': 'runWorkflow',
    },
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
      this.$el.html(
        '<div class="col-md-4 workflow-card">' +
        '  <h2>'+ this.model.get('name') + '</h2>' +
        '  <p>' + this.model.get('owner') + '</p>' +
        '  <button type="button" class="btn btn-primary runWorkflowButton"><i class="fa fa-play-o"></i>Run workflow</button>'+
        '</div>'
      );
      return this;
    },
    runWorkflow: function () {
      var me = this;
      //GET THE WORKFLOW DETAILS
      $.ajax({
        type: "GET",
        url: GALAXY_API_WORKFLOWS + this.model.id + "/download",
        dataType: "json",
        success: function (data) {
          //LOAD THE DATA
          var steps = me.model.get("steps");
          steps.length = 0;

          for (var i in data.steps) {
            steps.push(new WorkflowStep(data.steps[i]));
          }
          delete data.steps;

          for (var i in data) {
            me.model.attributes[i]= data[i];
          }

          var view = new WorkflowLauncherView({model: me.model});
          $("#launchWorkflowModalBody").html(view.render().el);
          view.afterRender();

          $("#launchWorkflowModal").modal();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          showErrorMessage("Error while retrieving all the workflows.");
        }
      });
    }
  });

  var WorkflowLauncherView = Backbone.View.extend({
    tagName: 'form',
    events: {
      'click button.launchWorkflowButton': 'launchWorkflow',
    },
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
      var html = '<div>' +
      '  <h2>Running '+ this.model.get('name') + '</h2>' +
      '  <p><b>Author: </b>' + this.model.get('owner') + '</p>' +
      '  <p><b>Description: </b>' + this.model.get('annotation') + '</p>' +
      '  <h3>Steps:</h3>' +
      '  <div id="workflowStepContainer"><i class="fa fa-cog fa-spin fa-2x fa-fw margin-bottom"></i></div>' +
      '</div>';

      this.$el.html(html);
      return this;
    },

    afterRender: function() {
      //GENERATE THE VIEWS FOR THE STEPS
      var steps = this.model.get("steps");
      var views = [];
      for(var i in steps){
        views.push(new WorkflowLauncherStepView({model: steps[i]}).render().el);
      }

      $("#workflowStepContainer i").replaceWith(views);
    },

    launchWorkflow: function () {
      //data = JSON.stringify({"workflow_id": "03501d7626bd192f","history_id": "f597429621d6eb2b", "ds_map": {"0": {"src": "hda", "id": "2d9035b3fc152403"}}})
      //$.ajax({
      //      "type": "POST", contentType: 'application/json; charset=utf-8',
      //      "url": "http://172.20.1.159/galaxydev/api/workflows/03501d7626bd192f/invocations",
      //      "data":data
      //});
      alert("TODO");
    }
  });


  var WorkflowLauncherStepView = Backbone.View.extend({
    tagName: 'div',
    className: "panel panel-default stepBox",
    events: {
      'click .collapseStepTool': 'toggleCollapse',
      'expand div.stepBox panel-body': 'expandBody',
    },
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
      var html = "  <div class='panel-heading'>" +
      "    <b>Step " + this.model.get("id") + ":</b> " + this.model.get("name") +
      "    <a class='collapseStepTool' href='javascript:void(0)'><i class='fa fa-plus-square-o' aria-hidden='true'></i></a>" +
      "  </div>" +
      "  <div class='panel-body collapse empty'><i class='fa fa-cog fa-spin fa-2x fa-fw margin-bottom'></i></div>";

      this.$el.addClass(this.model.get("type"));
      this.$el.html(html);
      return this;
    },
    toggleCollapse: function(){
      var body = this.$el.find("div.panel-body")
      if(body.hasClass("collapse") && body.hasClass("empty")){
        //Check if we need to request the info for the tool
        // if(toolType === "data_input"){
        //   toolId = data_input;
        // }

        application.getToolData(this.model.get("tool_id"), this.fillToolInformation, this)
      }
      body.collapse("toggle")
    },
    fillToolInformation : function(tool, me){
      //FILL THE INFOR FOR THE TOOLS (INPUTS ETC.)
      var body = me.$el.find("div.panel-body")
      if(body.hasClass("empty")){
        body.removeClass("empty");
        var view = new ToolView({model: tool});
        body.html(view.render().el);
      }

      //NOW, SET THE DEFAULT VALUES FOR THE FIELDS BASE ON THE WORKFLOW CONFIGURATION
      var inputValues = JSON.parse(me.model.attributes.tool_state);
      var input;
      for(var i in inputValues){
        input = me.$el.find("div.inputview > [name='" + i +"']");
        if(input.length > 0){
          if(inputValues[i].indexOf("RuntimeValue") !== -1){
            continue;
            //TODO: show here the inputs from input_connections
          }

          if(input.is("input")){
            input.val(inputValues[i].replace(/\"/g,""));
          }else if(input.is("select")){
            me.$el.find("div.inputview option[value='yes']").prop('selected', true);
          }
        }
      }
    }
  });

  var ToolView = Backbone.View.extend({
    tagName: 'div',
    className: "toolview",
    events: {
    },
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
      var html = "  <div'>" +
      "    <p class='toolversion'>" + this.model.get("name") + "version " + this.model.get("version") + "</p>" +
      "    <div class='input-container'></div>"
      "  </div>";

      this.$el.html(html);

      var inputHTML = [];
      var inputs = this.model.get("inputs");
      for (var i in inputs){
        inputHTML.push(new InputView({model: inputs[i]}).render().el);
      }

      this.$el.find("div.input-container").append(inputHTML);

      return this;
    }
  });


  var InputView = Backbone.View.extend({
    tagName: 'div',
    className: "inputview",
    events: {
    },
    initialize: function () {
      this.listenTo(this.model, 'change', this.render);
    },
    render: function () {
      var html = "<label>" + this.model.get("label") + "</label>";
      var type = this.model.get("type");
      var name = this.model.get("name");
      debugger
      if(type === "text"){
        html+= "<input type='text' name='" + name + "'>";
      }else if(type === "select"){
        html+= "<select class='form-control' name=" + name + ">";
        var options= this.model.get("options");
        for(var i in options){
          html+="  <option value='"  + options[i][1] + "' " + (options[i][2]?"selected":"") + " >" + options[i][0] + "</option>" ;
        }
        html+= "</select>";
      }else if(type === "data" || type === "repeat"){
        html+= "<i name='" + name + "'></i>";
      }

      this.$el.html(html);

      this.$el.addClass((this.model.get("hidden")?"hidden":""));

      return this;
    }
  });
  /****************************************************************************************
  *                _____  _____
  *          /\   |  __ \|  __ \
  *         /  \  | |__) | |__) |
  *        / /\ \ |  ___/|  ___/
  *       / ____ \| |    | |
  *      /_/    \_\_|    |_|
  *
  *****************************************************************************************/
  // The main view of the application
  var App = Backbone.View.extend({
    // Base the view on an existing element
    el: $('#main'),
    initialize: function () {
      var me = this;
      me.workflowList = $('#workflowContainer');
      this.updateWorkflowList();
    },
    updateWorkflowList: function () {
      var me = this;
      me.workflowList.empty();
      workflows.reset();

      $.ajax({
        type: "GET",
        url: GALAXY_GET_ALL_WORKFLOWS,
        dataType: "json",
        success: function (data) {
          for (var i in data) {
            workflows.push(new Workflow(data[i]));
          }

          me.listenTo(workflows, 'change', me.render);

          workflows.each(function (workflow) {
            var view = new WorkflowCardView({model: workflow});
            me.workflowList.append(view.render().el);
          }, me);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          showErrorMessage("Error while retrieving all the workflows.");
        }
      });

      return true;
    },
    getToolData: function (toolId, _callback, _scope) {
      var me = this;

      if(toolId === null){
        return false;
      }

      for(var i in tools.models){
        if(tools.models[i].get("id") === toolId){
          return true;
          _callback(tools.models[i], _scope);
        }
      }

      $.ajax({
        type: "GET",
        url: GALAXY_API_TOOLS + toolId + "/build",
        dataType: "json",
        success: function (data) {
          var model = new Tool(data);
          tools.push(model);
          _callback(model, _scope);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          showErrorMessage("Error while retrieving all the workflows.");
        }
      });

      return false;
    }

  });

  application = new App();
});
