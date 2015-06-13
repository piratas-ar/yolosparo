#encoding: utf-8
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
  Capybara::Poltergeist::Driver.new(app, timeout: 180, js_errors: false)
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

    def get_senado_list
      doc = get_page_data('http://www.senado.gob.ar/senadores/listados/listaSenadoRes')
    end

    def get_senado_row(senado_doc, name)
      fila = senado_doc.css('table tr').select do |row|
        name.split.select do |piece|
          piece.length > 2 && (row.text.include?(piece) || row.text.include?(ActiveSupport::Inflector.transliterate(piece)))
        end.length >= 2
      end
      fila.first
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

    def get_email(senado_row)
      senado_row.css('td').first(6).last.css('a').text
    end

    def get_username(senado_row)
      get_email(senado_row).split('@').first
    end

    def get_pic_url(senado_row)
      senado_row.css('td').first.css('img').first['src']
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
      address = address_elem.css('li.advisory-number').first.text.strip unless address_elem.nil?
      address unless address == 'No tiene'
    end

    def get_personal_phone(doc)
      address_elem = doc.css('ul.data.secretary').select { |t| t.css('li.title').first.text.strip == 'EN SU DISTRITO' }.first
      address = address_elem.css('li.advisory-number').last.text.strip unless address_elem.nil? or address_elem.css('li.advisory-number').length < 2
      address unless address == 'No tiene'
    end
  end

  class TwitterScraper
    def initialize
      @client = Twitter::REST::Client.new do |config|
        config.consumer_key        = "a7z4BX5VHsG96IlDc2gDIlLDK"
        config.consumer_secret     = "LDJG3PhWqcH7RCxpDqpvYfp0i7j1YARA5p9D6d2MWnA0BcdV2E"
        config.access_token        = "60947633-xc7xgt1AOKpw6XacSHblJFIsBrjEUchPNxnd5Mq58"
        config.access_token_secret = "BrooY1KfPLwCGIkvzlcJHES"
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

    def get_urls_from_profile(twitter)
      require 'uri'
      begin
        data = @client.user(twitter)
        urls = URI.extract(data.description)
        if urls.nil?
          []
        else
          urls
        end
      rescue => e
        puts '[err]  ' + twitter.to_s, e
        []
      end     
    end
  end
end



s = Legi::WebScraper.new
t = Legi::TwitterScraper.new

senadores = s.get_senadores
senado_doc = s.get_senado_list
i = 0
datos = senadores.collect do |senador|
  i = i+1
  doc = s.get_leg_page(senador)
  name = s.get_name(doc)
  next if name.empty?
  senado_row = s.get_senado_row(senado_doc, name)
  next if senado_row.nil?
  twitter = s.get_twitter(doc)
  facebook = nil
  web = nil
  urls = []
  urls.push s.get_web(doc)
  urls.push t.get_twitter_web(twitter) unless twitter.nil?
  urls |= t.get_urls_from_profile(twitter) unless twitter.nil?
  urls.each do |u|
    if s.es_facebook?(u) && facebook.nil?
      facebook = u
    elsif web.nil?
      web = u
    end
  end

  {
    type: 'senador',
    full_name: name,
    user_name: s.get_username(senado_row),
    email: s.get_email(senado_row),
    picture_url: s.get_pic_url(senado_row),
    district: nil,
    start_date: nil,
    end_date: nil,
    party: nil,
    block: nil,
    phone: s.get_phone(doc),
    address: nil,
    personal_phone: s.get_personal_phone(doc),
    personal_address: s.get_personal_address(doc),
    secretary_name: s.get_secretary(doc),
    secretary_phone: s.get_secretary_phone(doc),
    site_url: web,
    twitter_account: twitter,
    facebook_account: s.extract_fb_user(facebook),
    region: 'AR'
  }
end

puts datos.to_json
