require 'json'
require 'pathname'

readdir = ARGV[0]
writedir = ARGV[1]


Dir.glob(File.join(readdir, "*.json")).each do |filename|
  basename = Pathname.new(filename).basename
  puts basename
  data = JSON.load(File.open(filename).read())
  if(!data.nil? and !data[0].nil? and data[0].has_key?("date"))
    new_array = data.collect{|r| 
      name = r["name"]
      if(name.match(/^[A-Z]*/)[0].size>0)
        name = name.split(",").collect{|a|a.strip}.reverse.join(" ")
        name = name.split(" ").collect{|a|a.capitalize}.join(" ")
      end
      {:name=>name, :date=>r["date"], :id=>r["url"].gsub(/.*?res=/,"")}
    }
    File.open(File.join(writedir, basename), "w"){|f|f.write(new_array.to_json)}
  end
end
  
