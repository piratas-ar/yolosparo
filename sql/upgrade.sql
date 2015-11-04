alter table legislatives drop index type;
alter table legislatives add constraint type unique (type, email);

-- Campaign to scope legislatives and actions.
create table if not exists campaigns(
  id bigint not null primary key auto_increment,
  name varchar(255) not null unique
);

insert into campaigns (name) values ('common');
insert into campaigns (name) values ('no-al-fracking');
insert into campaigns (name) values ('fumigaciones-bsas');

-- Active legislatives in a campaign.
create table if not exists campaign_legislatives(
  campaign_id bigint not null,
  legislative_id bigint not null,
  foreign key (campaign_id) references campaigns(id),
  foreign key (legislative_id) references legislatives(id)
);

insert into campaign_legislatives (campaign_id, legislative_id)
    select (select id from campaigns where name = 'no-al-fracking'),
    id from legislatives where region = 'AR';
insert into campaign_legislatives (campaign_id, legislative_id)
    select (select id from campaigns where name = 'fumigaciones-bsas'),
    id from legislatives where region = 'AR-B';

alter table activities drop index user_id;
alter table activities add column campaign_id bigint not null;
alter table activities add foreign key (campaign_id) references campaigns(id);
alter table activities add constraint activity_id unique
  (campaign_id, user_id, legislative_id, action);

alter table users add column campaign_id bigint not null;
alter table users add foreign key (campaign_id) references campaigns(id);

alter table featured_legislatives
  add column campaign_id bigint not null;
alter table featured_legislatives
  add foreign key (campaign_id) references campaigns(id);

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
