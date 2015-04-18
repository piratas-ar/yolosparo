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
      web
    end

    def es_facebook?(url)
      !(/facebook\.com/ =~ url).nil?
    end
  end

  class TwitterScraper
    def initialize
      @client = Twitter::REST::Client.new do |config|
        config.consumer_key        = "1PxsxGlTeM39UWi5xmLQ6dSLx"
        config.consumer_secret     = "tpLuwBs3Ltve0Ma1GJwirWGiqWbFKcyw7sMn6TV2VSwdK7zCjX"
        config.access_token        = "60947633-vKhuGXBrCBdPRnTTFwVTJpFAEQdFIGShTpaxiywd4"
        config.access_token_secret = "LbH2kwZpGJqijNvzRVZbepYhq9mi6Khd1o5q9oqOcoQTr"
      end
    end

    def get_twitter_web(twitter)
      begin
        data = @client.user(twitter)
        data.website
      rescue
        puts 'err' + twitter.to_s
      end
    end
  end
end



s = Legi::WebScraper.new
t = Legi::TwitterScraper.new

senadores = s.get_senadores

datos = senadores.collect do |senador|
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
    fullName: nil,
    userName: nil,
    friendlyName: nil,
    email: nil,
    pictureUrl: nil,
    district: nil,
    startDate: nil,
    endDate: nil,
    party: nil,
    block: nil,
    phone: nil,
    address: nil,
    personalPhone: nil,
    personalAddress: nil,
    secretary: nil,
    secretaryPhone: nil,
    siteUrl: web,
    twitterUrl: s.twitter_url(twitter),
    twitterName: twitter,
    facebookUrl: facebook,
    facebookName: facebook,
    emailText: nil,
    tweetText: nil
  }
end

puts datos.to_json
