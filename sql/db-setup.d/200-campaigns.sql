insert into campaigns (name) values ('stop-fracking');
insert into campaign_legislatives (campaign_id, legislative_id)
    select (select id from campaigns where name = 'stop-fracking'),
    id from legislatives where region = 'AR';
