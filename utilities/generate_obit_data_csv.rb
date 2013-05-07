require 'json'
require 'pathname'

readdir = ARGV[0]
writedir = ARGV[1]
obitdir = ARGV[2]

topic_rows = []


puts "word,name,count,fem,male"
Dir.glob(File.join(readdir, "*.json")).each do |filename|
  basename = Pathname.new(filename).basename.to_s
  category = basename.to_s.gsub(".json", "")

  data = JSON.load(File.open(filename).read())
  if(!data.nil? and !data[0].nil? and data[0].has_key?("date"))
    men = 0
    women = 0
    data.each{|r| 
      if r["gender"] == "male"
        men += 1
      elsif r["gender"]=="female"
        women += 1
      end
    }
    puts "#{category},#{category},#{women+men}, #{women},#{men}"
  end
end
  
