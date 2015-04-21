require 'rubygems'
require 'active_support/inflector'
require 'capybara'
require 'capybara/dsl'
require 'capybara/poltergeist'
require 'pry'
require 'twitter'
require 'json'

Capybara.default_driver = :poltergeist
Capybara.run_server = false

Capybara.register_driver :poltergeist do |app|
  Capybara::Poltergeist::Driver.new(app, timeout: 180)
end

module Legi
  class WebScraper
    include Capybara::DSL

    def get_page_data(url)
      visit(url)
      doc = Nokogiri::HTML(page.html)
    end

    def get_listado(camara, distrito)
      visit('http://alertas.directoriolegislativo.org/?post_type=legislador&distrito='+distrito)
      select('Senado', from: 'camara')
      find(:css, 'a span#buscartxt').click
      doc = Nokogiri::HTML(page.html)
      doc.css('div.role a').collect { |r| ActiveSupport::Inflector.transliterate(r['href'][20..-3]) }
    end

    def get_senadores
      get_listado('Senado', 'a06G000000EgcuaIAB')
    end

    def get_diputados
      get_listado('Diputados', 'a06G000000EgcuaIAB')
    end

    def get_leg_page(legigato)
      doc = get_page_data('http://alertas.directoriolegislativo.org/?legislador='+legigato)
    end

    def get_twitter(doc)
      twitter_elem = doc.css('ul.data.telephone').select { |t| t.css('li.title i.fa-twitter').length > 0 }.first
      twitter = twitter_elem.css('.tel-number').text.strip unless twitter_elem.nil?
      twitter = twitter[1..-1] if (/@/ =~ twitter) === 0
      twitter
    end

    def twitter_url(twitter)
      'https://twitter.com/' + twitter unless twitter.nil?
    end

    def get_web(doc)
      web_elem = doc.css('ul.data.telephone').select { |t| t.css('li.title i.fa-link').length > 0 }.first
      web = web_elem.css('.tel-number').text.strip unless web_elem.nil?
      smart_add_url_protocol(web) unless web.nil?
    end

    def smart_add_url_protocol(url)
      unless url[/\Ahttp:\/\//] || url[/\Ahttps:\/\//]
        url = "http://#{url}"
      end
      url
    end

    def es_facebook?(url)
      !(/facebook\.com/ =~ url).nil?
    end

    def get_name(doc)
      doc.css('div.name').text.strip
    end

    def get_email(doc)
      doc.css('ul.data.email li.mail a').text.strip
    end

    def get_username(doc)
      get_email(doc).split('@').first
    end

    def get_phone(doc)
      phone_elem = doc.css('ul.data.telephone').select { |t| t.css('li.title i.fa-phone').length > 0 }.first
      phone = phone_elem.css('.tel-number').text.strip unless phone_elem.nil?
      phone
    end

    def extract_fb_user(fb_url)
      if !fb_url.nil?
        fb_url.to_s.split('/').first(4).last
      end
    end

    def get_secretary(doc)
      sec = doc.css('ul.data.secretary li.name-secretary').text.strip
      sec if sec != 'No responde'
    end

    def get_secretary_phone(doc)
      sec_num = doc.css('ul.data.secretary li.sec-number').text.strip
      sec_num if sec_num != 'No responde'
    end

    def get_personal_address(doc)
      address_elem = doc.css('ul.data.secretary').select { |t| t.css('li.title').first.text.strip == 'EN SU DISTRITO' }.first
      address = address_elem.css('li.advisory-number').text.strip unless address_elem.nil?
      address unless address == 'No tiene'
    end
  end

  class TwitterScraper
    def initialize
      @client = Twitter::REST::Client.new do |config|
        config.consumer_key        = ""
        config.consumer_secret     = ""
        config.access_token        = ""
        config.access_token_secret = ""
      end
    end

    def get_twitter_web(twitter)
      begin
        data = @client.user(twitter)
        data.website
      rescue => e
        puts '[err]  ' + twitter.to_s, e
      end
    end
  end
end



s = Legi::WebScraper.new
t = Legi::TwitterScraper.new

senadores = s.get_senadores

i = 0
datos = senadores.collect do |senador|
  i = i+1
  doc = s.get_leg_page(senador)
  twitter = s.get_twitter(doc)
  web = s.get_web(doc)
  if s.es_facebook? web
    facebook = web
  elsif !twitter.nil?
    web = t.get_twitter_web(twitter)
    facebook = web if s.es_facebook? web
  end

  {
    type: 'senador',
    fullName: s.get_name(doc),
    userName: s.get_username(doc),
    friendlyName: nil,
    email: s.get_email(doc),
    pictureUrl: nil,
    district: nil,
    startDate: nil,
    endDate: nil,
    party: nil,
    block: nil,
    phone: s.get_phone(doc),
    address: nil,
    personalPhone: nil,
    personalAddress: s.get_personal_address(doc),
    secretary: s.get_secretary(doc),
    secretaryPhone: s.get_secretary_phone(doc),
    siteUrl: web,
    twitterUrl: s.twitter_url(twitter),
    twitterName: twitter,
    facebookUrl: facebook,
    facebookName: s.extract_fb_user(facebook),
    emailText: nil,
    tweetText: nil
  }
end

puts datos.to_json
