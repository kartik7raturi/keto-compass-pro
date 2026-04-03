INSERT INTO public.button_links (button_key, label, url) VALUES
  ('thankyou_basic_vip_upgrade', 'Thank You Basic — VIP Upgrade Button', '/vip-upgrade'),
  ('thankyou_basic_dashboard', 'Thank You Basic — Go to Dashboard', '/progress'),
  ('thankyou_vip_supplement', 'Thank You VIP — Buy Supplement Button', '/shop'),
  ('thankyou_vip_dashboard', 'Thank You VIP — Go to Dashboard', '/progress'),
  ('shop_1_bottle', 'Shop — 1 Bottle Buy Button', 'https://www.digistore24.com/product/681168'),
  ('shop_3_bottles', 'Shop — 3 Bottles Buy Button', 'https://www.digistore24.com/product/681168'),
  ('shop_6_bottles', 'Shop — 6 Bottles Buy Button', 'https://www.digistore24.com/product/681168')
ON CONFLICT (button_key) DO NOTHING;