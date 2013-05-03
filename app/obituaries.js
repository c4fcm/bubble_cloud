var ObituaryView = Backbone.View.extend({
  el: "#obituaries",
  events:{
   // handle events
  },

  initialize: function(){
    this.data = [];
    this.obit_name_template = _.template($("#obit_name_template").html())
    this.person_sidebar_template = _.template($("#person_sidebar_template").html())
    this.prev_tooltip = null;
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
    person_index = 0;
    _.each(this.names_by_date.top(Infinity), function(name){
      $("#obituaries").append(that.obit_name_template({name:name, word:router.current_word, person_index:person_index}));
      person_index += 1;
    });
    //$("#obituaries").replaceWith(obit_container);
  },

  load: function(word){
    obj = this;
    if(this.word == word){
      return 
    }
    this.word = word;
    this.show();
    $.getJSON("data/obit_json/" + word + ".json", function(data){
      obj.data = crossfilter(data);
      obj.names_by_relevance = obj.data.dimension(function(d){return d.s});
      obj.names_by_gender = obj.data.dimension(function(d){return d.g});
      obj.names_by_date = obj.data.dimension(function(d){return new Date(d.date)});
      obj.showNames();
      $("#word_selection_heading").html("women's obituaries that include " + word + " terms")
    });
  }
});

var PersonView = Backbone.View.extend({
  el: "#person_view",
  events:{
    "click .modal .close": "close_modal",
    "click .wiki_research_action": 'does_wikipedia_include',
    "click .research_action": "does_publication_include"
  },

  initialize: function(){
    this.person_page_template = _.template($("#person_page_template").html());
    this.does_wikipedia_include_template = _.template($("#does_wikipedia_include").html());
    this.does_publication_include_template = _.template($("#does_publication_include").html());
  },

  close_modal: function(){
    $(".modal").remove();
  },

  does_wikipedia_include: function(){
    $(".modal").remove();
    $(this.el).append(this.does_wikipedia_include_template({title:"Now that you've checked Wikipedia", person:this.current_obituary}));
    $(".modal").fadeIn();
  },

  does_publication_include: function(e){
    $(".modal").remove();
    publication = $(e.target).attr("data-publication");
    $(this.el).append(this.does_publication_include_template({publication: publication, person:this.current_obituary}));
    $(".modal").fadeIn();
  },

  showperson: function(person, word){
    $(this.el).html("");
    var that = this;

    $.getJSON("data/obits/" + word + "/" + person + ".json", function(person){
      $("#person_view").html(that.person_page_template({person:person, word: word}));
      that.current_obituary = person;
      $.scrollTo("#person_entry")
    });
  }
});

var ObituaryRouter = Backbone.Router.extend({
  routes:{
    "": "index",
    ":word/:id":"personview",
    ":word": "wordview"
  },

  index: function(){
    this.current_word = "";
    if(this.check_slideshow()){
      obituary_view.render()
    }
  },
  
  wordview: function(word){
    if(this.check_slideshow()){
      obituary_view.load(word);
      this.current_word = word;
    }
  },

  personview: function(word, person){
    person_view.showperson(person, word);
    this.wordview(word);
  },

  check_slideshow: function(){
    return true; 
  }
});

router = new ObituaryRouter();
obituary_view = new ObituaryView();
person_view = new PersonView();

Backbone.history.start();
