require 'json'
require 'pathname'

readdir = ARGV[0]

obits = []

topic_rows = []

men = 0
women = 0
unknown = 0


Dir.glob(File.join(readdir, "*.json")).each do |filename|
  data = JSON.load(File.open(filename).read())
  if(!data.nil? and !data[0].nil? and data[0].has_key?("date"))
    data.each{|r| 

      id = r["url"].gsub(/.*?res=/,"")
      unless obits.include? id
        obits << id
        if r["gender"] == "male"
          men += 1
        elsif r["gender"]=="female"
          women += 1
        else
          unknown += 1
        end
      end
    }
    print "."
  end
end
  
puts
puts "TOTALS"
puts "men: #{men}"
puts "women: #{women}"
puts "unknown: #{unknown}"
