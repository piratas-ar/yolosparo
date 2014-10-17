drop table if exists activities;
drop table if exists legislatives;
drop table if exists users;

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
  unique(type, full_name)
);

-- Users
create table if not exists users (
  id bigint not null primary key auto_increment,
  nick_name varchar(50) not null unique,
  secret varchar(255) not null unique,
  full_name varchar(255) null,
  email varchar(255) null unique
);

-- Activity log
create table if not exists activities (
  id bigint not null primary key auto_increment,
  creation_time timestamp not null,
  user_id bigint not null,
  legislative_id bigint not null,
  action varchar(50) not null,
  foreign key (legislative_id) references legislatives(id),
  foreign key (user_id) references users(id),
  unique(user_id, legislative_id, action)
);
