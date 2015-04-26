insert into featured_legislatives (campaign_id, legislative_id, tweet_text, email_text,
  friendly_name)
  values ((select id from campaigns where name = 'no-al-fracking'),
  (select id from legislatives where user_name = 'asanmartin'),
  'Hola Adrián. Me gustaría que votes en contra de la Ley de Fracking #yolosparo',
  'Hola Adrián. Me gustaría que votes en contra de la Ley de Fracking',
  'Adrián San Martín');

insert into featured_legislatives (campaign_id, legislative_id, tweet_text, email_text,
  friendly_name)
  values ((select id from campaigns where name = 'no-al-fracking'),
  (select id from legislatives where user_name = 'acomelli'),
  'Hola Alicia. Me gustaría que votes en contra de la Ley de Fracking #yolosparo',
  'Hola Alicia. Me gustaría que votes en contra de la Ley de Fracking',
  'Alicia Comelli');

insert into featured_legislatives (campaign_id, legislative_id, tweet_text, email_text,
  friendly_name)
  values ((select id from campaigns where name = 'no-al-fracking'),
  (select id from legislatives where user_name = 'mvillarm'),
  'Hola Toti. Me gustaría que votes en contra de la Ley de Fracking #yolosparo',
  'Hola Toti. Me gustaría que votes en contra de la Ley de Fracking',
  'Toti Villar');

insert into featured_legislatives (campaign_id, legislative_id, tweet_text, email_text,
  friendly_name)
  values ((select id from campaigns where name = 'no-al-fracking'),
  (select id from legislatives where user_name = 'rpucheta'),
  'Hola Ramona. Si te interesa el futuro de tu gente te pido que votes NO a la nueva ley de hidrocaruburos, muchas gracias #yolosparo',
  'Estimada Ramona: sé que siempre estuviste cerca de las necesidades de la gente, y esta vez te quiero pedir que una vez más te pongas del lado de los que más sufren por las malas decisiones y votes NO a la nueva Ley de Hidrocarburos. Esta ley habilita prácticas muy perjudiciales para la salud y, entre otras cosas malas, desplaza de sus tierras a nuestros hermanos mapuches. Espero contar con tu apoyo para votar en contra de esta ley. Un abrazo.\nP.D.: si querés enterarte qué problemas tiene esta ley, podés entrar a http://www.yolosparo.org para informarte.',
  'Ramona Pucheta');

insert into featured_legislatives (campaign_id, legislative_id, tweet_text, email_text,
  friendly_name)
  values ((select id from campaigns where name = 'no-al-fracking'),
  (select id from legislatives where user_name = 'gfernandezm'),
  'Hola Gustavo. Me gustaría que votes en contra de la Ley de Fracking #yolosparo',
  'Hola Gustavo. Me gustaría que votes en contra de la Ley de Fracking',
  'Fernández Mendía');

insert into featured_legislatives (campaign_id, legislative_id, tweet_text, email_text,
  friendly_name)
  values ((select id from campaigns where name = 'no-al-fracking'),
  (select id from legislatives where user_name = 'malonso'),
  'Hola Luchy. Me gustaría que votes en contra de la Ley de Fracking #yolosparo',
  'Hola Luchy. Me gustaría que votes en contra de la Ley de Fracking',
  'Luz Alonso');
