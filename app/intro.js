var IntroView = Backbone.View.extend({
  el:"#intro",
  events:{
    "click #intro .next":"next_slide"
  },

  initialize: function(){
    this.slide_template= _.template($("#slide_template").html());
    $(this.el).html(this.slide_template());
    this.timeouts = []
    this.load_slides();
  },
 
  load_slides: function(){
   // shortcut shim to prevent slides from showing
   /*$("#intro").remove();
   bubble_view.render();
    return true;*/

    that = this;
    $.getJSON("data/index.json", function(data){
      that.slides = data;
      that.total_slides = _.size(data);
      that.current_slide = -1;
      that.next_slide();
    });
  },

  play_slide: function(n){
    _.each(this.timeouts, function(t){
      window.clearInterval(t);
    });

    that = this;
    $("#intro .first").html("");
    $("#intro .second").html("");
    $("#intro .third").html("");

    first = this.slides[n].first
    second = that.slides[n].second
    third = that.slides[n].third
    
    this.text_fade(first, "first");
    this.timeouts.push(setTimeout(function(){that.text_fade(second, "second");}, first.length*30 + 420));
    this.timeouts.push(setTimeout(function(){that.text_fade(third, "third");},  (first.length + second.length) * 30 + 840));
  },

  text_fade: function(text, name){
    var spans= '<span style="opacity:0">' + 
      text.split('').join('</span><span style="opacity:0">') + '</span>';
    $(spans).appendTo("#intro ."+name);

    d3.selectAll("#intro ." + name + " span").transition()
      .delay(function(d, i){return i*30;})
      .duration(320).style("opacity", 1);
  },

  next_slide: function(e){
    if(typeof(e)==='undefined'){}else{
      e.stopPropagation();
    }
    this.current_slide += 1;
    if(this.current_slide < this.total_slides){
      this.play_slide(this.current_slide);
    }
    if(this.current_slide >= this.total_slides){
      d3.select(this.el).transition().duration(800).style("opacity",0).remove();
      //$(this.el).remove();
      bubble_view.render();
      this.unbind();
    }
  },

  render: function(){
    $("#intro").show();
  }
});

intro_view = new IntroView();
