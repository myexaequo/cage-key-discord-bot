// Mapping des réponses du questionnaire vers les rôles Discord visibles.
// Les libellés identiques entre plusieurs langues partagent automatiquement le même rôle.
// Les réponses "Autre" sont différenciées par catégorie pour éviter les ambiguïtés.

export const PROFILE_ROLE_NAMES = Object.freeze({
  fr: {
    age: {
      '18-20': '18–20 ans',
      '21-30': '21–30 ans',
      '31-40': '31–40 ans',
      '41-50': '41–50 ans',
      '51-60': '51–60 ans',
      '61+': '61 ans et +'
    },
    orientation: {
      gay: 'Gay',
      bisexual: 'Bisexuel·le',
      heterosexual: 'Hétérosexuel·le',
      pansexual: 'Pansexuel·le',
      lesbian: 'Lesbienne',
      asexual: 'Asexuel·le',
      other: 'Autre orientation'
    },
    gender: {
      cis_man: 'Homme cis',
      cis_woman: 'Femme cis',
      trans_man: 'Homme trans',
      trans_woman: 'Femme trans',
      nonbinary: 'Non-binaire',
      genderfluid: 'Genre fluide',
      agender: 'Agenré·e',
      other: 'Autre genre'
    },
    role: {
      keyholder: 'Keyholder',
      locked: 'Locked',
      switch: 'Switch',
      curious: 'Curieux·se / pas encore défini'
    },
    devices: {
      flat_cage: 'Cage plate',
      inverted_cage: 'Cage inversée',
      mini_cage: 'Mini cage',
      plastic_cage: 'Cage en plastique',
      metal_cage: 'Cage en métal',
      silicone_cage: 'Cage en silicone',
      chastity_belt: 'Ceinture de chasteté',
      none_yet: 'Je n’en utilise pas encore',
      other: 'Autre dispositif'
    },
    keys: {
      holds_keys: 'Je détiens les clés d’une ou plusieurs personnes',
      other_holds_my_keys: 'Quelqu’un d’autre détient mes clés',
      keeps_own_keys: 'Je garde mes propres clés',
      no_key_management: 'Pas de gestion particulière des clés',
      not_applicable: 'Non applicable / pas encore'
    },
    kinks: {
      dom: 'Dom',
      sub: 'Sub',
      switch: 'Switch',
      puppy: 'Puppy',
      furry: 'Furry',
      leather: 'Leather',
      rubber: 'Rubber',
      sportswear: 'Sportswear',
      sneakers: 'Sneakers',
      mx_biker: 'MX / Biker',
      abdl: 'ABDL',
      chastity: 'Chasteté',
      other: 'Autre kink'
    }
  },
  nl: {
    age: {
      '18-20': '18–20 jaar',
      '21-30': '21–30 jaar',
      '31-40': '31–40 jaar',
      '41-50': '41–50 jaar',
      '51-60': '51–60 jaar',
      '61+': '61 jaar en ouder'
    },
    orientation: {
      gay: 'Gay',
      bisexual: 'Biseksueel',
      heterosexual: 'Heteroseksueel',
      pansexual: 'Panseksueel',
      lesbian: 'Lesbisch',
      asexual: 'Aseksueel',
      other: 'Andere oriëntatie'
    },
    gender: {
      cis_man: 'Cis man',
      cis_woman: 'Cis vrouw',
      trans_man: 'Trans man',
      trans_woman: 'Trans vrouw',
      nonbinary: 'Non-binair',
      genderfluid: 'Genderfluïde',
      agender: 'Agender',
      other: 'Ander gender'
    },
    role: {
      keyholder: 'Keyholder',
      locked: 'Locked',
      switch: 'Switch',
      curious: 'Nieuwsgierig / nog niet bepaald'
    },
    devices: {
      flat_cage: 'Platte kooi',
      inverted_cage: 'Omgekeerde kooi',
      mini_cage: 'Mini-kooi',
      plastic_cage: 'Plastic kooi',
      metal_cage: 'Metalen kooi',
      silicone_cage: 'Siliconen kooi',
      chastity_belt: 'Kuisheidsgordel',
      none_yet: 'Ik gebruik er nog geen',
      other: 'Ander apparaat'
    },
    keys: {
      holds_keys: 'Ik heb de sleutels van één of meerdere personen',
      other_holds_my_keys: 'Iemand anders heeft mijn sleutels',
      keeps_own_keys: 'Ik houd mijn eigen sleutels',
      no_key_management: 'Geen specifieke sleutelregeling',
      not_applicable: 'Niet van toepassing / nog niet'
    },
    kinks: {
      dom: 'Dom',
      sub: 'Sub',
      switch: 'Switch',
      puppy: 'Puppy',
      furry: 'Furry',
      leather: 'Leather',
      rubber: 'Rubber',
      sportswear: 'Sportswear',
      sneakers: 'Sneakers',
      mx_biker: 'MX / Biker',
      abdl: 'ABDL',
      chastity: 'Kuisheid',
      other: 'Andere kink'
    }
  },
  en: {
    age: {
      '18-20': '18–20',
      '21-30': '21–30',
      '31-40': '31–40',
      '41-50': '41–50',
      '51-60': '51–60',
      '61+': '61+'
    },
    orientation: {
      gay: 'Gay',
      bisexual: 'Bisexual',
      heterosexual: 'Heterosexual',
      pansexual: 'Pansexual',
      lesbian: 'Lesbian',
      asexual: 'Asexual',
      other: 'Other orientation'
    },
    gender: {
      cis_man: 'Cis man',
      cis_woman: 'Cis woman',
      trans_man: 'Trans man',
      trans_woman: 'Trans woman',
      nonbinary: 'Non-binary',
      genderfluid: 'Genderfluid',
      agender: 'Agender',
      other: 'Other gender'
    },
    role: {
      keyholder: 'Keyholder',
      locked: 'Locked',
      switch: 'Switch',
      curious: 'Curious / not defined yet'
    },
    devices: {
      flat_cage: 'Flat cage',
      inverted_cage: 'Inverted cage',
      mini_cage: 'Mini cage',
      plastic_cage: 'Plastic cage',
      metal_cage: 'Metal cage',
      silicone_cage: 'Silicone cage',
      chastity_belt: 'Chastity belt',
      none_yet: 'I don’t use one yet',
      other: 'Other device'
    },
    keys: {
      holds_keys: 'I hold one or more people’s keys',
      other_holds_my_keys: 'Someone else holds my keys',
      keeps_own_keys: 'I keep my own keys',
      no_key_management: 'No particular key management',
      not_applicable: 'Not applicable / not yet'
    },
    kinks: {
      dom: 'Dom',
      sub: 'Sub',
      switch: 'Switch',
      puppy: 'Puppy',
      furry: 'Furry',
      leather: 'Leather',
      rubber: 'Rubber',
      sportswear: 'Sportswear',
      sneakers: 'Sneakers',
      mx_biker: 'MX / Biker',
      abdl: 'ABDL',
      chastity: 'Chastity',
      other: 'Other kink'
    }
  }
});

export function allProfileRoleNames() {
  return [...new Set(
    Object.values(PROFILE_ROLE_NAMES)
      .flatMap((lang) => Object.values(lang))
      .flatMap((group) => Object.values(group))
  )];
}

export function roleNamesForApplication(application) {
  const lang = application.language ?? 'fr';
  const map = PROFILE_ROLE_NAMES[lang] ?? PROFILE_ROLE_NAMES.fr;
  const d = application.data ?? {};
  const names = [];

  const addOne = (group, code) => {
    const name = map[group]?.[code];
    if (name) names.push(name);
  };
  const addMany = (group, values) => {
    for (const code of values ?? []) addOne(group, code);
  };

  addOne('age', d.age);
  addOne('orientation', d.orientation);
  addOne('gender', d.gender);
  addOne('role', d.role);
  addMany('devices', d.devices);
  addMany('keys', d.keys);
  addMany('kinks', d.kinks);

  return [...new Set(names)];
}


export function roleNamesForProfile(profile) {
  return roleNamesForApplication({
    language: profile.language,
    data: {
      age: profile.age_band,
      orientation: profile.orientation,
      gender: profile.gender,
      role: profile.chastity_role,
      devices: profile.devices ?? [],
      keys: profile.keys ?? [],
      kinks: profile.kinks ?? []
    }
  });
}
