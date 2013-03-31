var IntroView = Backbone.View.extend({
  el:"#intro",
  events:{
    "click #intro .next":"next_slide"
  },

  initialize: function(){
    this.slide_template= _.template($("#slide_template").html());
    $(this.el).html(this.slide_template());
    this.load_slides();
  },
 
  load_slides: function(){
    that = this;
    $.getJSON("data/index.json", function(data){
      that.slides = data;
      that.total_slides = _.size(data);
      that.current_slide = -1;
      that.next_slide();
    });
  },

  play_slide: function(n){
    that = this;
    $("#intro .first").html("");
    $("#intro .second").html("");
    $("#intro .third").html("");

    this.text_fade(this.slides[n].first, "first");
    setTimeout(function(){that.text_fade(that.slides[n].second, "second");}, 1500);
    setTimeout(function(){that.text_fade(that.slides[n].third, "third");}, 4000);
/*    var spans= '<span style="opacity:0">' + 
      this.slides[n].first.split('')
      .join('</span><span style="opacity:0">') + '</span>';
    $(spans).appendTo("#intro .first");

    d3.selectAll("#intro .first span").transition()
      .delay(function(d, i){return i*30;})
      .duration(320).style("opacity", 1);*/
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
    if(this.current_slide > this.total_slides){
      d3.select(this.el).transition().duration(800).style("opacity",0).remove();
      //$(this.el).remove();
      this.unbind();
    }
  },

  render: function(){
  }
});

intro_view = new IntroView();
intro_view.render();
