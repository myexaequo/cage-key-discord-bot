const languages = {
  fr: {
    name: 'Français',
    chooseLanguage: 'Choisis la langue du formulaire',
    serverLanguagesQ: 'Quelles langues veux-tu voir sur le serveur ?',
    ageQ: 'Quelle est ta tranche d’âge ?',
    orientationQ: 'Quelle est ton orientation sexuelle ?',
    genderQ: 'Quel est ton genre ?',
    roleQ: 'Quel est ton rôle ?',
    devicesQ: 'Quels dispositifs utilises-tu ?',
    keysQ: 'Concernant les clés, quelles situations te correspondent ?',
    kinksQ: 'Quels univers ou kinks t’intéressent ?',
    multiple: 'Plusieurs choix possibles.',
    summaryTitle: 'Vérifie ton profil',
    summaryNotice: 'En validant, tu acceptes que les informations renseignées soient visibles sur ton profil par les autres membres du serveur.',
    submit: 'Envoyer ma demande',
    restart: 'Recommencer',
    pending: 'Ta demande a été envoyée et attend la validation d’un modérateur.',
    under18: 'Ce serveur est réservé aux personnes âgées de 18 ans ou plus. Tu ne peux donc pas rejoindre ce serveur. Merci de ta compréhension.',
    accepted: 'Accès autorisé',
    acceptedBody: 'Ta demande a été acceptée. Bienvenue sur Cage & Key !',
    rejected: 'Ta demande d’accès à Cage & Key a été refusée.',
    clarificationTitle: 'Un modérateur a besoin d’une précision',
    reply: 'Répondre',
    profileNotFound: 'Aucun profil validé trouvé pour ce membre.',
    onboardingPending: 'Ta demande est déjà en attente de validation.',
    startAgain: 'Commencer l’inscription'
  },
  nl: {
    name: 'Nederlands',
    chooseLanguage: 'Kies de taal van het formulier',
    serverLanguagesQ: 'Welke talen wil je op de server zien?',
    ageQ: 'Wat is je leeftijdscategorie?',
    orientationQ: 'Wat is je seksuele oriëntatie?',
    genderQ: 'Wat is je gender?',
    roleQ: 'Wat is je rol?',
    devicesQ: 'Welke apparaten gebruik je?',
    keysQ: 'Welke situaties rond de sleutels passen bij jou?',
    kinksQ: 'Welke werelden of kinks interesseren je?',
    multiple: 'Meerdere keuzes mogelijk.',
    summaryTitle: 'Controleer je profiel',
    summaryNotice: 'Door te bevestigen ga je ermee akkoord dat de ingevulde informatie zichtbaar is op je profiel voor andere leden van de server.',
    submit: 'Mijn aanvraag versturen',
    restart: 'Opnieuw beginnen',
    pending: 'Je aanvraag is verstuurd en wacht op goedkeuring door een moderator.',
    under18: 'Deze server is alleen toegankelijk voor personen van 18 jaar of ouder. Je kunt daarom niet deelnemen. Bedankt voor je begrip.',
    accepted: 'Toegang verleend',
    acceptedBody: 'Je aanvraag is goedgekeurd. Welkom bij Cage & Key!',
    rejected: 'Je toegangsaanvraag voor Cage & Key is geweigerd.',
    clarificationTitle: 'Een moderator heeft extra informatie nodig',
    reply: 'Antwoorden',
    profileNotFound: 'Er is geen gevalideerd profiel gevonden voor dit lid.',
    onboardingPending: 'Je aanvraag wacht al op goedkeuring.',
    startAgain: 'Registratie starten'
  },
  en: {
    name: 'English',
    chooseLanguage: 'Choose the form language',
    serverLanguagesQ: 'Which languages do you want to see on the server?',
    ageQ: 'What is your age range?',
    orientationQ: 'What is your sexual orientation?',
    genderQ: 'What is your gender?',
    roleQ: 'What is your role?',
    devicesQ: 'Which devices do you use?',
    keysQ: 'Which key-management situations apply to you?',
    kinksQ: 'Which scenes or kinks are you interested in?',
    multiple: 'You can select more than one.',
    summaryTitle: 'Check your profile',
    summaryNotice: 'By confirming, you agree that the information you entered will be visible on your profile to other server members.',
    submit: 'Send my request',
    restart: 'Start over',
    pending: 'Your request has been sent and is waiting for moderator approval.',
    under18: 'This server is restricted to people aged 18 or older. You therefore cannot join this server. Thank you for understanding.',
    accepted: 'Access granted',
    acceptedBody: 'Your request has been approved. Welcome to Cage & Key!',
    rejected: 'Your access request to Cage & Key has been declined.',
    clarificationTitle: 'A moderator needs more information',
    reply: 'Reply',
    profileNotFound: 'No approved profile was found for this member.',
    onboardingPending: 'Your request is already waiting for approval.',
    startAgain: 'Start registration'
  }
};

const optionLabels = {
  fr: {
    fr: 'FR', nl: 'NL', en: 'EN',
    under18: '-18 ans', '18-20': '18–20 ans', '21-30': '21–30 ans', '31-40': '31–40 ans', '41-50': '41–50 ans', '51-60': '51–60 ans', '61+': '61 ans et +',
    gay: 'Gay', bisexual: 'Bisexuel·le', heterosexual: 'Hétérosexuel·le', pansexual: 'Pansexuel·le', lesbian: 'Lesbienne', asexual: 'Asexuel·le', other: 'Autre',
    cis_man: 'Homme cis', cis_woman: 'Femme cis', trans_man: 'Homme trans', trans_woman: 'Femme trans', nonbinary: 'Non-binaire', genderfluid: 'Genre fluide', agender: 'Agenré·e',
    keyholder: 'Keyholder', locked: 'Locked', switch: 'Switch', curious: 'Curieux·se / pas encore défini',
    flat_cage: 'Cage plate', inverted_cage: 'Cage inversée', mini_cage: 'Mini cage', plastic_cage: 'Cage en plastique', metal_cage: 'Cage en métal', silicone_cage: 'Cage en silicone', chastity_belt: 'Ceinture de chasteté', none_yet: 'Je n’en utilise pas encore',
    holds_keys: 'Je détiens les clés d’une ou plusieurs personnes', other_holds_my_keys: 'Quelqu’un d’autre détient mes clés', keeps_own_keys: 'Je garde mes propres clés', no_key_management: 'Pas de gestion particulière des clés', not_applicable: 'Non applicable / pas encore',
    dom: 'Dom', sub: 'Sub', puppy: 'Puppy', furry: 'Furry', leather: 'Leather', rubber: 'Rubber', sportswear: 'Sportswear', sneakers: 'Sneakers', mx_biker: 'MX / Biker', abdl: 'ABDL', chastity: 'Chasteté'
  },
  nl: {
    fr: 'FR', nl: 'NL', en: 'EN',
    under18: '-18 jaar', '18-20': '18–20 jaar', '21-30': '21–30 jaar', '31-40': '31–40 jaar', '41-50': '41–50 jaar', '51-60': '51–60 jaar', '61+': '61 jaar en ouder',
    gay: 'Gay', bisexual: 'Biseksueel', heterosexual: 'Heteroseksueel', pansexual: 'Panseksueel', lesbian: 'Lesbisch', asexual: 'Aseksueel', other: 'Andere',
    cis_man: 'Cis man', cis_woman: 'Cis vrouw', trans_man: 'Trans man', trans_woman: 'Trans vrouw', nonbinary: 'Non-binair', genderfluid: 'Genderfluïde', agender: 'Agender',
    keyholder: 'Keyholder', locked: 'Locked', switch: 'Switch', curious: 'Nieuwsgierig / nog niet bepaald',
    flat_cage: 'Platte kooi', inverted_cage: 'Omgekeerde kooi', mini_cage: 'Mini-kooi', plastic_cage: 'Plastic kooi', metal_cage: 'Metalen kooi', silicone_cage: 'Siliconen kooi', chastity_belt: 'Kuisheidsgordel', none_yet: 'Ik gebruik er nog geen',
    holds_keys: 'Ik heb de sleutels van één of meerdere personen', other_holds_my_keys: 'Iemand anders heeft mijn sleutels', keeps_own_keys: 'Ik houd mijn eigen sleutels', no_key_management: 'Geen specifieke sleutelregeling', not_applicable: 'Niet van toepassing / nog niet',
    dom: 'Dom', sub: 'Sub', puppy: 'Puppy', furry: 'Furry', leather: 'Leather', rubber: 'Rubber', sportswear: 'Sportswear', sneakers: 'Sneakers', mx_biker: 'MX / Biker', abdl: 'ABDL', chastity: 'Kuisheid'
  },
  en: {
    fr: 'FR', nl: 'NL', en: 'EN',
    under18: 'Under 18', '18-20': '18–20', '21-30': '21–30', '31-40': '31–40', '41-50': '41–50', '51-60': '51–60', '61+': '61+',
    gay: 'Gay', bisexual: 'Bisexual', heterosexual: 'Heterosexual', pansexual: 'Pansexual', lesbian: 'Lesbian', asexual: 'Asexual', other: 'Other',
    cis_man: 'Cis man', cis_woman: 'Cis woman', trans_man: 'Trans man', trans_woman: 'Trans woman', nonbinary: 'Non-binary', genderfluid: 'Genderfluid', agender: 'Agender',
    keyholder: 'Keyholder', locked: 'Locked', switch: 'Switch', curious: 'Curious / not defined yet',
    flat_cage: 'Flat cage', inverted_cage: 'Inverted cage', mini_cage: 'Mini cage', plastic_cage: 'Plastic cage', metal_cage: 'Metal cage', silicone_cage: 'Silicone cage', chastity_belt: 'Chastity belt', none_yet: 'I don’t use one yet',
    holds_keys: 'I hold one or more people’s keys', other_holds_my_keys: 'Someone else holds my keys', keeps_own_keys: 'I keep my own keys', no_key_management: 'No particular key management', not_applicable: 'Not applicable / not yet',
    dom: 'Dom', sub: 'Sub', puppy: 'Puppy', furry: 'Furry', leather: 'Leather', rubber: 'Rubber', sportswear: 'Sportswear', sneakers: 'Sneakers', mx_biker: 'MX / Biker', abdl: 'ABDL', chastity: 'Chastity'
  }
};

export function t(lang = 'fr') {
  return languages[lang] ?? languages.fr;
}

export function label(code, lang = 'fr') {
  return optionLabels[lang]?.[code] ?? optionLabels.fr[code] ?? code;
}

export function labels(codes = [], lang = 'fr') {
  return codes.map((code) => label(code, lang)).join(', ');
}
