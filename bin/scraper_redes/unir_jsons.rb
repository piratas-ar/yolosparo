require 'rubygems'
require 'json'
require 'pry'
require 'levenshtein'
require 'fuzzy_match'
require 'active_support/inflector'


#a_base = 'senado.json'
#a_base = 'senado_y_redes.json'
a_base = 'senado_y_historico.json'

#a_agregar = 'senado_redes.json'
#a_agregar = '../../sql/datasets/legisladores-AR.json'
a_agregar = 'senado.json'

field = 'full_name'

bases = JSON.parse(open(a_base).read).uniq{|s| s[field]}
extras = JSON.parse(open(a_agregar).read).uniq{|s| s[field]}

fz = FuzzyMatch.new(extras.collect{|s| ActiveSupport::Inflector.transliterate(s[field]) })

STDERR.puts "Resultados con mas de 90% de confianza no se muestran\n"

salida = []
bases.each do |base|
  found = fz.find_with_score(ActiveSupport::Inflector.transliterate(base[field]))
  if found[1] < 0.75
    STDERR.puts "SKIPIN #{base[field]}"
    salida.push(base)
    next
  end

  if found[1] < 0.9
    STDERR.puts '-----------------------',base[field], found, ""
  end

  extra = extras.select{|s| ActiveSupport::Inflector.transliterate(s[field]) == found.first }.first
  salida.push(extra.merge(base){ |key, old_val, new_val| old_val.nil? ? new_val : old_val } )
end

puts salida.to_json
