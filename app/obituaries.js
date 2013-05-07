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
  },

  showCrowdStatus: function(){
    obj = this;
    $.getJSON("/topic/crowd_statuses.json?id="+this.word, function(statuses){
      _.each(statuses, function(obit_status){
        person_view.set_obit_status(obit_status);
      });
    });
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
      obj.showCrowdStatus();
      $("#word_selection_heading").html("women's obituaries that include <em>" + word + "</em> terms")
    });
  }
});

var PersonView = Backbone.View.extend({
  el: "#person_view",
  events:{
    "click .modal .close": "close_modal",
    "click .wiki_research_action": 'does_wikipedia_include',
    "click .research_action": "does_publication_include",
    "click .full_obituary": "share_life_record",
    "click #submit_form": "submit_form"
  },

  initialize: function(){
    this.person_page_template = _.template($("#person_page_template").html());
    this.does_wikipedia_include_template = _.template($("#does_wikipedia_include").html());
    this.does_publication_include_template = _.template($("#does_publication_include").html());
    this.share_life_record_template = _.template($("#share_life_record_template").html());
    this.authenticity_token = null;
  },

  close_modal: function(){
    $(".modal").remove();
  },

  submit_form: function(){
    that = this;
    $.post(document.forms[0].action,
      $(document.forms[0]).serialize(),
      function(obit_status){
        that.set_obit_status(obit_status);
        that.close_modal();
      }
    )
  },

  share_life_record: function(){
    $(".modal").remove();
    $(this.el).append(this.share_life_record_template({meta_fields:this.meta_fields(), current_location:window.location}));
    $(".modal").fadeIn();
    $.getJSON("/survey/nytimes_view.json?obituary_id=" + this.current_obituary.id + "&topic=" + router.current_word, function(obit_status){
      that.set_obit_status(obit_status);
    });
    FB.XFBML.parse(document.getElementById('#like_person'));
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
  },

  meta_fields: function(){
    return {authenticity_token: this.authenticity_token,
            person: this.current_obituary,
            word: router.current_word}
  },

  does_wikipedia_include: function(){
    $(".modal").remove();
    $(this.el).append(this.does_wikipedia_include_template({title:"Now that you've checked Wikipedia", meta_fields: this.meta_fields()}));
    $(".modal").fadeIn();
  },

  does_publication_include: function(e){
    $(".modal").remove();
    publication = $(e.target).attr("data-publication");
    $(this.el).append(this.does_publication_include_template({publication: publication, meta_fields:this.meta_fields()}));
    $(".modal").fadeIn();
  },

  set_obit_status: function(obit_status){
    obit_block = $("#obit_" + obit_status.id + " .block");
    if(obit_status.read){ obit_block.addClass("read"); }
    if(obit_status.nytimes_view){obit_block.addClass("nytimes_view")}
    if(obit_status.wikipedia_includes){obit_block.addClass("wikipedia_includes")}
    if(obit_status.wikipedia_needed){obit_block.addClass("wikipedia_needed")}
  },

  showperson: function(person, word){
    $(this.el).html("");
    var that = this;
   $.getJSON("/survey/get_token.json", function(response){
      that.authenticity_token = response.authenticity_token;

      $.getJSON("data/obits/" + word + "/" + person + ".json", function(person_record){
        that.current_obituary = person_record;
        $("#person_view").html(that.person_page_template({person:person_record, word: word}));
        $.getJSON("/survey/read.json?obituary_id=" + person + "&topic=" + word, function(obit_status){
          that.set_obit_status(obit_status);
        });
        $.scrollTo("#person_entry")
      });
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
    this.current_person = "";
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
    this.current_person = person;
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
