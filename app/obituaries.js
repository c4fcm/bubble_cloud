var ObituaryView = Backbone.View.extend({
  el: "#obituaries",
  events:{
   // handle events
  },

  initialize: function(){
    this.data = [];
    this.obit_name_template = _.template($("#obit_name_template").html())
    this.person_sidebar_template = _.template($("#person_sidebar_template").html())
    this.word_view_sidebar = _.template($("#word_view_sidebar").html());
    this.words_intro_template = _.template($("#words_intro_template").html());
    this.prev_tooltip = null;
  },

  render: function(){
  },

  hide: function(){
    $(this.el).hide();
  },

  show: function(){
    $(this.el).show();
    $(".bs-docs-sidenav li").removeClass("active");
    $("#results_nav").addClass("active");
    $("#instructions").html(obj.word_view_sidebar());
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

  load: function(word, person){
    obj = this;

    $("#results_nav a").attr("href", "/#search/" + word);
    $(".bs-docs-sidenav li").removeClass("active");
    $("#results_nav").addClass("active");
    if(typeof person === "undefined"){
      $.scrollTo("#word_selection_heading", 1000);
      $("#instructions").html(obj.word_view_sidebar());
    }

    if(this.word == word){
      return;
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
      if(obj.terms == null){
        $.getJSON("data/terms.json", function(terms){
          obj.terms = terms;
          $("#word_selection_heading").html(obj.words_intro_template({word:word, terms:terms[word].join(", ")}));
        });
      }else{
        $("#word_selection_heading").html(obj.words_intro_template({word:word, terms:obj.terms[word].join(", ")}));
      }
      $.scrollTo("#word_selection_heading", 1000)
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
    this.person_view_sidebar = _.template($("#person_view_sidebar").html());
    this.authenticity_token = null;
    this.current_obituary = null;
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

  hide: function(){
    this.current_obituary = null;
    $(this.el).hide();
  },

  show: function(){
    $(this.el).show();
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
    if(this.current_obituary!= null && this.current_obituary.id == person){
      $("#instructions").html(this.person_view_sidebar());
      $.scrollTo("#person_entry", 1000);
      return;
    }
    $(this.el).html("");
    var that = this;
    $("#person_nav a").attr("href", "/#search/" + word + "/" + person);
    $.getJSON("/survey/get_token.json", function(response){
      that.authenticity_token = response.authenticity_token;

      $.getJSON("data/obits/" + word + "/" + person + ".json", function(person_record){
        that.current_obituary = person_record;
        new_sentences = [];
        _.each(person_record.sentences, function(sentence){
          var tmp_sentence = sentence;
          _.each(obituary_view.terms[obituary_view.word], function(term){
            tmp_sentence = tmp_sentence.replace(term, "<span class='highlight'>" + term + "</span>")
          });
          new_sentences.push(tmp_sentence)
        });
        that.current_obituary.sentences = new_sentences
       
        $("#person_view").html(that.person_page_template({person:person_record, word: word}));
        that.show();
        $.getJSON("/survey/read.json?obituary_id=" + person + "&topic=" + word, function(obit_status){
          that.set_obit_status(obit_status);
        });
        $("#instructions").html(that.person_view_sidebar());
        $.scrollTo("#person_entry", 1000)
      });
    });
  }
});

var ObituaryRouter = Backbone.Router.extend({
  routes:{
    "": "index",
    "thetop": "top",
    "about": "about",
    "search/:word/:id":"personview",
    "search/:word": "wordview"
  },
  initialize: function(){
    this.slideshow = false;
  },

  top: function(){
    this.check_slideshow();
    $.scrollTo("#vis", 1000);
    $(".bs-docs-sidenav li").removeClass("active");
    $("#vis_nav").addClass("active");
  },

  results: function(){
    this.check_slideshow();
    $.scrollTo("#word_selection_heading", 1000);
    $(".bs-docs-sidenav li").removeClass("active");
    $("#results_nav").addClass("active");
  },

  about: function(){
    this.check_slideshow();
    $(".bs-docs-sidenav li").removeClass("active");
    $("#about_nav").addClass("active");
    $.scrollTo("#about_passing_on", 1000);
  },

  index: function(){
    this.current_word = "";
    this.current_person = "";
    intro_view.render();
    obituary_view.render();
    this.slideshow = true;
  },
  
  wordview: function(word, person){
    this.check_slideshow();
    obituary_view.load(word, person);
    this.current_word = word;
  },

  personview: function(word, person){
    this.check_slideshow();
    this.wordview(word, true);
    this.current_person = person;
    person_view.showperson(person, word);
    $(".bs-docs-sidenav li").removeClass("active");
    $("#person_nav").addClass("active");
  },

  check_slideshow: function(){
    if(this.slideshow == false){
      bubble_view.render();
    }
    $("#intro").hide();
    this.slideshow = true;
    return this.slideshow;
  }
});

router = new ObituaryRouter();
obituary_view = new ObituaryView();
person_view = new PersonView();

Backbone.history.start();
