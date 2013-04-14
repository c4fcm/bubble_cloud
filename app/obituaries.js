var ObituaryView = Backbone.View.extend({
  el: "#obituaries",
  events:{
   "click .obit_entry":"showObituary"
   // handle events
  },

  initialize: function(){
    this.data = [];
    this.obit_name_template = _.template($("#obit_name").html())
    this.obit_record_template = _.template($("#obit_record").html())
  },

  render: function(){
    console.log(1);
  },

  hide: function(){
    $(this.el).hide();
  },

  show: function(){
    $(this.el).show();
  },

  showNames: function(){
    console.log(1);
    that = this;
    this.names_by_gender.filter("f");
    $("#obituaries").html("");

    _.each(this.names_by_date.top(Infinity), function(name){
      $("#obituaries").append(that.obit_name_template({name:name}));
    });
    //$("#obituaries").replaceWith(obit_container);
  },

  showObituary: function(e){
    that = this;
    outer_div = $(e.target);
    obit_id = outer_div.attr("data-obit-id");
    // reset current item

    if(_.isUndefined(obit_id)){
      outer_div = $(e.target).parent(".obit_entry");
      obit_id = outer_div.attr("data-obit-id");
    }

 
    $.getJSON("data/obits/" + this.word + "/" + obit_id + ".json", function(data){
      $("#obituaries .selected .obit_info").html("");
      $("#obituaries .obit_entry").show();
      outer_div.find(".obit_entry").hide();
      outer_div.addClass("selected");
      that.current_obituary = data;
      outer_div.html(that.obit_record_template({obit:data}));
    });
  },

  load: function(word){
    obj = this;
    this.word = word;
    this.show();
    $.getJSON("data/obit_json/" + word + ".json", function(data){
      obj.data = crossfilter(data);
      obj.names_by_relevance = obj.data.dimension(function(d){return d.s});
      obj.names_by_gender = obj.data.dimension(function(d){return d.g});
      obj.names_by_date = obj.data.dimension(function(d){return new Date(d.date)});
      obj.showNames();
    });
  }
});

var PersonView = Backbone.View.extend({
  el: "#person_view",
  events:{
  },

  initialize: function(){
    this.person_page_template = _.template($("#person_page_template").html());
  },

  showperson: function(person){
    $(this.el).html("");
    obituary_view.hide();
    $("#person_view").html(this.person_page_template({person:obituary_view.current_obituary}));
//http://en.wikipedia.org/wiki/Special:Search?search=sandra+dee
  }
});

var ObituaryRouter = Backbone.Router.extend({
  routes:{
    "": "index",
    "person/:id":"personview",
    ":word": "wordview"
  },

  index: function(){
    if(this.check_slideshow()){
      obituary_view.render()
    }
  },
  
  wordview: function(word){
    if(this.check_slideshow()){
      obituary_view.load(word);
    }
  },

  personview: function(person){
    person_view.showperson(person);
  },

  check_slideshow: function(){
    return true; 
  }
});

router = new ObituaryRouter();
obituary_view = new ObituaryView();
person_view = new PersonView();

Backbone.history.start();
