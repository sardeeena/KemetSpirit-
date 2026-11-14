UPDATE public.crm_tags
SET description = 'Traveled more than once with KemetSpirit'
WHERE name = 'repeat_customer'
  AND description = 'Traveled more than once with Red Sea Excursions';
