#encoding: utf-8
require 'rubygems'
require 'capybara'
require 'capybara/dsl'
require 'capybara/poltergeist'
require 'json'

Capybara.default_driver = :poltergeist
Capybara.run_server = false

Capybara.register_driver :poltergeist do |app|
  Capybara::Poltergeist::Driver.new(app, timeout: 180, js_errors: false)
end

include Capybara::DSL

page = visit('http://www.senado.gob.ar/senadores/listados/listaSenadoRes')
senado_doc = Nokogiri::HTML(page.html)
list = senado_doc.css('table tr')[1..-1].collect do |senador|
      {
            type: 'senador',
            full_name: senador.css('td')[1].text.gsub(/[\t\n]+/,'').strip,
            user_name: senador.css('td')[5].css('a').text.strip.split('@').first,
            email: senador.css('td')[5].css('a').text.strip,
            picture_url: 'http://www.senado.gob.ar'+senador.css('td').first.css('img').first['src'],
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
            twitter_account: nil,
            facebook_account: nil,
            region: 'AR'
      }
end
puts list.to_json
