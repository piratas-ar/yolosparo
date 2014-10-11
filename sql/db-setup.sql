drop table if exists legislatives;

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
  unique(type, full_name)
);

