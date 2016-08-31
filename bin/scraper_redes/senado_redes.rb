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
  Capybara::Poltergeist::Driver.new(app, timeout: 200, js_errors: false)
end

include Capybara::DSL

def tw_user(url)
  return if url.nil?
  url = url['href']
  url[8..-1].split('/')[1].strip
end

page = visit('http://www.senado.gob.ar/')
senado_doc = Nokogiri::HTML(page.html)
list = senado_doc.css('#carousel-senadores ul.scrollable li.item.sermon').collect do |senador|
      {
            type: 'senador',
            full_name: senador.css('div a')[0]['title'].split('-',2).last.strip,
            user_name: nil,
            email: nil,
            picture_url: 'http://www.senado.gob.ar'+senador.css('div a img')[0]['src'],
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
            twitter_account: tw_user(senador.css('.meta-data a').select{|link| link['href'] =~ /twitter\.com/ }.first),
            facebook_account: tw_user(senador.css('.meta-data a').select{|link| link['href'] =~ /facebook\.com/ }.first),
            region: 'AR'
      }
end
puts list.to_json
