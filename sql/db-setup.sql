SET FOREIGN_KEY_CHECKS=0;

drop table if exists featured_legislatives;
drop table if exists campaign_legislatives;
drop table if exists activities;
drop table if exists legislatives;
drop table if exists users;
drop table if exists campaigns;

-- Campaign to scope legislatives and actions.
create table if not exists campaigns(
  id bigint not null primary key auto_increment,
  name varchar(255) not null unique,
  enabled bit not null default true
);

-- People
create table if not exists legislatives (
  id bigint not null primary key auto_increment,
  type varchar(15) not null,
  full_name varchar(255) not null,
  user_name varchar(255) not null,
  email varchar(255) not null,
  picture_url varchar(1000) not null,
  district varchar(255) not null,
  start_date timestamp not null,
  end_date timestamp not null,
  party varchar(255) not null,
  block varchar(255) null,
  phone varchar(50) null,
  address varchar(255) null,
  personal_phone varchar(50) null,
  personal_address varchar(255) null,
  secretary_name varchar(255) null,
  secretary_phone varchar(50) null,
  site_url varchar(2000) null,
  twitter_account varchar(255) null,
  facebook_account varchar(255) null,
  region varchar(255) not null,
  unique(type, email)
);

-- Active legislatives in a campaign.
create table if not exists campaign_legislatives(
  campaign_id bigint not null,
  legislative_id bigint not null,
  foreign key (campaign_id) references campaigns(id),
  foreign key (legislative_id) references legislatives(id)
);

-- Users
create table if not exists users (
  id bigint not null primary key auto_increment,
  campaign_id bigint not null,
  nick_name varchar(50) not null,
  secret varchar(255) not null unique,
  full_name varchar(255) null,
  email varchar(255) null,
  foreign key (campaign_id) references campaigns(id),
  unique (campaign_id, nick_name)
);

-- Activity log
create table if not exists activities (
  id bigint not null primary key auto_increment,
  creation_time timestamp not null,
  campaign_id bigint not null,
  user_id bigint not null,
  legislative_id bigint not null,
  action varchar(50) not null,
  foreign key (campaign_id) references campaigns(id),
  foreign key (legislative_id) references legislatives(id),
  foreign key (user_id) references users(id),
  unique(campaign_id, user_id, legislative_id, action)
);

-- Featured legislatives.
create table if not exists featured_legislatives (
  id bigint(20) not null primary key auto_increment,
  campaign_id bigint not null,
  legislative_id bigint not null,
  tweet_text varchar(250) not null,
  email_text varchar(1000) not null,
  friendly_name varchar(250) not null,
  foreign key (campaign_id) references campaigns(id),
  foreign key (legislative_id) references legislatives(id),
  unique(campaign_id, legislative_id)
);

-- Adhesiones
create table if not exists support (
  id bigint not null primary key auto_increment,
  creation_time timestamp not null,
  campaign_id bigint not null,
  nombre varchar(255) null,
  email varchar(255) null,
  logo varchar(255) null,
  sitio varchar(255) null,
  adhesion varchar(255) null,
  mensaje text null,
  foreign key (campaign_id) references campaigns(id)
);

SET FOREIGN_KEY_CHECKS=1;
