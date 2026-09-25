export const STAGES = Object.freeze([
  'language',
  'server_languages',
  'age',
  'orientation',
  'gender',
  'role',
  'devices',
  'keys',
  'kinks',
  'summary'
]);

export const OPTIONS = Object.freeze({
  language: ['fr', 'nl', 'en'],
  server_languages: ['fr', 'nl', 'en'],
  age: ['under18', '18-20', '21-30', '31-40', '41-50', '51-60', '61+'],
  orientation: ['gay', 'bisexual', 'heterosexual', 'pansexual', 'lesbian', 'asexual', 'other'],
  gender: ['cis_man', 'cis_woman', 'trans_man', 'trans_woman', 'nonbinary', 'genderfluid', 'agender', 'other'],
  role: ['keyholder', 'locked', 'switch', 'curious'],
  devices: ['flat_cage', 'inverted_cage', 'mini_cage', 'plastic_cage', 'metal_cage', 'silicone_cage', 'chastity_belt', 'none_yet', 'other'],
  keys: ['holds_keys', 'other_holds_my_keys', 'keeps_own_keys', 'no_key_management', 'not_applicable'],
  kinks: ['dom', 'sub', 'switch', 'puppy', 'furry', 'leather', 'rubber', 'sportswear', 'sneakers', 'mx_biker', 'abdl', 'chastity', 'other']
});

export function nextStage(stage) {
  const index = STAGES.indexOf(stage);
  if (index < 0 || index === STAGES.length - 1) return null;
  return STAGES[index + 1];
}

export function isValidChoice(stage, value) {
  return OPTIONS[stage]?.includes(value) ?? false;
}

export function isValidMultiChoice(stage, values) {
  return Array.isArray(values) && values.length > 0 && values.every((value) => isValidChoice(stage, value));
}
