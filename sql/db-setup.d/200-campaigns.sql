insert into campaign_legislatives (campaign_id, legislative_id)
    select (select id from campaigns where name = 'stop-fracking'),
    id from legislatives;
insert into campaign_legislatives (campaign_id, legislative_id)
    select (select id from campaigns where name = 'argentina-digital'),
    id from legislatives;
