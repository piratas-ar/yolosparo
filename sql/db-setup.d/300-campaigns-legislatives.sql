insert into campaign_legislatives (campaign_id, legislative_id)
    select (select id from campaigns where name = 'no-al-fracking'),
    id from legislatives where region = 'AR';
insert into campaign_legislatives (campaign_id, legislative_id)
    select (select id from campaigns where name = 'fumigaciones-bsas'),
    id from legislatives where region = 'AR-B';
