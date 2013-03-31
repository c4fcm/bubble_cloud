var ObituaryView = Backbone.View.extend({
  el: "#obituaries",
  events:{
   // handle events
  },

  initialize: function(){
    this.data = [];
  },

  render: function(){
    var compiledTmpl = _.template($('#tmpl-obit-sentences').html());
    $(this.el).html(compiledTmpl({names: this.data}));
  },

  load: function(word){
    that = this;
    $.getJSON("data/obit_json/" + word + ".json", function(data){
      that.data = data;
      that.render();
    });
  }
});

var ObituaryRouter = Backbone.Router.extend({
  routes:{
    "": "index",
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

  check_slideshow: function(){
    return true; 
  }
});

router = new ObituaryRouter();
obituary_view = new ObituaryView();

Backbone.history.start();
