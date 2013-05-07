require 'json'
require 'pathname'

readdir = ARGV[0]
writedir = ARGV[1]
obitdir = ARGV[2]


Dir.glob(File.join(readdir, "*.json")).each do |filename|
  basename = Pathname.new(filename).basename.to_s
  category = basename.to_s.gsub(".json", "")

  puts category

  data = JSON.load(File.open(filename).read())
  if(!data.nil? and !data[0].nil? and data[0].has_key?("date"))
    new_array = data.collect{|r| 

      name = r["name"]
      if(name.match(/^[A-Z]*/)[0].size>1)
        name = name.split(",").collect{|a|a.strip}.reverse.join(" ")
        name = name.split(" ").collect{|a|a.capitalize}.join(" ")
      else
        name2 = name.split(/,|;/)[0]
        name = name2 unless name2.nil? or name2.size==0
        name2 = name.split(/Dies|Is|Dead|of/)[0]
        name = name2 unless name2.nil? or name2.size==0
      end

      id = r["url"].gsub(/.*?res=/,"")

      Dir.mkdir(File.join(obitdir, category)) unless File.exists?(File.join(obitdir, category))
      if(r["gender"]!="male")
        File.open(File.join(obitdir, category, id + ".json"), "w") do |f|
          f.write({:name=>name, :date=>r["date"], :id=>id, :url=>r["url"],
                  :sentences=>r["sentences"], :g=>r["gender"]}.to_json)
        end
      end 

      {:name=>name, :date=>r["date"], :id=>id, 
       :s=>r["sentences"].size, :g=>r["gender"][0]}
    }
    new_array = new_array.reject{|r|r[:g] =="m"}
    File.open(File.join(writedir, basename), "w"){|f|f.write(new_array.to_json)}
  end
end
  
