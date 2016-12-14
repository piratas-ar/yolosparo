#encoding: utf-8
require 'rubygems'
require 'capybara'
require 'capybara/dsl'
require 'capybara/poltergeist'
require 'json'
require 'pry'

Capybara.default_driver = :poltergeist
Capybara.run_server = false

Capybara.register_driver :poltergeist do |app|
  Capybara::Poltergeist::Driver.new(app, timeout: 180, js_errors: false)
end

include Capybara::DSL

def tw_user(url)
  return if url.nil? || url.empty?
  url[8..-1].split('/')[1].strip
end

page = visit('http://www.legislatura.gov.ar/legisladores.php')
senado_doc = Nokogiri::HTML(page.html)

list = senado_doc.css('#data-integrantes tr td[2] a').collect{|d| d[:href] }.collect do |legi_url|
  legi_page = visit(legi_url)
  legi_doc = Nokogiri::HTML(legi_page.html)
  redes = legi_doc.css('.cuadrado-bloque .profile-info-row:contains("Redes Sociales") a').collect{|d| d[:href] }
  puts legi_doc.css('#legislador_mail').text.strip.split('@').first
  {
        type: 'legislador',
        full_name: legi_doc.css('#legislador_nombre').text.strip,
        user_name: legi_doc.css('#legislador_mail').text.strip.split('@').first,
        email: legi_doc.css('#legislador_mail').text.strip,
        picture_url: legi_doc.css('#ficha-diputado .img-responsive').first['src'],
        district: nil,
        start_date: nil,
        end_date: nil,
        party: nil,
        block: nil,
        phone: nil,
        address: nil,
        personal_phone: nil,
        personal_address: nil,
        secretary_name: nil,
        secretary_phone: nil,
        site_url: nil,
        twitter_account: tw_user(redes.grep(/twitter/).first),
        facebook_account: tw_user(redes.grep(/facebook/).first),
        region: 'AR-C'
  }
end

puts list.to_json
