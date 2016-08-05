#encoding: utf-8
require 'rubygems'
require 'capybara'
require 'pry'
require 'capybara/dsl'
require 'capybara/poltergeist'
require 'json'

Capybara.default_driver = :poltergeist
Capybara.run_server = false

Capybara.register_driver :poltergeist do |app|
  Capybara::Poltergeist::Driver.new(app, timeout: 180, js_errors: false)
end

include Capybara::DSL

page = visit('http://www.diputados.gov.ar/diputados/listadip.html')
senado_doc = Nokogiri::HTML(page.html)
list = senado_doc.css('table#tablesorter tr')[1..-1].collect do |dip|
      {
            type: 'diputado',
            full_name: dip.css('td')[1].text,
            user_name: dip.css('td')[1].css('a').first['href'].split('/').last,
            email: dip.css('td')[1].css('a').first['href'].split('/').last + "@diputados.gob.ar",
            picture_url: dip.css('td')[0].css('img').first['src'],
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