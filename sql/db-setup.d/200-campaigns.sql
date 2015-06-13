insert into campaigns (name) values ('common');
insert into campaigns (name) values ('rios-libres');
insert into campaigns (name) values ('no-al-fracking');
insert into campaign_legislatives (campaign_id, legislative_id)
    select (select id from campaigns where name = 'no-al-fracking'),
    id from legislatives where region = 'AR';
insert into campaign_legislatives (campaign_id, legislative_id)
    select (select id from campaigns where name = 'rios-libres'),
    id from legislatives where region = 'AR';
