var IntroView = Backbone.View.extend({
  el:"#intro",
  events:{
    "click #intro .next":"next_slide"
  },

  initialize: function(){
    this.slide_template= _.template($("#slide_template").html());
    $(this.el).html(this.slide_template({title:"", text:""}));
    this.load_slides();
  },
 
  load_slides: function(){
    that = this;
    $.getJSON("data/index.json", function(data){
      that.slides = data;
      that.total_slides = _.size(data);
      that.current_slide = 0;
      that.play_slide(0);
    });
  },

  play_slide: function(n){
    var str = this.slides[n].text
    $("#intro .title").html("");
    var spans = '<span style="opacity:0">' + str.split('').join('</span><span style="opacity:0">') + '</span>';
    $(spans).appendTo("#intro .title");
    d3.selectAll("#intro .title span").transition().delay(function(d, i){
      return i*30;
    }).duration(320).style("opacity", 1);
  },

  next_slide: function(){
    this.current_slide += 1;
    if(this.current_slide < this.total_slides){
      this.play_slide(this.current_slide);
    }
  },

  render: function(){
  }
});

intro_view = new IntroView();
intro_view.render();
