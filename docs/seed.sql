insert into public.regions (code, name) values
  ('XV', 'Arica y Parinacota'),
  ('I', 'Tarapacá'),
  ('II', 'Antofagasta'),
  ('III', 'Atacama'),
  ('IV', 'Coquimbo'),
  ('V', 'Valparaíso'),
  ('RM', 'Región Metropolitana'),
  ('VI', 'O''Higgins'),
  ('VII', 'Maule'),
  ('XVI', 'Ñuble'),
  ('VIII', 'Biobío'),
  ('IX', 'La Araucanía'),
  ('XIV', 'Los Ríos'),
  ('X', 'Los Lagos'),
  ('XI', 'Aysén'),
  ('XII', 'Magallanes y la Antártica Chilena')
on conflict (code) do nothing;


insert into public.categories (slug, name, description, icon) values
  (
    'planes-de-rescate-y-ambulancia',
    'Planes de rescate y ambulancia',
    'Asesoría y contratación de planes de rescate móvil y ambulancias privadas.',
    '🚑'
  ),
  (
    'planes-y-seguros-de-vida',
    'Planes y seguros de vida',
    'Protección financiera y seguros de vida para personas y familias.',
    '🛡️'
  ),
  (
    'planes-y-seguros-automotrices',
    'Planes y seguros automotrices',
    'Seguros y planes de protección para vehículos particulares y comerciales.',
    '🚗'
  ),
  (
    'planes-de-salud',
    'Planes de salud',
    'Planes de salud privados y seguros complementarios.',
    '🏥'
  ),
  (
    'planes-funerarios',
    'Planes funerarios',
    'Planes de previsión y servicios funerarios.',
    '⚰️'
  )
on conflict (slug) do nothing;

with exec as (
  insert into public.executives (
    name, slug, phone, company,
    description, photo_url, company_logo_url,
    coverage_all, verified, verified_date, status
  ) values (
    'María González',
    'maria-gonzalez-rescate',
    '56911111111',
    'RescatePlus',
    'Ejecutiva especializada en planes de rescate con cobertura nacional.',
    'https://ui-avatars.com/api/?name=Maria+Gonzalez&background=ecfeff&color=155e75&size=200',
    '/logo/partners/rescate.png',
    true,
    false,
    current_date,
    'active'
  )
  returning id
)
insert into public.executive_categories (executive_id, category_id)
select exec.id, c.id
from exec
join public.categories c on c.slug = 'planes-de-rescate-y-ambulancia';

with exec as (
  insert into public.executives (
    name, slug, phone, company,
    description, photo_url, company_logo_url,
    coverage_all, verified, verified_date, status
  ) values (
    'Carolina Fuentes',
    'carolina-fuentes-rescate',
    '56922222222',
    'VidaRescate',
    'Asesoría en planes de rescate para la Región Metropolitana.',
    'https://ui-avatars.com/api/?name=Carolina+Fuentes&background=ecfeff&color=155e75&size=200',
    '/logo/partners/rescate.png',
    false,
    false,
    current_date,
    'active'
  )
  returning id
)
insert into public.executive_categories (executive_id, category_id)
select exec.id, c.id
from exec
join public.categories c on c.slug = 'planes-de-rescate-y-ambulancia';

insert into public.executive_regions (executive_id, region_id)
select e.id, r.id
from public.executives e
join public.regions r on r.code = 'RM'
where e.slug = 'carolina-fuentes-rescate';

with exec as (
  insert into public.executives (
    name, slug, phone, company,
    description, photo_url, company_logo_url,
    coverage_all, verified, verified_date, status
  ) values (
    'Andrea Morales',
    'andrea-morales-rescate',
    '56933333333',
    'SurRescate',
    'Planes de rescate con cobertura en la zona centro-sur.',
    'https://ui-avatars.com/api/?name=Andrea+Morales&background=ecfeff&color=155e75&size=200',
    '/logo/partners/rescate.png',
    false,
    false,
    current_date,
    'active'
  )
  returning id
)
insert into public.executive_categories (executive_id, category_id)
select exec.id, c.id
from exec
join public.categories c on c.slug = 'planes-de-rescate-y-ambulancia';

insert into public.executive_regions (executive_id, region_id)
select e.id, r.id
from public.executives e
join public.regions r on r.code in ('V','VIII')
where e.slug = 'andrea-morales-rescate';

-- Vida
insert into public.executives (
  name, slug, phone, company, description,
  photo_url, company_logo_url,
  coverage_all, verified, verified_date, status
) values (
  'Daniela Rojas',
  'daniela-rojas-vida',
  '56944444444',
  'VidaSegura',
  'Seguros de vida y protección familiar.',
  'https://ui-avatars.com/api/?name=Daniela+Rojas&background=ecfeff&color=155e75&size=200',
  '/logo/partners/vida.png',
  true,
  false,
  current_date,
  'active'
);

insert into public.executive_categories (executive_id, category_id)
select e.id, c.id
from public.executives e
join public.categories c on c.slug = 'planes-y-seguros-de-vida'
where e.slug = 'daniela-rojas-vida';


-- Automotriz
insert into public.executives (
  name, slug, phone, company, description,
  photo_url, company_logo_url,
  coverage_all, verified, verified_date, status
) values (
  'Felipe Contreras',
  'felipe-contreras-auto',
  '56955555555',
  'AutoPlus',
  'Planes y seguros automotrices.',
  'https://ui-avatars.com/api/?name=Felipe+Contreras&background=ecfeff&color=155e75&size=200',
  '/logo/partners/auto.png',
  true,
  false,
  current_date,
  'active'
);

insert into public.executive_categories (executive_id, category_id)
select e.id, c.id
from public.executives e
join public.categories c on c.slug = 'planes-y-seguros-automotrices'
where e.slug = 'felipe-contreras-auto';


-- Salud
insert into public.executives (
  name, slug, phone, company, description,
  photo_url, company_logo_url,
  coverage_all, verified, verified_date, status
) values (
  'Paula Méndez',
  'paula-mendez-salud',
  '56966666666',
  'SaludIntegral',
  'Planes de salud y seguros complementarios.',
  'https://ui-avatars.com/api/?name=Paula+Mendez&background=ecfeff&color=155e75&size=200',
  '/logo/partners/salud.png',
  true,
  false,
  current_date,
  'active'
);

insert into public.executive_categories (executive_id, category_id)
select e.id, c.id
from public.executives e
join public.categories c on c.slug = 'planes-de-salud'
where e.slug = 'paula-mendez-salud';


-- Funerarios
insert into public.executives (
  name, slug, phone, company, description,
  photo_url, company_logo_url,
  coverage_all, verified, verified_date, status
) values (
  'Luis Herrera',
  'luis-herrera-funerario',
  '56977777777',
  'PreverChile',
  'Planes funerarios y previsión familiar.',
  'https://ui-avatars.com/api/?name=Luis+Herrera&background=ecfeff&color=155e75&size=200',
  '/logo/partners/funerario.png',
  true,
  false,
  current_date,
  'active'
);

insert into public.executive_categories (executive_id, category_id)
select e.id, c.id
from public.executives e
join public.categories c on c.slug = 'planes-funerarios'
where e.slug = 'luis-herrera-funerario';